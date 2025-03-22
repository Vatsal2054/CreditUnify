'use server';

import { currentUserServer } from '@/lib/auth';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { createStreamableValue } from 'ai/rsc';

export async function processPrompt(prompt: string) {
  const user = await currentUserServer();
  if (!user || !user.id) {
    throw new Error('User not authenticated');
  }

  try {
    if (!prompt || typeof prompt !== 'string') {
      throw new Error(
        'Invalid request: prompt is required and must be a string',
      );
    }

    // Create a streamable value to return to the client
    const stream = createStreamableValue();

    // Check if the user is asking for their credit score
    const creditScoreRegex = /credit\s+score|fico\s+score|credit\s+rating/i;
    const isCreditScoreRequest = creditScoreRegex.test(prompt);

    if (isCreditScoreRequest) {
      (async () => {
        try {
          // Fetch the user's credit score from the API
          const response = await fetch('http://localhost:5000/get-scores', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(
              `Failed to fetch credit score: ${response.statusText}`,
            );
          }

          const creditData = await response.json();

          // Calculate unified score using min-max scaling
          const bureauScores = [];
          let unifiedScore = 'Not available';

          // Collect valid numeric scores
          Object.entries(creditData.creditScores).forEach(([bureau, score]) => {
            if (typeof score === 'number') {
              const range = {
                CIBIL: { min: 300, max: 900 },
                Experian: { min: 300, max: 900 },
                CRIF: { min: 1, max: 999 },
                Equifax: { min: 300, max: 900 },
              }[bureau];

              if (range) {
                // Store the original score and its range for scaling
                //@ts-ignore
                bureauScores.push({
                  bureau,
                  score,
                  originalMin: range.min,
                  originalMax: range.max,
                });
              }
            }
          });

          // Calculate unified score if we have at least one valid score
          if (bureauScores.length > 0) {
            // Calculate normalized scores (300-900 range)
            const normalizedScores = bureauScores.map((item) => {
              const normalized =
                //@ts-ignore
                ((item.score - item.originalMin) /
                  //@ts-ignore
                  (item.originalMax - item.originalMin)) *
                  (900 - 300) +
                300;
              return normalized;
            });

            // Average the normalized scores for the unified score
            //@ts-ignore
            unifiedScore = Math.round(
              normalizedScores.reduce((sum, score) => sum + score, 0) /
                normalizedScores.length,
            );
          }

          // Format the credit score response
          let formattedResponse = `
## Your Credit Score Report

### Unified Credit Score: ${unifiedScore}
*This is a weighted average of all your bureau scores normalized to a 300-900 scale*

### Bureau Scores:
`;

          // Add individual bureau scores
          Object.entries(creditData.creditScores).forEach(([bureau, score]) => {
            formattedResponse += `- **${bureau}**: ${score}\n`;
          });

          // Add account summary
          formattedResponse += `
### Account Summary:
- Active Accounts: ${creditData.accountSummary.totalActiveAccounts}
- Closed Accounts: ${creditData.accountSummary.totalClosedAccounts}
- Outstanding Debt: ₹${creditData.accountSummary.outstandingDebt}
- Recent Enquiries: ${
            creditData.accountSummary.recentEnquiries
              ? creditData.accountSummary.recentEnquiries.length
              : 0
          }

### Payment History:
`;

          // Add payment history
          creditData.paymentHistory.forEach((item) => {
            formattedResponse += `- **${item.month}**: ${item.status}\n`;
          });

          formattedResponse += `
### Report Generated: ${new Date(creditData.recordedAt).toLocaleString()}

Is there anything specific about your credit score you'd like to know more about?
`;

          stream.update(formattedResponse);
          stream.done();
        } catch (error) {
          console.error('Error fetching credit score:', error);
          stream.update(
            "I'm sorry, I couldn't retrieve your credit score at this moment. Please try again later or contact customer support if this issue persists.",
          );
          stream.done();
        }
      })();

      return stream.value;
    }

    // Initialize the Google Generative AI model for non-credit score requests
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    });

    const model = google('gemini-1.5-flash-002', {
      safetySettings: [
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_LOW_AND_ABOVE',
        },
      ],
    });

    // Enhanced system prompt that includes credit score capabilities
    const systemPrompt = `
      You are a specialized financial advisor assistant. 
      
      First, determine if the user's query is related to finance, money, budgeting, investing, 
      credit, loans, mortgages, or other financial topics.
      
      If the query IS financial in nature:
      - Provide helpful, accurate, and concise financial advice
      - Be informative and educational
      - If they ask specifically about their personal credit score, tell them you've already checked it separately
      
      If the query is NOT financial in nature:
      - Politely explain that you're specialized in financial topics only
      - Respond with: "I'm a financial assistant and can only help with finance-related questions. 
        Please ask me about budgeting, investing, saving, credit, or other financial topics."
      - Do not answer non-financial questions
      
      Always maintain a professional and helpful tone.
    `;
    (async () => {
      try {
        const { textStream } = await streamText({
          model: model,
          system: systemPrompt,
          prompt: prompt,
        });

        for await (const text of textStream) {
          stream.update(text);
        }

        stream.done();
      } catch (error) {
        console.error('Error generating response:', error);
        stream.update(
          "I'm sorry, I couldn't process your request at this moment. Please try again later.",
        );
        stream.done();
      }
    })();

    return stream.value;
  } catch (error) {
    console.error('Error processing prompt:', error);
    throw error;
  }
}
