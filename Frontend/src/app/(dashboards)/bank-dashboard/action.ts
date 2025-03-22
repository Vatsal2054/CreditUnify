'use server';

import { db } from '@/lib/db';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// Define the schema for customer search validation
const CustomerSearchSchema = z.object({
  searchType: z.enum(['aadhaar', 'pan']),
  searchValue: z.string().min(1, 'Search value is required'),
});

// Define the schema for risk assessment
const RiskLevels = {
  HIGH: { level: 'High Risk', threshold: 650 },
  MEDIUM: { level: 'Medium Risk', threshold: 750 },
  LOW: { level: 'Low Risk', threshold: Infinity },
};

/**
 * Action to search for a customer by Aadhaar or PAN
 *
 * TODO: Implement proper authentication and authorization checks
 * - Only bank users should be able to access this endpoint
 * - Validate that the bank user has permissions to view this customer's data
 * - Add rate limiting to prevent abuse
 */
export async function searchCustomer(formData: FormData) {
  try {
    const searchType = formData.get('searchType') as string;
    const searchValue = formData.get('searchValue') as string;

    // Validate input data
    const validatedFields = CustomerSearchSchema.safeParse({
      searchType,
      searchValue,
    });

    if (!validatedFields.success) {
      return { error: 'Invalid search parameters' };
    }

    // TODO: Implement proper search query based on database schema
    // In a real implementation, you would query the database like this:
    /*
    const user = await db.user.findFirst({
      where: {
        ...(searchType === 'aadhaar' 
          ? { aadhaarNumber: searchValue } 
          : { PAN: searchValue }),
      },
      include: {
        creditScores: {
          orderBy: {
            recordedAt: 'desc',
          },
        },
        // Include other relevant relations
      },
    });
    */

    // For now, return dummy data
    // In production, this would come from the database
    return {
      success: true,
      data: {
        // User data would be returned here from the database query
      },
    };
  } catch (error) {
    console.error('Search failed:', error);
    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Action to assess customer risk level based on credit score
 *
 * TODO: Implement a more sophisticated risk assessment algorithm that considers:
 * - Credit score trend (improving or declining)
 * - Payment history
 * - Credit utilization
 * - Length of credit history
 * - Types of credit
 * - Recent credit inquiries
 */
export async function assessRiskLevel(userId: string) {
  try {
    // TODO: Implement proper query to get latest credit score
    // In a real implementation, you would query the database like this:
    /*
    const latestScore = await db.creditScore.findFirst({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
    */

    // Get payment history
    // TODO: This would be implemented in a real system to check if payments were missed
    /*
    const paymentHistory = await db.paymentHistory.findMany({
      where: { userId },
      orderBy: { dueDate: 'desc' },
    });
    
    const missedPayments = paymentHistory.filter(payment => payment.status === 'MISSED').length;
    */

    // For now, use dummy data
    const latestScore = { score: 720 };
    const missedPayments = 1;

    // Determine risk level based on score and payment history
    let riskLevel;
    if (latestScore.score < RiskLevels.HIGH.threshold || missedPayments > 3) {
      riskLevel = 'High Risk';
    } else if (
      latestScore.score < RiskLevels.MEDIUM.threshold ||
      missedPayments > 0
    ) {
      riskLevel = 'Medium Risk';
    } else {
      riskLevel = 'Low Risk';
    }

    return {
      success: true,
      data: {
        score: latestScore.score,
        riskLevel,
        factors: {
          missedPayments,
          // Other factors would be included here
        },
      },
    };
  } catch (error) {
    console.error('Risk assessment failed:', error);
    return { error: 'Failed to assess risk level' };
  }
}

/**
 * Action to get a customer's loan history
 */
export async function getCustomerLoanHistory(userId: string) {
  try {
    // TODO: Implement proper query to get loan history
    // This would connect to a loans table that isn't in your current schema
    // You would need to add it to your schema

    // For now, return dummy data
    return {
      success: true,
      data: [
        // Loan data would be returned here
      ],
    };
  } catch (error) {
    console.error('Failed to get loan history:', error);
    return { error: 'Failed to retrieve loan history' };
  }
}

/**
 * Action to get a customer's credit score history
 */
export async function getCreditScoreHistory(userId: string) {
  try {
    // TODO: Implement proper query to get credit score history
    /*
    const creditScores = await db.creditScore.findMany({
      where: { userId },
      orderBy: { recordedAt: 'desc' },
    });
    */

    // For now, return dummy data
    return {
      success: true,
      data: [
        // Credit score history would be returned here
      ],
    };
  } catch (error) {
    console.error('Failed to get credit score history:', error);
    return { error: 'Failed to retrieve credit score history' };
  }
}

const LoanRequestSchema = z.object({
  requestedAmount: z.number().positive(),
  purpose: z.string(),
  requestedTenure: z.number().int().positive(),
  monthlyIncome: z.number().positive(),
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'RETIRED']),
  employmentTenure: z.number().min(0),
});

//GIve suggestions BAsed on Requested Loan and Credit Score
export async function giveSuggestions(loanDetails: number, Details: JSON) {
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
    Details,
  };

  // Create prompt for Gemini
  const prompt = `
    As a financial risk analyst, evaluate this loan application and credit report:
    
    LOAN REQUEST:
    ${JSON.stringify(analysisData.loanRequest, null, 2)}
    
    CREDIT REPORT:
    ${JSON.stringify(analysisData.Details, null, 2)}
    
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
}
