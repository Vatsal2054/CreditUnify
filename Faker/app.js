import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import cors from "cors";
import morgan from "morgan";
import puppeteer from "puppeteer";
import { faker } from "@faker-js/faker";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import seedrandom from "seedrandom";

// Initialize environment variables
dotenv.config();

// Get the directory name using ES Module syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

const API_KEY = "8c53b5c7eacb46c:mqrdcyiidldjq8x";

// Define the URLs - Updated with new loan types
const URLS = {
  car_loan: "https://www.bankbazaar.com/car-loan.html",
  personal_loan: "https://www.bankbazaar.com/personal-loan.html",
  two_wheeler_loan: "https://www.bankbazaar.com/two-wheeler-loan.html",
  used_car_loan: "https://www.bankbazaar.com/used-car-loan.html",
  education_loan: "https://www.bankbazaar.com/education-loan.html",
};

/**
 * Generate random credit inquiries
 * @returns {Array} - List of random credit inquiries
 */
function generateEnquiries() {
  const enquiryTypes = [
    "Credit Card",
    "Personal Loan",
    "Home Loan",
    "Auto Loan",
    "Business Loan",
  ];
  const institutions = [
    "HDFC Bank",
    "ICICI Bank",
    "SBI",
    "Axis Bank",
    "Kotak Mahindra Bank",
  ];

  return Array.from({ length: faker.number.int({ min: 0, max: 5 }) }, () => ({
    date: faker.date.past({ years: 1 }).toISOString().split("T")[0],
    institution: faker.helpers.arrayElement(institutions),
    type: "Hard Inquiry",
    loanType: faker.helpers.arrayElement(enquiryTypes),
    status: faker.helpers.arrayElement(["Approved", "Rejected", "Pending"]),
  }));
}

/**
 * Scrape loan data from BankBazaar website
 * @param {string} loanType - Type of loan to scrape
 * @returns {Promise<Array|Object>} - List of loan data or error object
 */
async function scrapeLoanData(loanType) {
  if (!URLS[loanType]) {
    return {
      error: `Invalid loan type. Choose from: ${Object.keys(URLS).join(", ")}`,
    };
  }

  const url = URLS[loanType];

  try {
    // Send request with headers to mimic a browser
    const response = await axios.get(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    // Load HTML into cheerio
    const $ = cheerio.load(response.data);

    // Find tables on the page
    const tables = $("table");

    if (tables.length === 0) {
      return { message: "No tables found on the page" };
    }

    let loanData = [];

    // Process each table to find the relevant one
    tables.each((tableIndex, tableElement) => {
      // Try to extract headers
      let headers = [];

      // Check if table has thead
      const theadHeaders = $(tableElement).find("thead th, thead td");
      if (theadHeaders.length > 0) {
        theadHeaders.each((i, el) => {
          headers.push($(el).text().trim());
        });
      } else {
        // Try to get headers from first row
        const firstRowCells = $(tableElement).find(
          "tr:first-child td, tr:first-child th"
        );
        firstRowCells.each((i, el) => {
          headers.push($(el).text().trim());
        });
      }

      // Look for keywords that indicate this is a loan table
      const relevantHeaders = [
        "Bank",
        "Interest Rate",
        "Tenure",
        "Name of the Bank",
        "Interest Rate (p.a.)",
      ];
      const isLoanTable = headers.some((header) =>
        relevantHeaders.some((relevantHeader) =>
          header.includes(relevantHeader)
        )
      );

      if (isLoanTable) {
        // Process rows - skip header row if needed
        const rows = $(tableElement).find("tbody tr");

        rows.each((rowIndex, rowElement) => {
          const cells = $(rowElement).find("td");
          if (cells.length > 0) {
            const rowData = {};

            cells.each((cellIndex, cellElement) => {
              if (cellIndex < headers.length) {
                // Get cell text content
                let value = $(cellElement).text().trim().replace(/\s+/g, " ");

                // Check for list items
                const listItems = $(cellElement).find("li");
                if (listItems.length > 0) {
                  const items = [];
                  listItems.each((i, li) => {
                    items.push($(li).text().trim().replace(/\s+/g, " "));
                  });
                  value = items.join("; ");
                }

                rowData[headers[cellIndex]] = value;
              }
            });

            loanData.push(rowData);
          }
        });

        // If we found data in this table, no need to process further tables
        if (loanData.length > 0) {
          return false; // Break the .each() loop
        }
      }
    });

    return loanData;
  } catch (error) {
    console.error(`Error scraping ${loanType} data:`, error.message);
    return { error: `Failed to fetch or process data: ${error.message}` };
  }
}

/**
 * Convert array of objects to CSV and save to file
 * @param {Array} data - Array of objects to convert
 * @param {string} filename - Output filename
 * @returns {Promise<string>} - Path to the saved CSV file
 */
async function saveDataToCsv(data, filename) {
  // Create directory if it doesn't exist
  const dir = path.join(__dirname, "temp");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  const filePath = path.join(dir, filename);

  // Get headers from the first object
  const headers = Object.keys(data[0] || {}).map((id) => ({ id, title: id }));

  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: headers,
  });

  await csvWriter.writeRecords(data);
  return filePath;
}

// API Routes
app.get("/api/loans", async (req, res) => {
  const loanType = req.query.type;
  const outputFormat = req.query.format || "json";

  if (!loanType) {
    return res.status(400).json({
      error: "Loan type query parameter is required",
      available_types: Object.keys(URLS),
    });
  }

  const data = await scrapeLoanData(loanType);

  if (data.error) {
    return res.status(400).json(data);
  }

  if (outputFormat.toLowerCase() === "csv") {
    if (!data || data.length === 0) {
      return res.status(404).send("No data found");
    }

    try {
      const csvPath = await saveDataToCsv(data, `${loanType}_data.csv`);

      // Send file and delete after sending
      res.download(csvPath, `${loanType}_data.csv`, (err) => {
        if (err) {
          console.error("Error sending file:", err);
        }

        // Delete the temporary file
        fs.unlink(csvPath, (unlinkErr) => {
          if (unlinkErr) {
            console.error("Error deleting temporary file:", unlinkErr);
          }
        });
      });
    } catch (error) {
      console.error("Error creating CSV file:", error);
      res.status(500).json({ error: "Failed to generate CSV file" });
    }
  } else {
    // Default is JSON
    return res.json({
      loan_type: loanType,
      count: data.length,
      data: data,
    });
  }
});
app.get("/get-scores", (req, res) => {
  // Define bureau ranges
  const bureaus = [
    { name: "CIBIL", rangeStart: 300, rangeEnd: 900 },
    { name: "Equifax", rangeStart: 300, rangeEnd: 900 },
    { name: "Experian", rangeStart: 300, rangeEnd: 900 },
    { name: "CRIF", rangeStart: 1, rangeEnd: 999 },
  ];

  // Helper function to get random numbers
  const getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  // Helper function to get random element from array
  const getRandomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  // Define credit profile categories and their score ranges
  const creditProfiles = [
    { name: "poor", minScore: 300, maxScore: 579 },
    { name: "fair", minScore: 580, maxScore: 669 },
    { name: "good", minScore: 670, maxScore: 749 },
    { name: "excellent", minScore: 750, maxScore: 850 }
  ];

  // Determine base credit profile
  const baseProfileRoll = Math.random();
  let baseProfile;
  if (baseProfileRoll > 0.8) {
    baseProfile = creditProfiles[3]; // excellent (20% chance)
  } else if (baseProfileRoll > 0.5) {
    baseProfile = creditProfiles[2]; // good (30% chance)
  } else if (baseProfileRoll > 0.2) {
    baseProfile = creditProfiles[1]; // fair (30% chance)
  } else {
    baseProfile = creditProfiles[0]; // poor (20% chance)
  }

  // Generate base score within the profile range
  const baseScore = getRandomInt(baseProfile.minScore, baseProfile.maxScore);

  // Calculate key credit factors based on profile
  let creditFactors = {};
  
  // 1. Payment history (most influential factor ~35%)
  if (baseProfile.name === "excellent") {
    creditFactors.paymentHistory = {
      onTimePayments: getRandomInt(95, 100), // percentage
      latePayments: getRandomInt(0, 1),
      totalPayments: getRandomInt(40, 60)
    };
  } else if (baseProfile.name === "good") {
    creditFactors.paymentHistory = {
      onTimePayments: getRandomInt(85, 94),
      latePayments: getRandomInt(1, 3),
      totalPayments: getRandomInt(30, 45)
    };
  } else if (baseProfile.name === "fair") {
    creditFactors.paymentHistory = {
      onTimePayments: getRandomInt(75, 84),
      latePayments: getRandomInt(3, 5),
      totalPayments: getRandomInt(20, 35)
    };
  } else { // poor
    creditFactors.paymentHistory = {
      onTimePayments: getRandomInt(50, 74),
      latePayments: getRandomInt(5, 10),
      totalPayments: getRandomInt(10, 25)
    };
  }
  
  // 2. Credit utilization (~30%)
  if (baseProfile.name === "excellent") {
    creditFactors.utilization = getRandomInt(1, 20);
  } else if (baseProfile.name === "good") {
    creditFactors.utilization = getRandomInt(21, 40);
  } else if (baseProfile.name === "fair") {
    creditFactors.utilization = getRandomInt(41, 70);
  } else { // poor
    creditFactors.utilization = getRandomInt(71, 100);
  }
  
  // 3. Credit history length (~15%)
  if (baseProfile.name === "excellent") {
    creditFactors.historyLength = getRandomInt(7, 15); // years
  } else if (baseProfile.name === "good") {
    creditFactors.historyLength = getRandomInt(4, 8);
  } else if (baseProfile.name === "fair") {
    creditFactors.historyLength = getRandomInt(2, 5);
  } else { // poor
    creditFactors.historyLength = getRandomInt(0, 3);
  }
  
  // 4. Credit mix (~10%)
  if (baseProfile.name === "excellent") {
    creditFactors.loanMix = getRandomInt(4, 5); // number of different loan types
  } else if (baseProfile.name === "good") {
    creditFactors.loanMix = getRandomInt(3, 4);
  } else if (baseProfile.name === "fair") {
    creditFactors.loanMix = getRandomInt(2, 3);
  } else { // poor
    creditFactors.loanMix = getRandomInt(1, 2);
  }
  
  // 5. Recent inquiries (~10%)
  if (baseProfile.name === "excellent") {
    creditFactors.inquiries = getRandomInt(0, 1);
  } else if (baseProfile.name === "good") {
    creditFactors.inquiries = getRandomInt(1, 2);
  } else if (baseProfile.name === "fair") {
    creditFactors.inquiries = getRandomInt(2, 4);
  } else { // poor
    creditFactors.inquiries = getRandomInt(4, 6);
  }
  
  // Generate credit report data
  const creditReport = {
    personalInfo: {
      name: "Alex Johnson", // Static name
      age: getRandomInt(21, 65),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
    },
    bureauScores: [],
    loans: {
      active: [],
      closed: [],
      rejected: [],
    },
    paymentHistory: {
      onTime: Math.floor(creditFactors.paymentHistory.totalPayments * (creditFactors.paymentHistory.onTimePayments / 100)),
      late: creditFactors.paymentHistory.latePayments,
      totalAccounts: 0, // Will calculate below
    },
    creditUtilization: creditFactors.utilization,
    inquiries: creditFactors.inquiries,
    oldestAccount: {
      type: "",
      age: creditFactors.historyLength,
    },
  };

  // Set oldest account type - higher tier profiles more likely to have mortgage as oldest
  const accountTypesByProfile = {
    "excellent": ["Mortgage", "Auto Loan", "Credit Card", "Personal Loan"],
    "good": ["Credit Card", "Auto Loan", "Mortgage", "Personal Loan"],
    "fair": ["Credit Card", "Personal Loan", "Auto Loan"],
    "poor": ["Credit Card", "Personal Loan"]
  };
  
  creditReport.oldestAccount.type = getRandomElement(accountTypesByProfile[baseProfile.name]);

  // Create score history trend based on credit profile
  // Each bureau gets a consistent history that aligns with the profile
  const generateScoreHistory = (currentScore, bureau, profile) => {
    const months = ["Feb 2025", "Jan 2025", "Dec 2024", "Nov 2024", "Oct 2024", "Sep 2024"];
    const history = [];
    
    // Determine trend pattern based on profile
    let pattern;
    if (profile.name === "excellent") {
      // Excellent profiles have stable or slightly improving scores
      pattern = getRandomElement([
        "stable", // Minimal changes
        "gradual-improvement", // Slow, steady improvement
      ]);
    } else if (profile.name === "good") {
      pattern = getRandomElement([
        "gradual-improvement", // Steady improvement
        "fluctuating-improvement", // Improvement with small setbacks
      ]);
    } else if (profile.name === "fair") {
      pattern = getRandomElement([
        "fluctuating-improvement", // Improvement with setbacks
        "recovery", // Recovering from previous issues
        "recent-dip" // Generally good but recent problems
      ]);
    } else { // poor
      pattern = getRandomElement([
        "declining", // Getting worse
        "early-recovery", // Just starting to recover
        "volatile" // Unstable with big swings
      ]);
    }
    
    // Set starting score (current score)
    let currentPoint = currentScore;
    history.push({ date: months[0], score: currentPoint });
    
    // Apply the pattern to generate history
    for (let i = 1; i < months.length; i++) {
      switch (pattern) {
        case "stable":
          // Very minor fluctuations (-5 to +5)
          currentPoint = Math.max(
            bureau.rangeStart,
            Math.min(bureau.rangeEnd, currentPoint + getRandomInt(-5, 5))
          );
          break;
          
        case "gradual-improvement":
          // Consistent small decreases as we go back in time (-5 to -15)
          currentPoint = Math.max(
            bureau.rangeStart,
            currentPoint - getRandomInt(5, 15)
          );
          break;
          
        case "fluctuating-improvement":
          // Generally decreasing with occasional small increases
          if (Math.random() < 0.25) { // 25% chance of a small increase
            currentPoint = Math.min(
              bureau.rangeEnd,
              currentPoint + getRandomInt(3, 8)
            );
          } else {
            currentPoint = Math.max(
              bureau.rangeStart,
              currentPoint - getRandomInt(10, 20)
            );
          }
          break;
          
        case "recovery":
          // Larger decreases as we go back in time (steeper recovery)
          currentPoint = Math.max(
            bureau.rangeStart,
            currentPoint - getRandomInt(15, 25)
          );
          break;
          
        case "recent-dip":
          // First big drop, then gradually better in the past
          if (i === 1) {
            currentPoint = Math.max(
              bureau.rangeStart,
              currentPoint - getRandomInt(20, 40)
            );
          } else {
            currentPoint = Math.min(
              bureau.rangeEnd,
              currentPoint + getRandomInt(5, 15)
            );
          }
          break;
          
        case "declining":
          // Generally increasing as we go back in time (was better before)
          currentPoint = Math.min(
            bureau.rangeEnd,
            currentPoint + getRandomInt(10, 20)
          );
          break;
          
        case "early-recovery":
          // Small decreases for recent months, then larger drops
          if (i <= 2) {
            currentPoint = Math.max(
              bureau.rangeStart,
              currentPoint - getRandomInt(5, 10)
            );
          } else {
            currentPoint = Math.max(
              bureau.rangeStart,
              currentPoint - getRandomInt(15, 30)
            );
          }
          break;
          
        case "volatile":
          // Significant random changes
          const volatileChange = getRandomInt(-30, 30);
          currentPoint = Math.max(
            bureau.rangeStart,
            Math.min(bureau.rangeEnd, currentPoint + volatileChange)
          );
          break;
      }
      
      history.push({ date: months[i], score: currentPoint });
    }
    
    return history;
  };

  // Generate bureau scores with consistency
  let missingBureauIndex = -1;
  if (Math.random() < 0.25) {
    // 25% chance one bureau is missing
    missingBureauIndex = Math.floor(Math.random() * bureaus.length);
  }

  bureaus.forEach((bureau, index) => {
    // Skip this bureau if it's the missing one
    if (index === missingBureauIndex) {
      return;
    }

    // Add variance to base score for this bureau (±20 points)
    const scoreVariance = getRandomInt(-20, 20);
    const adjustedScore = Math.max(
      bureau.rangeStart, 
      Math.min(bureau.rangeEnd, baseScore + scoreVariance)
    );

    // Generate score history with the pattern appropriate for the credit profile
    const history = generateScoreHistory(adjustedScore, bureau, baseProfile);

    creditReport.bureauScores.push({
      bureau: bureau.name,
      score: adjustedScore,
      rangeStart: bureau.rangeStart,
      rangeEnd: bureau.rangeEnd,
      history: history,
    });
  });

  // Generate loans that match the credit profile
  const loanTypes = ["Mortgage", "Personal Loan", "Auto Loan", "Education Loan", "Credit Card"];
  const lenders = ["CitiBank", "Wells Fargo", "Bank of America", "Chase", "HDFC", "ICICI", "SBI"];
  
  // Select loan types based on profile's loan mix
  const availableLoanTypes = [];
  for (let i = 0; i < creditFactors.loanMix; i++) {
    if (availableLoanTypes.length < loanTypes.length) {
      let newType;
      do {
        newType = getRandomElement(loanTypes);
      } while (availableLoanTypes.includes(newType));
      availableLoanTypes.push(newType);
    }
  }
  
  // Generate active loans
  // Number depends on credit profile but is constrained by loan mix
  const activeLoansCount = Math.min(
    getRandomInt(
      baseProfile.name === "poor" ? 0 : 1,
      baseProfile.name === "excellent" ? 3 : 2
    ),
    availableLoanTypes.length
  );
  
  for (let i = 0; i < activeLoansCount; i++) {
    const loanType = availableLoanTypes[i];
    let loanAmount, emi, remainingTenure;
    
    // Set realistic loan amounts and terms based on type and credit profile
    switch(loanType) {
      case "Mortgage":
        // Better credit profiles get larger loans with longer terms
        if (baseProfile.name === "excellent") {
          loanAmount = getRandomInt(250000, 500000);
          remainingTenure = getRandomInt(180, 240);
        } else if (baseProfile.name === "good") {
          loanAmount = getRandomInt(180000, 300000);
          remainingTenure = getRandomInt(120, 180);
        } else {
          loanAmount = getRandomInt(100000, 200000);
          remainingTenure = getRandomInt(60, 120);
        }
        break;
        
      case "Auto Loan":
        if (baseProfile.name === "excellent") {
          loanAmount = getRandomInt(40000, 80000);
          remainingTenure = getRandomInt(36, 60);
        } else if (baseProfile.name === "good") {
          loanAmount = getRandomInt(25000, 50000);
          remainingTenure = getRandomInt(24, 48);
        } else {
          loanAmount = getRandomInt(15000, 30000);
          remainingTenure = getRandomInt(12, 36);
        }
        break;
        
      case "Personal Loan":
        if (baseProfile.name === "excellent") {
          loanAmount = getRandomInt(25000, 50000);
          remainingTenure = getRandomInt(24, 48);
        } else if (baseProfile.name === "good") {
          loanAmount = getRandomInt(15000, 30000);
          remainingTenure = getRandomInt(18, 36);
        } else {
          loanAmount = getRandomInt(5000, 15000);
          remainingTenure = getRandomInt(12, 24);
        }
        break;
        
      case "Education Loan":
        if (baseProfile.name === "excellent") {
          loanAmount = getRandomInt(50000, 100000);
          remainingTenure = getRandomInt(60, 120);
        } else if (baseProfile.name === "good") {
          loanAmount = getRandomInt(30000, 60000);
          remainingTenure = getRandomInt(48, 84);
        } else {
          loanAmount = getRandomInt(15000, 35000);
          remainingTenure = getRandomInt(36, 60);
        }
        break;
        
      case "Credit Card":
        if (baseProfile.name === "excellent") {
          loanAmount = getRandomInt(5000, 15000);
          remainingTenure = getRandomInt(12, 24);
        } else if (baseProfile.name === "good") {
          loanAmount = getRandomInt(3000, 8000);
          remainingTenure = getRandomInt(6, 18);
        } else {
          loanAmount = getRandomInt(1000, 4000);
          remainingTenure = getRandomInt(3, 12);
        }
        break;
    }
    
    // Calculate realistic EMI based on loan amount, tenure and credit profile
    // Interest rates are higher for lower credit scores
    const interestRates = {
      "excellent": { min: 0.05, max: 0.08 }, // 5-8%
      "good": { min: 0.08, max: 0.12 }, // 8-12%
      "fair": { min: 0.12, max: 0.18 }, // 12-18%
      "poor": { min: 0.18, max: 0.24 }  // 18-24%
    };
    
    const interestRate = getRandomInt(
      interestRates[baseProfile.name].min * 100, 
      interestRates[baseProfile.name].max * 100
    ) / 100;
    
    // Simple EMI calculation: P × r × (1 + r)^n / ((1 + r)^n - 1)
    // where P is principal, r is monthly interest rate, n is tenure in months
    const monthlyRate = interestRate / 12;
    const emiCalculation = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, remainingTenure)) / 
                           (Math.pow(1 + monthlyRate, remainingTenure) - 1);
    emi = Math.round(emiCalculation);
    
    creditReport.loans.active.push({
      type: loanType,
      lender: getRandomElement(lenders),
      amount: loanAmount,
      emi: emi,
      remainingTenure: remainingTenure,
      interestRate: (interestRate * 100).toFixed(2) + "%"
    });
  }

  // Generate closed loans - number correlates with credit history length
  const closedLoansCount = Math.min(
    getRandomInt(0, Math.floor(creditFactors.historyLength / 2)),
    3
  );
  
  const pastMonths = [
    "Jan 2025", "Dec 2024", "Nov 2024", "Oct 2024", "Sep 2024",
    "Aug 2024", "Jul 2024", "Jun 2024", "May 2024", "Apr 2024"
  ];
  
  for (let i = 0; i < closedLoansCount; i++) {
    // Pick a loan type that's not already active if possible
    let loanType;
    const unusedTypes = loanTypes.filter(type => !availableLoanTypes.includes(type));
    if (unusedTypes.length > 0) {
      loanType = getRandomElement(unusedTypes);
      availableLoanTypes.push(loanType); // Add to available types for tracking
    } else {
      loanType = getRandomElement(loanTypes);
    }
    
    let loanAmount;
    
    // Set realistic loan amounts based on type and credit profile
    switch(loanType) {
      case "Mortgage":
        loanAmount = getRandomInt(
          baseProfile.name === "excellent" ? 200000 : 100000,
          baseProfile.name === "excellent" ? 400000 : 250000
        );
        break;
      case "Auto Loan":
        loanAmount = getRandomInt(
          baseProfile.name === "excellent" ? 30000 : 15000,
          baseProfile.name === "excellent" ? 60000 : 40000
        );
        break;
      case "Personal Loan":
        loanAmount = getRandomInt(
          baseProfile.name === "excellent" ? 20000 : 8000,
          baseProfile.name === "excellent" ? 40000 : 25000
        );
        break;
      case "Education Loan":
        loanAmount = getRandomInt(
          baseProfile.name === "excellent" ? 40000 : 10000,
          baseProfile.name === "excellent" ? 80000 : 50000
        );
        break;
      case "Credit Card":
        loanAmount = getRandomInt(
          baseProfile.name === "excellent" ? 3000 : 1000,
          baseProfile.name === "excellent" ? 10000 : 5000
        );
        break;
    }
    
    creditReport.loans.closed.push({
      type: loanType,
      lender: getRandomElement(lenders),
      amount: loanAmount,
      closureDate: getRandomElement(pastMonths),
    });
  }

  // Generate rejected loans - more likely with lower credit scores
  // Probability directly correlates with credit profile
  const rejectionProbabilities = {
    "excellent": 0.05, // 5% chance
    "good": 0.20,      // 20% chance
    "fair": 0.60,      // 60% chance
    "poor": 0.90       // 90% chance
  };
  
  // Check if any rejections should be shown
  let rejectedLoansCount = 0;
  if (Math.random() < rejectionProbabilities[baseProfile.name]) {
    rejectedLoansCount = baseProfile.name === "excellent" ? 1 : 
                        baseProfile.name === "good" ? getRandomInt(1, 1) : 
                        baseProfile.name === "fair" ? getRandomInt(1, 2) : 
                        getRandomInt(1, 3);
  }
  
  // Map rejection reasons to credit profiles
  const rejectionReasonsByProfile = {
    "excellent": ["Income verification needed", "Documentation missing"],
    "good": ["Income insufficient", "Higher debt-to-income ratio than required"],
    "fair": ["Higher debt-to-income ratio than required", "Credit score below threshold", "Recent credit inquiries"],
    "poor": ["Low credit score", "Recent defaults", "Existing high debt", "Employment history issues"]
  };
  
  for (let i = 0; i < rejectedLoansCount; i++) {
    // Rejected loan types - higher value loans more likely to be rejected for lower scores
    let rejectedLoanTypes;
    if (baseProfile.name === "excellent" || baseProfile.name === "good") {
      rejectedLoanTypes = ["Business Loan", "Mortgage", "Personal Loan"];
    } else {
      rejectedLoanTypes = ["Business Loan", "Mortgage", "Personal Loan", "Credit Card", "Auto Loan"];
    }
    
    const loanType = getRandomElement(rejectedLoanTypes);
    let loanAmount;
    
    // Higher amounts for better profiles (they try for bigger loans)
    if (loanType === "Business Loan") {
      loanAmount = getRandomInt(100000, 500000);
    } else if (loanType === "Mortgage") {
      loanAmount = getRandomInt(200000, 400000);
    } else if (loanType === "Personal Loan") {
      loanAmount = getRandomInt(25000, 100000);
    } else if (loanType === "Credit Card") {
      loanAmount = getRandomInt(5000, 20000); // Credit limit
    } else { // Auto Loan
      loanAmount = getRandomInt(30000, 80000);
    }
    
    creditReport.loans.rejected.push({
      type: loanType,
      lender: getRandomElement(lenders),
      amount: loanAmount,
      date: getRandomElement(pastMonths),
      reason: getRandomElement(rejectionReasonsByProfile[baseProfile.name]),
    });
  }

  // Calculate total accounts
  creditReport.paymentHistory.totalAccounts = activeLoansCount + closedLoansCount;

  res.status(200).json(creditReport);
});

app.post("/unified-score", (req, res) => {
  // Loan type preference order - each loan type has preferred bureau order
  const loanPreferences = {
    "Home Loan": ["CIBIL", "CRIF", "Experian", "Equifax"],
    "Personal Loan": ["Experian", "Equifax", "CIBIL", "CRIF"],
    "Auto Loan": ["CRIF", "CIBIL", "Experian", "Equifax"],
    "Credit Card": ["Experian", "Equifax", "CRIF", "CIBIL"],
    "Education Loan": ["CIBIL", "CRIF", "Experian", "Equifax"],
    "Business Loan": ["Equifax", "CRIF", "CIBIL", "Experian"],
  };

  // Bureau priority reasons - explains why each bureau is prioritized for different loan types
  const bureauPriorityReasons = {
    "Home Loan": {
      "CIBIL": "Provides comprehensive history of secured loans and mortgage repayment patterns",
      "CRIF": "Strong coverage of rural and semi-urban lending data important for home loans",
      "Experian": "Good coverage of banking relationships and deposit account history",
      "Equifax": "Additional insights on long-term credit behavior"
    },
    "Personal Loan": {
      "Experian": "Best coverage of unsecured loan history and repayment patterns",
      "Equifax": "Provides detailed consumer spending behavior relevant to personal loans",
      "CIBIL": "Offers standard credit history with wide banking coverage",
      "CRIF": "Supplementary data on alternative lending patterns"
    },
    "Auto Loan": {
      "CRIF": "Specialized in vehicle financing history and auto loan performance",
      "CIBIL": "Good coverage of secured loan repayment history",
      "Experian": "Provides additional insights on consumer debt management",
      "Equifax": "Supplementary data on credit utilization patterns"
    },
    "Credit Card": {
      "Experian": "Best coverage of revolving credit behavior and card utilization",
      "Equifax": "Detailed transaction patterns and spending behavior analysis",
      "CRIF": "Good coverage of card approval and rejection history",
      "CIBIL": "Standard credit information with banking relationship data"
    },
    "Education Loan": {
      "CIBIL": "Strong coverage of student loan history and educational institution data",
      "CRIF": "Better coverage of regional educational loan programs",
      "Experian": "Good insights on income potential and repayment capacity",
      "Equifax": "Additional data on related financial behaviors"
    },
    "Business Loan": {
      "Equifax": "Best commercial credit data and business financial metrics",
      "CRIF": "Strong coverage of SME and business loan performance",
      "CIBIL": "Provides proprietor personal credit history relevant to business",
      "Experian": "Additional commercial credit risk insights"
    }
  };

  // Min-Max Scaling between 300 and 900
  const min = 300;
  const max = 900;

  // Helper function to calculate the unified score
  function calculateUnifiedScore(scores, weights) {
    const availableScores = scores.filter((score) => score !== null && score !== undefined);
    const availableWeights = weights.slice(0, availableScores.length);
    const weightSum = availableWeights.reduce((acc, w) => acc + w, 0);

    // Normalize weights to sum up to 1
    const normalizedWeights = availableWeights.map((w) => w / weightSum);

    // Calculate weighted average
    const unifiedScore = availableScores.reduce((acc, score, index) => acc + score * normalizedWeights[index], 0);

    // Apply Min-Max scaling
    const scaledScore = min + ((unifiedScore - min) / (max - min)) * (max - min);
    return Math.round(scaledScore);
  }

  // Extract loan type and scores from request body
  const { loanType, scores } = req.body;

  if (!loanType || !scores) {
    return res.status(400).json({ error: "Loan type and scores are required" });
  }

  // Check if loan type is valid
  if (!loanPreferences[loanType]) {
    return res.status(400).json({ error: "Invalid loan type" });
  }

  // Get bureau preferences for the loan type
  const loanBureaus = loanPreferences[loanType];

  // Get scores based on the bureau preference order
  const orderedScores = loanBureaus.map((bureau) => scores[bureau] || null);

  // Create detailed breakdown of scores with weights
  const scoreBreakdown = [];
  
  // Assign weights dynamically based on preference order with higher weight for first bureau
  const weights = orderedScores[0] === scores["CIBIL"] ? [0.6, 0.2, 0.15, 0.05] : [0.4, 0.3, 0.2, 0.1];
  
  // Calculate unified score
  const unifiedScore = calculateUnifiedScore(orderedScores, weights);
  
  // Create detailed breakdown with individual bureau contributions
  let totalWeightUsed = 0;
  
  for (let i = 0; i < loanBureaus.length; i++) {
    const bureau = loanBureaus[i];
    const score = scores[bureau];
    
    if (score !== null && score !== undefined) {
      const normalizedWeight = weights[i] / weights.slice(0, orderedScores.filter(s => s !== null && s !== undefined).length).reduce((a, b) => a + b, 0);
      totalWeightUsed += normalizedWeight;
      
      scoreBreakdown.push({
        bureau: bureau,
        score: score,
        weight: normalizedWeight.toFixed(2),
        weightedContribution: Math.round(score * normalizedWeight),
        priorityReason: bureauPriorityReasons[loanType][bureau]
      });
    }
  }

  res.status(200).json({
    loanType: loanType,
    unifiedScore: unifiedScore,
    scoreBreakdown: scoreBreakdown,
    bureauPriorityOrder: loanBureaus,
    missingBureaus: loanBureaus.filter(bureau => scores[bureau] === null || scores[bureau] === undefined)
  });
});



// Get loan interest rates from moneycontrol
app.get("/loan-interest-rates", async (req, res) => {
  try {
    const url = "https://www.moneycontrol.com/loans/";
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const interestRates = await page.evaluate(() => {
      const data = [];
      const rows = document.querySelectorAll(".tbl-loan tr");

      rows.forEach((row) => {
        const bankName = row.querySelector("td:nth-child(1)")?.innerText.trim();
        const loanType = row.querySelector("td:nth-child(2)")?.innerText.trim();
        const interestRate = row
          .querySelector("td:nth-child(3)")
          ?.innerText.trim();

        if (bankName && loanType && interestRate) {
          data.push({ bankName, loanType, interestRate });
        }
      });

      return data;
    });

    await browser.close();

    if (interestRates.length === 0) {
      return res.status(404).json({ message: "No interest rate data found." });
    }

    res.json(interestRates);
  } catch (error) {
    console.error("Error fetching interest rates:", error.message);
    res.status(500).json({ message: "Failed to fetch interest rate data." });
  }
});

// Home page with documentation
app.get("/", (req, res) => {
  res.send(`
    <html>
        <head>
            <title>Bank Loan Data API</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                pre { background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <h1>Bank Loan Data API</h1>
            <p>Use this API to fetch loan data from various sources.</p>
            
            <h2>API Endpoints:</h2>
            
            <h3>GET /api/loans</h3>
            <p>Fetch loan data from BankBazaar based on type.</p>
            
            <h4>Query Parameters:</h4>
            <ul>
                <li><strong>type</strong> (required): Type of loan data to fetch. Options: ${Object.keys(
                  URLS
                ).join(", ")}</li>
                <li><strong>format</strong> (optional): Output format. Options: json (default), csv</li>
            </ul>
            
            <h4>Example:</h4>
            <pre>GET /api/loans?type=car_loan</pre>
            <pre>GET /api/loans?type=personal_loan&format=csv</pre>
            <pre>GET /api/loans?type=two_wheeler_loan</pre>
            <pre>GET /api/loans?type=used_car_loan</pre>
            <pre>GET /api/loans?type=education_loan</pre>
            
            <h3>GET /get-scores</h3>
            <p>Get simulated credit scores from various bureaus.</p>
            
            <h4>Example:</h4>
            <pre>GET /get-scores</pre>
            
            <h3>GET /loan-interest-rates</h3>
            <p>Fetch current loan interest rates from MoneyControl.</p>
            
            <h4>Example:</h4>
            <pre>GET /loan-interest-rates</pre>
            
            <p>For more details, refer to the API documentation.</p>
        </body>
    </html>
  `);
});

export default app; // For testing purposes
