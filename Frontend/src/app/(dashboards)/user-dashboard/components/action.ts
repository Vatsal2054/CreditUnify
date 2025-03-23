"use server"

import { currentUserServer } from "@/lib/auth"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"
import { createStreamableValue } from "ai/rsc"

export async function processPrompt(prompt: string) {
  const user = await currentUserServer()
  if (!user || !user.id) {
    throw new Error("User not authenticated")
  }

  try {
    if (!prompt || typeof prompt !== "string") {
      throw new Error("Invalid request: prompt is required and must be a string")
    }

    // Create a streamable value to return to the client
    const stream = createStreamableValue()

    // Initialize the Google Generative AI model
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY as string,
    })

    const model = google("gemini-1.5-flash-002", {
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_LOW_AND_ABOVE",
        },
      ],
    })

    // Fetch financial data regardless of the prompt
    let creditData = null
    let loanData = null

    try {
      // Fetch the user's credit score from the API
      const creditResponse = await fetch("http://localhost:5000/get-scores", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (creditResponse.ok) {
        creditData = await creditResponse.json()
      } else {
        console.error("Error fetching credit data:", await creditResponse.text())
      }

      // Fix the typo in the endpoint URL
      const loanResponse = await fetch("http://localhost:5000/api/all-loans", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (loanResponse.ok) {
        loanData = await loanResponse.json()
      } else {
        console.error("Error fetching loan data:", await loanResponse.text())
      }
    } catch (error) {
      console.error("Error fetching financial data:", error)
    }

    // Process and enrich credit data
    const processedCreditData = processCreditData(creditData)
    
    // Process and categorize loan data
    const processedLoanData = processLoanData(loanData)

    // Build the system prompt with financial insights
    const systemPrompt = buildSystemPrompt(processedCreditData, processedLoanData)

    // Stream the response to the client
    ;(async () => {
      try {
        const { textStream } = await streamText({
          model: model,
          system: systemPrompt,
          prompt: prompt,
        })

        for await (const text of textStream) {
          stream.update(text)
        }

        stream.done()
      } catch (error) {
        console.error("Error generating response:", error)
        stream.update("I'm sorry, I couldn't process your request at this moment. Please try again later.")
        stream.done()
      }
    })()

    return stream.value
  } catch (error) {
    console.error("Error processing prompt:", error)
    throw error
  }
}

/**
 * Process and enrich the credit data
 */
function processCreditData(creditData) {
  if (!creditData) return null

  // Calculate unified score using min-max scaling if credit data is available
  let unifiedScore:String = "Not available"
  let bureauScores = []
  let creditInsights = []

  if (creditData.bureauScores) {
    // Define valid score ranges for each bureau
    const scoreRanges = {
      CIBIL: { min: 300, max: 900 },
      Experian: { min: 300, max: 900 },
      CRIF: { min: 1, max: 999 },
      Equifax: { min: 300, max: 900 },
    }

    // Collect valid numeric scores
    //@ts-ignore
    bureauScores = Object.entries(creditData.bureauScores)
      .filter(([bureau, score]) => typeof score === "number" && !isNaN(score) && scoreRanges[bureau])
      .map(([bureau, score]) => ({ bureau, score }))

    // Calculate unified score if there are valid scores
    if (bureauScores.length > 0) {
      // Normalize scores to a 300-900 range
      const normalizedScores = bureauScores.map(({ bureau, score }) => {
        const { min, max } = scoreRanges[bureau]
        return ((score - min) / (max - min)) * (900 - 300) + 300
      })

      // Compute the average of normalized scores
      //@ts-ignore
      unifiedScore = Math.round(normalizedScores.reduce((sum, score) => sum + score, 0) / normalizedScores.length)
      
      // Generate credit score insights
      //@ts-ignore
      if (unifiedScore >= 750) {
              //@ts-ignore
        creditInsights.push("Excellent credit score - eligible for premium credit products, Score is"+unifiedScore)
              //@ts-ignore

      } else if (unifiedScore >= 700) {
              //@ts-ignore

        creditInsights.push("Very good credit score - likely to qualify for favorable rates, Score is"+unifiedScore)
              //@ts-ignore

      } else if (unifiedScore >= 650) {
              //@ts-ignore

        creditInsights.push("Good credit score - should qualify for most credit products, Score is"+unifiedScore)
              //@ts-ignore

      } else if (unifiedScore >= 600) {
              //@ts-ignore

        creditInsights.push("Fair credit score - may face higher interest rates, Score is"+unifiedScore)
      } else {
              //@ts-ignore

        creditInsights.push("Poor credit score - may have difficulty qualifying for new credit, Score is"+unifiedScore)
      }
    }
  }

  // Calculate debt-to-income ratio if data is available
  if (creditData.accountSummary && creditData.personalInfo) {
    const monthlyDebt = creditData.loans?.active.reduce((sum, loan) => sum + (loan.emi || 0), 0) || 0
    const income = creditData.personalInfo.income || 0
    
    if (income > 0 && monthlyDebt > 0) {
      const dti = (monthlyDebt / (income / 12)) * 100
      const dtiRounded = Math.round(dti * 100) / 100
      
      if (dtiRounded <= 36) {
              //@ts-ignore

        creditInsights.push(`Healthy debt-to-income ratio (${dtiRounded}%)`)
      } else if (dtiRounded <= 43) {
              //@ts-ignore

        creditInsights.push(`Moderate debt-to-income ratio (${dtiRounded}%)`)
      } else {
              //@ts-ignore

        creditInsights.push(`High debt-to-income ratio (${dtiRounded}%) - may limit new credit`)
      }
    }
  }

  // Check for recent inquiries
  if (creditData.inquiries) {
    if (creditData.inquiries > 3) {
            //@ts-ignore

      creditInsights.push(`High number of recent inquiries (${creditData.inquiries}) - may impact credit score`)
    }
  }
  
  // Analyze payment history
  if (creditData.paymentHistory) {
    const onTime = creditData.paymentHistory.onTime
    const total = creditData.paymentHistory.totalAccounts
    
    if (total > 0) {
      const paymentRatio = onTime / total
      if (paymentRatio >= 0.98) {
              //@ts-ignore

        creditInsights.push("Excellent payment history")
      } else if (paymentRatio >= 0.95) {
              //@ts-ignore

        creditInsights.push("Very good payment history")
      } else if (paymentRatio >= 0.90) {
              //@ts-ignore

        creditInsights.push("Good payment history")
      } else {
              //@ts-ignore

        creditInsights.push("Payment history shows room for improvement")
      }
    }
  }

  return {
    ...creditData,
    unifiedScore,
    bureauScores,
    creditInsights
  }
}

/**
 * Process and categorize loan data
 */
function processLoanData(loanData) {
  if (!loanData || !loanData.data) return null
  
  // Group loans by type
  const loansByType = {}
  
  loanData.data.forEach(loan => {
    if (!loansByType[loan.loan_type]) {
      loansByType[loan.loan_type] = []
    }
    loansByType[loan.loan_type].push(loan)
  })
  
  // Find best offers by loan type
  const bestOffers = {}
  
  Object.entries(loansByType).forEach(([type, loans]) => {
    // Convert interest rates to numeric values for comparison
          //@ts-ignore

    const processedLoans = loans.map(loan => {
      let rate = loan.interest_rate
      
      // Handle different interest rate formats
      if (typeof rate === 'string') {
        // Remove percentage signs and convert to number
        rate = parseFloat(rate.replace(/[^\d.-]/g, ''))
      }
      
      return {
        ...loan,
        numericRate: isNaN(rate) ? 999 : rate // Use high value for invalid rates
      }
    })
    
    // Sort by interest rate (lowest first)
    processedLoans.sort((a, b) => a.numericRate - b.numericRate)
    
    // Get top 3 offers
    bestOffers[type] = processedLoans.slice(0, 3).map(loan => ({
      bank_name: loan.bank_name,
      interest_rate: loan.interest_rate,
      processing_fees: loan.processing_fees,
      loan_amount: loan.loan_amount
    }))
  })
  
  return {
    loansByType,
    bestOffers
  }
}

/**
 * Build a comprehensive system prompt with financial insights
 */
function buildSystemPrompt(creditData, loanData) {
  let systemPrompt = `
    You are a specialized financial advisor assistant. 
    
    First, determine if the user's query is related to finance, money, budgeting, investing, 
    credit, loans, mortgages, or other financial topics.
    
    If the query IS financial in nature:
    - Provide helpful, accurate, and concise financial advice
    - Be informative and educational
    
    If the query is NOT financial in nature:
    - Politely explain that you're specialized in financial topics only
    - Respond with: "I'm a financial assistant and can only help with finance-related questions. 
      Please ask me about budgeting, investing, saving, credit, or other financial topics."
    - Do not answer non-financial questions
    
    Always maintain a professional and helpful tone.
  `

  // Add financial data to the system prompt if available
  if (creditData || loanData) {
    systemPrompt += `\n\nHere is the user's financial data that you can reference in your responses:\n\n`

    if (creditData) {
      systemPrompt += `CREDIT INFORMATION:\n`
      
      // Add unified score
      systemPrompt += `Unified Credit Score: ${creditData.unifiedScore}\n`

      // Add bureau scores
      if (creditData.bureauScores && creditData.bureauScores.length > 0) {
        systemPrompt += `Bureau Scores:\n`
        creditData.bureauScores.forEach(({ bureau, score }) => {
          systemPrompt += `- ${bureau}: ${score}\n`
        })
      }

      // Add account summary
      if (creditData.accountSummary) {
        systemPrompt += `\nAccount Summary:\n`
        systemPrompt += `- Active Accounts: ${creditData.accountSummary.totalActiveAccounts || 'N/A'}\n`
        systemPrompt += `- Closed Accounts: ${creditData.accountSummary.totalClosedAccounts || 'N/A'}\n`
        systemPrompt += `- Outstanding Debt: ₹${creditData.accountSummary.outstandingDebt || 'N/A'}\n`
        systemPrompt += `- Recent Enquiries: ${
          creditData.accountSummary.recentEnquiries ? creditData.accountSummary.recentEnquiries.length : 'N/A'
        }\n`
      }

      // Add active loans
      if (creditData.loans && creditData.loans.active && creditData.loans.active.length > 0) {
        systemPrompt += `\nActive Loans:\n`
        creditData.loans.active.forEach((loan, index) => {
          systemPrompt += `- Loan ${index + 1}: ${loan.type} from ${loan.lender}, Amount: ₹${loan.amount}, EMI: ₹${loan.emi}, Interest: ${loan.interestRate}\n`
        })
      }

      // Add payment history
      if (creditData.paymentHistory) {
        systemPrompt += `\nPayment History:\n`
        systemPrompt += `- On-time payments: ${creditData.paymentHistory.onTime || 'N/A'}\n`
        systemPrompt += `- Total accounts: ${creditData.paymentHistory.totalAccounts || 'N/A'}\n`
      }
      
      // Add credit insights
      if (creditData.creditInsights && creditData.creditInsights.length > 0) {
        systemPrompt += `\nCredit Insights:\n`
        creditData.creditInsights.forEach(insight => {
          systemPrompt += `- ${insight}\n`
        })
      }
    }

    // Add loan marketplace data
    if (loanData && loanData.bestOffers) {
      systemPrompt += `\nBEST LOAN OFFERS AVAILABLE:\n`
      
      Object.entries(loanData.bestOffers).forEach(([type, offers]) => {
        systemPrompt += `\n${type.replace(/_/g, ' ').toUpperCase()}:\n`
              //@ts-ignore

        offers.forEach((offer, index) => {
          systemPrompt += `${index + 1}. ${offer.bank_name}: ${offer.interest_rate}`
          
          if (offer.processing_fees) {
            systemPrompt += `, Processing fees: ${offer.processing_fees}`
          }
          
          if (offer.loan_amount) {
            systemPrompt += `, Loan amount: ₹${offer.loan_amount}`
          }
          
          systemPrompt += `\n`
        })
      })
      
      // Add guidance on how to use this data in responses
      systemPrompt += `\nWhen responding to loan-related queries, compare these market offers with the user's current loans and credit profile. Suggest refinancing opportunities if appropriate based on their credit score and existing debt.`
    }
  }
  
  // Add specific guidance for the AI
  systemPrompt += `\n\nResponse Guidelines:
  1. Always tailor your advice to the user's specific financial situation
  2. Reference their credit score when giving advice about new credit products
  3. If they ask about loans, mention relevant offers from the best loan offers section
  4. When discussing their existing loans, calculate and mention potential savings opportunities
  5. Keep advice practical and actionable
  6. Use specific numbers and figures from their data when relevant
  7. Do not mention "system prompt" or that you were provided with this data - simply use it naturally in your advice
  8. Format the Answer in Markdown make it more readable Use h1,h2, bold etc for more information
  `

  return systemPrompt
}