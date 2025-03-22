'use server';

import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

const LoanRequestSchema = z.object({
  requestedAmount: z.number().positive(),
  purpose: z.string(),
  requestedTenure: z.number().int().positive(),
  monthlyIncome: z.number().positive(),
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'RETIRED']),
  employmentTenure: z.number().min(0),
});

// Give suggestions based on requested loan and credit score
export async function giveSuggestions(loanDetails: any, creditReport: any) {
  const validatedFields = LoanRequestSchema.safeParse(loanDetails);

  if (!validatedFields.success) {
    return {
      error: 'Invalid loan request data',
      details: validatedFields.error.format(),
    };
  }

  // Combine loan request and credit report for analysis
  const analysisData = {
    loanRequest: validatedFields.data,
    creditReport,
  };

  // Create prompt for Gemini
  const prompt = `
    As a financial risk analyst, evaluate this loan application and credit report:
    CONSIDER MONEY IN RS
    
    LOAN REQUEST:
    ${JSON.stringify(analysisData.loanRequest, null, 2)}
    
    CREDIT REPORT:
    ${JSON.stringify(analysisData.creditReport, null, 2)}
    
    Please provide:
    1. DECISION: Either "APPROVE", "REJECT", or "MODIFY"
    2. REASONING: Clear explanation for your decision
    3. RISK FACTORS: Key risks that could affect repayment
    4. RECOMMENDATIONS: If "MODIFY", suggest specific changes to make the loan viable
    
    Format your response as a JSON object with the following structure:
    {
      "decision": "APPROVE|REJECT|MODIFY",
      "reasoning": "Your detailed explanation...",
      "riskFactors": ["Risk 1", "Risk 2", ...],
      "recommendations": ["Recommendation 1", "Recommendation 2", ...]
    }
    `;

  try {
    // Call Gemini API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = await response.text();
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/); // Extracts JSON-like structure

    if (!jsonMatch) {
      console.error('No valid JSON found in response:', textResponse);
      return {
        error: 'Gemini response does not contain valid JSON',
        rawResponse: textResponse,
      };
    }

    try {
      const parsedResponse = JSON.parse(jsonMatch[0]); // Parse the extracted JSON
      return parsedResponse;
    } catch (parseError) {
      console.error(
        'Failed to parse Gemini response:',
        parseError,
        'Raw:',
        textResponse,
      );
      return {
        error: 'Failed to parse analysis response',
        rawResponse: textResponse,
      };
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return {
      error: 'Failed to get AI analysis',
      details: error instanceof Error ? error.message : String(error),
    };
  }
}
