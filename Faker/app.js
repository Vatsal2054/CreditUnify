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

  // Generate credit report data
  const creditReport = {
    personalInfo: {
      // Use a static name instead of generating one
      name: "Alex Johnson",
      age: faker.number.int({ min: 21, max: 65 }),
      address: `${faker.location.streetAddress()}, ${faker.location.city()}, ${faker.location.state()}`,
    },
    bureauScores: [],
    loans: {
      active: [],
      closed: [],
      rejected: [],
    },
    paymentHistory: {
      onTime: faker.number.int({ min: 20, max: 60 }),
      late: faker.number.int({ min: 0, max: 5 }),
      totalAccounts: 0, // Will calculate below
    },
    creditUtilization: faker.number.int({ min: 10, max: 90 }), // percentage
    inquiries: faker.number.int({ min: 0, max: 5 }), // last 12 months
    oldestAccount: {
      type: faker.helpers.arrayElement([
        "Credit Card",
        "Personal Loan",
        "Mortgage",
        "Auto Loan",
      ]),
      age: faker.number.int({ min: 1, max: 15 }), // years
    },
  };

  // Generate bureau scores with 6-month history
  bureaus.forEach((bureau) => {
    // 20% chance the score is not available
    if (Math.random() < 0.2 && creditReport.bureauScores.length < 3) {
      return; // Skip this bureau
    }

    const currentScore = faker.number.int({
      min: bureau.rangeStart,
      max: bureau.rangeEnd,
    });

    // Generate score history (last 6 months)
    const history = [];
    const months = [
      "Feb 2025",
      "Jan 2025",
      "Dec 2024",
      "Nov 2024",
      "Oct 2024",
      "Sep 2024",
    ];

    let scoreVariation = currentScore;
    for (let i = 0; i < months.length; i++) {
      if (i === 0) {
        history.push({ date: months[i], score: scoreVariation });
      } else {
        // Random score decrease as we go back in time (between 5-20 points)
        const decrease = faker.number.int({ min: 5, max: 20 });
        scoreVariation = Math.max(bureau.rangeStart, scoreVariation - decrease);
        history.push({ date: months[i], score: scoreVariation });
      }
    }

    creditReport.bureauScores.push({
      bureau: bureau.name,
      score: currentScore,
      rangeStart: bureau.rangeStart,
      rangeEnd: bureau.rangeEnd,
      history: history,
    });
  });

  // Generate active loans (1-3)
  const activeLoansCount = faker.number.int({ min: 1, max: 3 });
  for (let i = 0; i < activeLoansCount; i++) {
    creditReport.loans.active.push({
      type: faker.helpers.arrayElement([
        "Mortgage",
        "Personal Loan",
        "Auto Loan",
        "Education Loan",
        "Credit Card",
      ]),
      lender: faker.company.name(),
      amount: faker.number.int({ min: 10000, max: 500000 }),
      emi: faker.number.int({ min: 500, max: 5000 }),
      remainingTenure: faker.number.int({ min: 12, max: 240 }),
    });
  }

  // Generate closed loans (0-3)
  const closedLoansCount = faker.number.int({ min: 0, max: 3 });
  for (let i = 0; i < closedLoansCount; i++) {
    const pastMonths = [
      "Jan 2025",
      "Dec 2024",
      "Nov 2024",
      "Oct 2024",
      "Sep 2024",
      "Aug 2024",
      "Jul 2024",
      "Jun 2024",
      "May 2024",
      "Apr 2024",
    ];

    creditReport.loans.closed.push({
      type: faker.helpers.arrayElement([
        "Mortgage",
        "Personal Loan",
        "Auto Loan",
        "Education Loan",
        "Credit Card",
      ]),
      lender: faker.company.name(),
      amount: faker.number.int({ min: 10000, max: 300000 }),
      closureDate: faker.helpers.arrayElement(pastMonths),
    });
  }

  // Generate rejected loans (0-2)
  const rejectedLoansCount = faker.number.int({ min: 0, max: 2 });
  for (let i = 0; i < rejectedLoansCount; i++) {
    const pastMonths = [
      "Jan 2025",
      "Dec 2024",
      "Nov 2024",
      "Oct 2024",
      "Sep 2024",
      "Aug 2024",
      "Jul 2024",
      "Jun 2024",
      "May 2024",
      "Apr 2024",
    ];

    const rejectionReasons = [
      "Existing high debt",
      "Low credit score",
      "Recent defaults",
      "Income insufficient",
      "Employment history issues",
    ];

    creditReport.loans.rejected.push({
      type: faker.helpers.arrayElement([
        "Business Loan",
        "Personal Loan",
        "Mortgage",
        "Credit Card",
      ]),
      lender: faker.company.name(),
      amount: faker.number.int({ min: 50000, max: 500000 }),
      date: faker.helpers.arrayElement(pastMonths),
      reason: faker.helpers.arrayElement(rejectionReasons),
    });
  }

  // Calculate total accounts
  creditReport.paymentHistory.totalAccounts =
    activeLoansCount + closedLoansCount;

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
