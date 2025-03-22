'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, TrendingUp, BarChart3, FileText, CreditCard, Clock, DollarSign } from 'lucide-react';

// This would typically come from your API
const dummyUserData = {
  id: "cuid123456",
  name: "Rajesh Kumar",
  email: "rajesh.kumar@example.com",
  aadhaarNumber: "1234-5678-9012",
  PAN: "ABCDE1234F",
  bankName: "SBI",
  creditScores: [
    { id: "cs1", score: 750, recordedAt: "2024-02-15" },
    { id: "cs2", score: 720, recordedAt: "2023-11-10" },
    { id: "cs3", score: 695, recordedAt: "2023-08-22" },
    { id: "cs4", score: 680, recordedAt: "2023-05-14" },
  ],
  loanHistory: [
    { id: "loan1", type: "Home Loan", amount: 2500000, emi: 18500, startDate: "2020-06-10", status: "Active", installmentsMissed: 0 },
    { id: "loan2", type: "Personal Loan", amount: 500000, emi: 12300, startDate: "2022-01-15", status: "Active", installmentsMissed: 1 },
    { id: "loan3", type: "Car Loan", amount: 800000, emi: 14200, startDate: "2018-11-05", status: "Closed", installmentsMissed: 2 },
  ]
};

const BankDashboard = () => {
  const [searchMode, setSearchMode] = useState('aadhaar');
  const [searchValue, setSearchValue] = useState('');
  const [userData, setUserData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Simulate a search
  const handleSearch = () => {
    setIsSearching(true);
    // In a real app, this would be an API call
    setTimeout(() => {
      setUserData(dummyUserData);
      setIsSearching(false);
    }, 1000);
  };

  // Calculate risk level based on credit score
  const getRiskLevel = (score) => {
    if (score >= 750) return { level: "Low Risk", color: "bg-green-500", icon: <CheckCircle className="h-5 w-5" /> };
    if (score >= 650) return { level: "Medium Risk", color: "bg-yellow-500", icon: <AlertCircle className="h-5 w-5" /> };
    return { level: "High Risk", color: "bg-red-500", icon: <AlertCircle className="h-5 w-5" /> };
  };

  const latestScore = userData?.creditScores[0]?.score || 0;
  const riskInfo = getRiskLevel(latestScore);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Bank Customer Credit Dashboard</h1>
        <p className="text-gray-500">Assess customer credit risk and loan eligibility</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Customer Lookup</CardTitle>
          <CardDescription>Search for a customer by Aadhaar or PAN</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Button 
                variant={searchMode === 'aadhaar' ? "default" : "outline"} 
                onClick={() => setSearchMode('aadhaar')}
              >
                Aadhaar
              </Button>
              <Button 
                variant={searchMode === 'pan' ? "default" : "outline"} 
                onClick={() => setSearchMode('pan')}
              >
                PAN
              </Button>
            </div>
            <Input 
              placeholder={searchMode === 'aadhaar' ? "Enter Aadhaar Number" : "Enter PAN Number"} 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="md:flex-grow"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchValue}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {userData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credit Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-3xl font-bold">{latestScore}</div>
                  <div className={`${riskInfo.color} text-white px-2 py-1 rounded text-xs flex items-center`}>
                    {riskInfo.icon}
                    <span className="ml-1">{riskInfo.level}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Last updated on {userData.creditScores[0].recordedAt}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {userData.loanHistory.filter(loan => loan.status === "Active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total outstanding: ₹{userData.loanHistory
                    .filter(loan => loan.status === "Active")
                    .reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment History</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {userData.loanHistory.reduce((total, loan) => total + loan.installmentsMissed, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Missed installments across all loans
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="creditHistory">Credit History</TabsTrigger>
              <TabsTrigger value="loans">Loan Details</TabsTrigger>
              <TabsTrigger value="riskAnalysis">Risk Analysis</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Name</h3>
                      <p>{userData.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p>{userData.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Aadhaar Number</h3>
                      <p>{userData.aadhaarNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">PAN</h3>
                      <p>{userData.PAN}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Primary Bank</h3>
                      <p>{userData.bankName}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Credit Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Current Credit Score</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-2xl font-bold">{latestScore}</span>
                          <span className={`ml-2 ${riskInfo.color} text-white px-2 py-1 rounded text-xs`}>
                            {riskInfo.level}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Active Loans</h3>
                        <p className="text-2xl font-bold">
                          {userData.loanHistory.filter(loan => loan.status === "Active").length}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Total EMI/Month</h3>
                        <p className="text-2xl font-bold">
                          ₹{userData.loanHistory
                            .filter(loan => loan.status === "Active")
                            .reduce((sum, loan) => sum + loan.emi, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Loan Eligibility Recommendation</h3>
                      <div className="p-4 border rounded">
                        {latestScore >= 750 ? (
                          <p className="text-green-600">
                            Customer has excellent credit score and consistent payment history. 
                            Eligible for premium loan products with preferential interest rates.
                          </p>
                        ) : latestScore >= 650 ? (
                          <p className="text-yellow-600">
                            Customer has a good credit score with minor payment issues. 
                            Standard loan products can be offered with regular interest rates.
                          </p>
                        ) : (
                          <p className="text-red-600">
                            Customer has below average credit score with payment concerns.
                            Consider secured loans only or loans with higher interest rates.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="creditHistory" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Score History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative h-72">
                    {/* This would be a chart in a real application */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-gray-300" />
                      <p className="absolute text-gray-500">Credit Score Chart</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Score History</h3>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-right py-2">Score</th>
                          <th className="text-right py-2">Change</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userData.creditScores.map((score, index) => {
                          const prevScore = index < userData.creditScores.length - 1 ? userData.creditScores[index + 1].score : score.score;
                          const change = score.score - prevScore;
                          return (
                            <tr key={score.id} className="border-b">
                              <td className="py-2">{score.recordedAt}</td>
                              <td className="text-right">{score.score}</td>
                              <td className={`text-right ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {change !== 0 ? (change > 0 ? '+' : '') + change : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="loans" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userData.loanHistory.map(loan => (
                      <div key={loan.id} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{loan.type}</h3>
                            <p className="text-sm text-gray-500">Started: {loan.startDate}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${loan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {loan.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-gray-500">Loan Amount</p>
                            <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Monthly EMI</p>
                            <p className="font-medium">₹{loan.emi.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Missed Installments</p>
                            <p className={`font-medium ${loan.installmentsMissed > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {loan.installmentsMissed}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="riskAnalysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center ${riskInfo.color}`}>
                        {riskInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{riskInfo.level}</h3>
                        <p className="text-gray-500">
                          Based on credit score of {latestScore} and payment history
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Risk Factors</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="border p-4 rounded">
                          <h4 className="font-medium mb-2">Credit Utilization</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">Current</p>
                            <p className={latestScore > 700 ? "text-green-600" : "text-yellow-600"}>65%</p>
                          </div>
                          <div className="mt-2 bg-gray-200 h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Recommendation: Keep utilization below 30% for better score
                          </p>
                        </div>
                        
                        <div className="border p-4 rounded">
                          <h4 className="font-medium mb-2">Payment History</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">Missed Payments</p>
                            <p className={userData.loanHistory.reduce((total, loan) => total + loan.installmentsMissed, 0) > 0 
                              ? "text-red-600" : "text-green-600"}>
                              {userData.loanHistory.reduce((total, loan) => total + loan.installmentsMissed, 0)}
                            </p>
                          </div>
                          <div className="mt-2 bg-gray-200 h-2 rounded-full">
                            <div 
                              className={userData.loanHistory.reduce((total, loan) => total + loan.installmentsMissed, 0) > 0 
                                ? "bg-red-500 h-2 rounded-full" 
                                : "bg-green-500 h-2 rounded-full"} 
                              style={{ width: userData.loanHistory.reduce((total, loan) => total + loan.installmentsMissed, 0) > 0 ? "30%" : "100%" }}>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Recommendation: Maintain consistent on-time payments
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Loan Eligibility Assessment</h3>
                      <div className="border p-4 rounded">
                        <h4 className="font-medium mb-1">Recommended Actions:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {latestScore >= 750 ? (
                            <>
                              <li>Eligible for premium loan products</li>
                              <li>Recommend preferential interest rates</li>
                              <li>Pre-approved for up to ₹30,00,000 home loan</li>
                              <li>Pre-approved for up to ₹5,00,000 personal loan</li>
                            </>
                          ) : latestScore >= 650 ? (
                            <>
                              <li>Eligible for standard loan products</li>
                              <li>Regular interest rates apply</li>
                              <li>Consider up to ₹20,00,000 for home loans</li>
                              <li>Consider up to ₹3,00,000 for personal loans</li>
                              <li>Recommend improving payment consistency</li>
                            </>
                          ) : (
                            <>
                              <li>Limited eligibility - higher risk profile</li>
                              <li>Consider secured loan options only</li>
                              <li>Higher interest rates would apply</li>
                              <li>Require additional guarantor or collateral</li>
                              <li>Recommend credit counseling services</li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BankDashboard;