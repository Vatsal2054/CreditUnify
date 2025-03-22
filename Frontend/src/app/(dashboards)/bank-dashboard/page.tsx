'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, TrendingUp, BarChart3, FileText, CreditCard, Clock, DollarSign } from 'lucide-react';
import { useTranslations } from 'next-intl';

// Type definitions
interface PersonalInfo {
  id: string;
  name: string;
  email: string;
  aadhaarNumber: string;
  PAN: string;
  bankName: string;
}

interface CreditScore {
  id: string;
  score: number;
  recordedAt: string;
}

interface Loan {
  id: string;
  type: string;
  amount: number;
  emi: number;
  startDate: string;
  status: string;
  installmentsMissed: number;
}

interface UserData {
  personalInfo: PersonalInfo;
  creditScores: CreditScore[];
  loanHistory: Loan[];
}

// DUMMY DATA SECTION: Replace this with API calls in production
const dummyUserData: UserData = {
  personalInfo: {
    id: "cuid123456",
    name: "Rajesh Kumar",
    email: "rajesh.kumar@example.com",
    aadhaarNumber: "1234-5678-9012",
    PAN: "ABCDE1234F",
    bankName: "SBI",
  },
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

// API service functions to replace direct dummy data usage
const apiService = {
  searchCustomer: async (searchMode: 'aadhaar' | 'pan', searchValue: string): Promise<UserData> => {
    console.log(`Making API call to search for customer with ${searchMode}: ${searchValue}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyUserData);
      }, 1000);
    });
  },
  
  getCreditScoreHistory: async (customerId: string): Promise<CreditScore[]> => {
    console.log(`Making API call to get credit history for customer: ${customerId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyUserData.creditScores);
      }, 500);
    });
  },
  
  getLoanHistory: async (customerId: string): Promise<Loan[]> => {
    console.log(`Making API call to get loan history for customer: ${customerId}`);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(dummyUserData.loanHistory);
      }, 500);
    });
  }
};

const BankDashboard = () => {
  const [searchMode, setSearchMode] = useState<'aadhaar' | 'pan'>('aadhaar');
  const [searchValue, setSearchValue] = useState<string>('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const t = useTranslations('bank');

  // Calculate risk level based on credit score
  const getRiskLevel = (score: number) => {
    if (score >= 750) return { level: t('riskLevels.low'), color: "bg-green-500", icon: <CheckCircle className="h-5 w-5" /> };
    if (score >= 650) return { level: t('riskLevels.medium'), color: "bg-yellow-500", icon: <AlertCircle className="h-5 w-5" /> };
    return { level: t('riskLevels.high'), color: "bg-red-500", icon: <AlertCircle className="h-5 w-5" /> };
  };

  // Simulate a search using the API service
  const handleSearch = async () => {
    if (!searchValue) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const data = await apiService.searchCustomer(searchMode, searchValue);
      setUserData(data);
    } catch (err) {
      console.error("Error searching for customer:", err);
      setError(t('errors.customerSearch'));
      setUserData(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch additional customer data after finding a customer
  useEffect(() => {
    if (userData?.personalInfo?.id) {
      setIsLoading(true);
      
      Promise.all([
        apiService.getCreditScoreHistory(userData.personalInfo.id),
        apiService.getLoanHistory(userData.personalInfo.id)
      ])
        .then(([creditScores, loanHistory]) => {
          setUserData(prev => ({
            ...prev!,
            creditScores,
            loanHistory
          }));
        })
        .catch(err => {
          console.error("Error fetching additional data:", err);
          setError(t('errors.additionalData'));
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [userData?.personalInfo?.id, t]);

  const latestScore = userData?.creditScores?.[0]?.score || 0;
  const riskInfo = getRiskLevel(latestScore);

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

      {isLoading && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      )}

      {userData && !isLoading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t('creditScoreCard.title')}</CardTitle>
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
                  {t('creditScoreCard.updateText')} {userData.creditScores[0].recordedAt}
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
                  {userData.loanHistory.filter(loan => loan.status === "Active").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('activeLoansCard.totalOutstanding')} ₹{userData.loanHistory
                    .filter(loan => loan.status === "Active")
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
                  {userData.loanHistory.reduce((total, loan) => total + loan.installmentsMissed, 0)}
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
                      <p>{userData.personalInfo.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('sections.customerInfo.email')}</h3>
                      <p>{userData.personalInfo.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('sections.customerInfo.aadhaarNumber')}</h3>
                      <p>{userData.personalInfo.aadhaarNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('sections.customerInfo.pan')}</h3>
                      <p>{userData.personalInfo.PAN}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">{t('sections.customerInfo.primaryBank')}</h3>
                      <p>{userData.personalInfo.bankName}</p>
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
                          <span className="text-2xl font-bold">{latestScore}</span>
                          <span className={`ml-2 ${riskInfo.color} text-white px-2 py-1 rounded text-xs`}>
                            {riskInfo.level}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">{t('sections.creditSummary.activeLoans')}</h3>
                        <p className="text-2xl font-bold">
                          {userData.loanHistory.filter(loan => loan.status === "Active").length}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">{t('sections.creditSummary.totalEMI')}</h3>
                        <p className="text-2xl font-bold">
                          ₹{userData.loanHistory
                            .filter(loan => loan.status === "Active")
                            .reduce((sum, loan) => sum + loan.emi, 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">{t('sections.creditSummary.recommendationTitle')}</h3>
                      <div className="p-4 border rounded">
                        {latestScore >= 750 ? (
                          <p className="text-green-600">
                            {t('eligibilityRecommendations.excellent')}
                          </p>
                        ) : latestScore >= 650 ? (
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
                          <th className="text-right py-2">{t('sections.creditHistory.score')}</th>
                          <th className="text-right py-2">{t('sections.creditHistory.change')}</th>
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
                  <CardTitle>{t('sections.loanDetails.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {userData.loanHistory.map((loan) => (
                      <div key={loan.id} className="border rounded p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{loan.type}</h3>
                            <p className="text-sm text-gray-500">{t('sections.loanDetails.started')}: {loan.startDate}</p>
                          </div>
                          <span className={`px-2 py-1 rounded text-xs ${loan.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {loan.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-gray-500">{t('sections.loanDetails.loanAmount')}</p>
                            <p className="font-medium">₹{loan.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('sections.loanDetails.monthlyEMI')}</p>
                            <p className="font-medium">₹{loan.emi.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">{t('sections.loanDetails.missedInstallments')}</p>
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
                          {t('sections.riskAnalysis.basedOn', { score: latestScore })}
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
                            <p className={latestScore > 700 ? "text-green-600" : "text-yellow-600"}>65%</p>
                          </div>
                          <div className="mt-2 bg-gray-200 h-2 rounded-full">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {t('sections.riskAnalysis.utilizationRecommendation')}
                          </p>
                        </div>
                        
                        <div className="border p-4 rounded">
                          <h4 className="font-medium mb-2">{t('sections.riskAnalysis.paymentHistory')}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">{t('sections.riskAnalysis.missedPayments')}</p>
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
                          {latestScore >= 750 ? (
                            <>
                              <li>{t('loanRecommendations.excellent.eligible')}</li>
                              <li>{t('loanRecommendations.excellent.preferentialRates')}</li>
                              <li>{t('loanRecommendations.excellent.homeLoan')}</li>
                              <li>{t('loanRecommendations.excellent.personalLoan')}</li>
                            </>
                          ) : latestScore >= 650 ? (
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