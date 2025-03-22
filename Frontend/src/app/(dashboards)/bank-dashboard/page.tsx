'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, TrendingUp, BarChart3, FileText, CreditCard, Clock, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

// Type definitions
interface PersonalInfo {
  id?: string;
  name: string;
  email?: string;
  aadhaarNumber?: string;
  PAN?: string;
  bankName?: string;
  age?: number;
  address?: string;
}

interface CreditScore {
  id?: string;
  score: number;
  recordedAt?: string;
  bureau?: string;
  rangeStart?: number;
  rangeEnd?: number;
  history?: Array<{
    date: string;
    score: number;
  }>;
}

interface Loan {
  id?: string;
  type: string;
  lender?: string;
  amount: number;
  emi?: number;
  startDate?: string;
  closureDate?: string;
  date?: string;
  reason?: string;
  status?: string;
  installmentsMissed?: number;
  remainingTenure?: number;
}

interface CreditReport {
  personalInfo: PersonalInfo;
  bureauScores: CreditScore[];
  loans: {
    active: Loan[];
    closed: Loan[];
    rejected: Loan[];
  };
  paymentHistory: {
    onTime: number;
    late: number;
    totalAccounts: number;
  };
  creditUtilization: number;
  inquiries: number;
  oldestAccount: {
    type: string;
    age: number;
  };
}

// API service functions
const apiService = {
  searchCustomer: async (searchMode: 'aadhaar' | 'pan', searchValue: string): Promise<CreditReport> => {
    console.log(`Making API call to search for customer with ${searchMode}: ${searchValue}`);
    try {
      const response = await fetch('http://localhost:5000/get-scores');
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching credit data:', error);
      throw error;
    }
  }
};

const BankDashboard = () => {
  const [searchMode, setSearchMode] = useState<'aadhaar' | 'pan'>('aadhaar');
  const [searchValue, setSearchValue] = useState<string>('');
  const [creditReport, setCreditReport] = useState<CreditReport | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations('bank');

  // Calculate risk level based on credit score
  const getRiskLevel = (score: number) => {
    if (score >= 750) return { level: t('riskLevels.low'), color: "bg-green-500", icon: <CheckCircle className="h-5 w-5" /> };
    if (score >= 650) return { level: t('riskLevels.medium'), color: "bg-yellow-500", icon: <AlertCircle className="h-5 w-5" /> };
    return { level: t('riskLevels.high'), color: "bg-red-500", icon: <AlertCircle className="h-5 w-5" /> };
  };

  // Search using the API service
  const handleSearch = async () => {
    if (!searchValue) return;
    
    // Validate input
    if (searchMode === 'aadhaar' && !/^\d{12}$/.test(searchValue)) {
      toast.error("Invalid Adhaar number");
      return;
    }

    if (searchMode === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(searchValue)) {
      toast.error("Invalid PAN number");
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const data = await apiService.searchCustomer(searchMode, searchValue);
      setCreditReport(data);
    } catch (err) {
      console.error("Error searching for customer:", err);
      toast.error("Failed to fetch credit data");
      setCreditReport(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Get the average bureau score
  const getAverageScore = () => {
    if (!creditReport?.bureauScores || creditReport.bureauScores.length === 0) return 0;
    
    const totalScore = creditReport.bureauScores.reduce((sum, bureau) => sum + bureau.score, 0);
    return Math.round(totalScore / creditReport.bureauScores.length);
  };

  const avgScore = getAverageScore();
  const riskInfo = getRiskLevel(avgScore);

  // Transform credit report data for the UI
  const transformLoanData = () => {
    if (!creditReport) return [];
    
    const activeLoans = creditReport.loans.active.map(loan => ({
      ...loan,
      status: 'Active',
      installmentsMissed: 0 // Assuming good standing by default
    }));
    
    const closedLoans = creditReport.loans.closed.map(loan => ({
      ...loan,
      status: 'Closed',
      installmentsMissed: 0
    }));
    
    return [...activeLoans, ...closedLoans];
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-gray-500">{t('description')}</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>{t('customerLookup.title')}</CardTitle>
          <CardDescription>{t('customerLookup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Button 
                variant={searchMode === 'aadhaar' ? "default" : "outline"} 
                onClick={() => setSearchMode('aadhaar')}
              >
                {t('searchModes.aadhaar')}
              </Button>
              <Button 
                variant={searchMode === 'pan' ? "default" : "outline"} 
                onClick={() => setSearchMode('pan')}
              >
                {t('searchModes.pan')}
              </Button>
            </div>
            <Input 
              placeholder={searchMode === 'aadhaar' ? t('placeholders.aadhaar') : t('placeholders.pan')} 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="md:flex-grow"
            />
            <Button onClick={handleSearch} disabled={isSearching || !searchValue}>
              {isSearching ? t('buttons.searching') : t('buttons.search')}
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {isSearching && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {creditReport && !isSearching && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('creditScoreCard.title')}</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className="text-3xl font-bold">{avgScore}</div>
                  <div className={`${riskInfo.color} text-white px-2 py-1 rounded text-xs flex items-center`}>
                    {riskInfo.icon}
                    <span className="ml-1">{riskInfo.level}</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                 
                  {t('creditScoreCard.updateText')} {
                     //@ts-ignore
                  creditReport.bureauScores[0]?.history[0]?.date || 'Feb 2025'}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('activeLoansCard.title')}</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {creditReport.loans.active.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('activeLoansCard.totalOutstanding')} ₹{creditReport.loans.active
                    .reduce((sum, loan) => sum + loan.amount, 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('paymentHistoryCard.title')}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {creditReport.paymentHistory.late}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('paymentHistoryCard.missedInstallments')}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
              <TabsTrigger value="creditHistory">{t('tabs.creditHistory')}</TabsTrigger>
              <TabsTrigger value="loans">{t('tabs.loans')}</TabsTrigger>
              <TabsTrigger value="riskAnalysis">{t('tabs.riskAnalysis')}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('sections.customerInfo.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('sections.customerInfo.name')}</h3>
                      <p>Rutu Bhiamni</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Age</h3>
                      <p>20</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p>{creditReport.personalInfo.address}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Inquiries (Last 12 months)</h3>
                      <p>{creditReport.inquiries}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>{t('sections.creditSummary.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">{t('sections.creditSummary.currentScore')}</h3>
                        <div className="flex items-center mt-1">
                          <span className="text-2xl font-bold">{avgScore}</span>
                          <span className={`ml-2 ${riskInfo.color} text-white px-2 py-1 rounded text-xs`}>
                            {riskInfo.level}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">{t('sections.creditSummary.activeLoans')}</h3>
                        <p className="text-2xl font-bold">
                          {creditReport.loans.active.length}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">{t('sections.creditSummary.totalEMI')}</h3>
                        <p className="text-2xl font-bold">
                          ₹{creditReport.loans.active
                            .reduce((sum, loan) => sum + (loan.emi || 0), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{t('sections.creditSummary.recommendationTitle')}</h3>
                      <div className="p-4 border rounded">
                        {avgScore >= 750 ? (
                          <p className="text-green-600">
                            {t('eligibilityRecommendations.excellent')}
                          </p>
                        ) : avgScore >= 650 ? (
                          <p className="text-yellow-600">
                            {t('eligibilityRecommendations.good')}
                          </p>
                        ) : (
                          <p className="text-red-600">
                            {t('eligibilityRecommendations.belowAverage')}
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
                  <CardTitle>{t('sections.creditHistory.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* TODO: Replace with a real chart component in production */}
                  <div className="relative h-72">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BarChart3 className="h-16 w-16 text-gray-300" />
                      <p className="absolute text-gray-500">{t('sections.creditHistory.chart')}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">{t('sections.creditHistory.scoreHistory')}</h3>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">{t('sections.creditHistory.date')}</th>
                          <th className="text-left py-2">Bureau</th>
                          <th className="text-right py-2">{t('sections.creditHistory.score')}</th>
                          <th className="text-right py-2">{t('sections.creditHistory.change')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditReport.bureauScores.flatMap(bureau => 
                          bureau.history?.map((item, index, array) => {
                            const prevScore = index < array.length - 1 ? array[index + 1].score : item.score;
                            const change = item.score - prevScore;
                            return (
                              <tr key={`${bureau.bureau}-${item.date}`} className="border-b">
                                <td className="py-2">{item.date}</td>
                                <td className="py-2">{bureau.bureau}</td>
                                <td className="text-right">{item.score}</td>
                                <td className={`text-right ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {change !== 0 ? (change > 0 ? '+' : '') + change : '-'}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="loans" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('sections.loanDetails.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {creditReport.loans.active.map((loan, index) => (
                      <div key={`active-${index}`} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{loan.type}</h3>
                            <p className="text-sm text-gray-500">Lender: {loan.lender}</p>
                          </div>
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-gray-500">{t('sections.loanDetails.loanAmount')}</p>
                            <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('sections.loanDetails.monthlyEMI')}</p>
                            <p className="font-medium">₹{loan.emi?.toLocaleString() || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Remaining Tenure</p>
                            <p className="font-medium">{loan.remainingTenure} months</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {creditReport.loans.closed.map((loan, index) => (
                      <div key={`closed-${index}`} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{loan.type}</h3>
                            <p className="text-sm text-gray-500">Lender: {loan.lender}</p>
                          </div>
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                            Closed
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-gray-500">{t('sections.loanDetails.loanAmount')}</p>
                            <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Closure Date</p>
                            <p className="font-medium">{loan.closureDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {creditReport.loans.rejected.length > 0 && (
                      <>
                        <h3 className="font-medium mt-8 mb-2">Rejected Loan Applications</h3>
                        {creditReport.loans.rejected.map((loan, index) => (
                          <div key={`rejected-${index}`} className="border rounded p-4 border-red-100">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{loan.type}</h3>
                                <p className="text-sm text-gray-500">Lender: {loan.lender}</p>
                              </div>
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                Rejected
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-gray-500">{t('sections.loanDetails.loanAmount')}</p>
                                <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Application Date</p>
                                <p className="font-medium">{loan.date}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">Rejection Reason</p>
                                <p className="font-medium text-red-600">{loan.reason}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="riskAnalysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('sections.riskAnalysis.title')}</CardTitle>
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
                          {t('sections.riskAnalysis.basedOn', { score: avgScore })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">{t('sections.riskAnalysis.riskFactors')}</h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="border p-4 rounded">
                          <h4 className="font-medium mb-2">{t('sections.riskAnalysis.creditUtilization')}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">{t('sections.riskAnalysis.current')}</p>
                            <p className={creditReport.creditUtilization <= 30 ? "text-green-600" : 
                                creditReport.creditUtilization <= 50 ? "text-yellow-600" : "text-red-600"}>
                              {creditReport.creditUtilization}%
                            </p>
                          </div>
                          <div className="mt-2 bg-gray-200 h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${creditReport.creditUtilization}%` }}></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {t('sections.riskAnalysis.utilizationRecommendation')}
                          </p>
                        </div>
                        
                        <div className="border p-4 rounded">
                          <h4 className="font-medium mb-2">{t('sections.riskAnalysis.paymentHistory')}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">{t('sections.riskAnalysis.missedPayments')}</p>
                            <p className={creditReport.paymentHistory.late > 0 
                              ? "text-red-600" : "text-green-600"}>
                              {creditReport.paymentHistory.late}
                            </p>
                          </div>
                          <div className="mt-2 bg-gray-200 h-2 rounded-full">
                            <div 
                              className={creditReport.paymentHistory.late > 0 
                                ? "bg-red-500 h-2 rounded-full" 
                                : "bg-green-500 h-2 rounded-full"} 
                              style={{ width: creditReport.paymentHistory.late > 0 ? "30%" : "100%" }}>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {t('sections.riskAnalysis.paymentRecommendation')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">{t('sections.riskAnalysis.loanEligibility')}</h3>
                      <div className="border p-4 rounded">
                        <h4 className="font-medium mb-1">{t('sections.riskAnalysis.recommendedActions')}:</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {avgScore >= 750 ? (
                            <>
                              <li>{t('loanRecommendations.excellent.eligible')}</li>
                              <li>{t('loanRecommendations.excellent.preferentialRates')}</li>
                              <li>{t('loanRecommendations.excellent.homeLoan')}</li>
                              <li>{t('loanRecommendations.excellent.personalLoan')}</li>
                            </>
                          ) : avgScore >= 650 ? (
                            <>
                              <li>{t('loanRecommendations.good.eligible')}</li>
                              <li>{t('loanRecommendations.good.regularRates')}</li>
                              <li>{t('loanRecommendations.good.homeLoan')}</li>
                              <li>{t('loanRecommendations.good.personalLoan')}</li>
                              <li>{t('loanRecommendations.good.improvePayment')}</li>
                            </>
                          ) : (
                            <>
                              <li>{t('loanRecommendations.poor.limitedEligibility')}</li>
                              <li>{t('loanRecommendations.poor.securedOptions')}</li>
                              <li>{t('loanRecommendations.poor.higherRates')}</li>
                              <li>{t('loanRecommendations.poor.guarantor')}</li>
                              <li>{t('loanRecommendations.poor.counseling')}</li>
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