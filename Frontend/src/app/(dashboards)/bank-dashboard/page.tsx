'use client';
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  CreditCard,
  Clock,
  Info,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import EnhancedSpeedometer from '@/app/components/Dashboard/Speedometer';
import axios from 'axios';
import CreditScoreChart from '../_components/User/CreditScoreChart';

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

interface UnifiedScoreBreakdown {
  bureau: string;
  score: number;
  weight: string;
  weightedContribution: number;
  priorityReason: string;
}

interface UnifiedScoreResponse {
  loanType: string;
  unifiedScore: number;
  scoreBreakdown: UnifiedScoreBreakdown[];
  bureauPriorityOrder: string[];
  missingBureaus: string[];
}

// Loan preferences for bureau selection
const loanPreferences = {
  'Home Loan': ['CIBIL', 'CRIF', 'Experian', 'Equifax'],
  'Personal Loan': ['Experian', 'Equifax', 'CIBIL', 'CRIF'],
  'Auto Loan': ['CRIF', 'CIBIL', 'Experian', 'Equifax'],
  'Credit Card': ['Experian', 'Equifax', 'CRIF', 'CIBIL'],
  'Education Loan': ['CIBIL', 'CRIF', 'Experian', 'Equifax'],
  'Business Loan': ['Equifax', 'CRIF', 'CIBIL', 'Experian'],
};

// API service functions
const apiService = {
  searchCustomer: async (
    aadhaar: string,
    pan: string,
  ): Promise<CreditReport> => {
    console.log(
      `Making API call to search for customer with Aadhaar: ${aadhaar} and PAN: ${pan}`,
    );
    try {
      const response = await axios.get('http://localhost:5000/get-scores', {
        params: { aadhaar, pan },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching credit data:', error);
      throw error;
    }
  },

  getUnifiedScore: async (
    loanType: string,
    scores: Record<string, number>,
  ): Promise<UnifiedScoreResponse> => {
    console.log(`Making API call to get unified score for ${loanType}`);
    try {
      const response = await axios.post('http://localhost:5000/unified-score', {
        loanType,
        scores,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching unified score data:', error);
      throw error;
    }
  },
};

const BankDashboard = () => {
  const [pan, setPan] = useState<string>('');
  const [aadhaar, setAadhaar] = useState<string>('');
  const [creditReport, setCreditReport] = useState<CreditReport | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoanType, setSelectedLoanType] = useState<string>('');
  const [unifiedScore, setUnifiedScore] = useState<UnifiedScoreResponse | null>(
    null,
  );
  const [isLoadingUnifiedScore, setIsLoadingUnifiedScore] =
    useState<boolean>(false);

  const t = useTranslations('bank');

  // Calculate risk level based on credit score
  const getRiskLevel = (score: number) => {
    if (score >= 750)
      return {
        level: t('riskLevels.low'),
        color: 'bg-green-500',
        icon: <CheckCircle className="h-5 w-5" />,
      };
    if (score >= 650)
      return {
        level: t('riskLevels.medium'),
        color: 'bg-yellow-500',
        icon: <AlertCircle className="h-5 w-5" />,
      };
    return {
      level: t('riskLevels.high'),
      color: 'bg-red-500',
      icon: <AlertCircle className="h-5 w-5" />,
    };
  };

  // Search using the API service
  const handleSearch = async () => {
    if (!pan || !aadhaar) {
      toast.error('Both PAN and Aadhaar are required');
      return;
    }

    // Validate PAN and Aadhaar
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      toast.error('Invalid PAN number');
      return;
    }

    if (!/^\d{12}$/.test(aadhaar)) {
      toast.error('Invalid Aadhaar number');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const data = await apiService.searchCustomer(aadhaar, pan);
      setCreditReport(data);
      // Reset any previous unified score data
      setUnifiedScore(null);
      setSelectedLoanType('');
    } catch (err) {
      console.error('Error searching for customer:', err);
      toast.error('Failed to fetch credit data');
      setCreditReport(null);
    } finally {
      setIsSearching(false);
    }
  };

  // Fetch unified score when loan type is selected
  const handleLoanTypeChange = async (loanType: string) => {
    setSelectedLoanType(loanType);
    setIsLoadingUnifiedScore(true);

    try {
      const scores = creditReport?.bureauScores.reduce((acc, bureau) => {
        acc[bureau.bureau] = bureau.score;
        return acc;
      }, {} as Record<string, number>);

      if (scores) {
        const data = await apiService.getUnifiedScore(loanType, scores);
        setUnifiedScore(data);
      }
    } catch (err) {
      console.error('Error fetching unified score:', err);
      toast.error('Failed to fetch unified score');
      setUnifiedScore(null);
    } finally {
      setIsLoadingUnifiedScore(false);
    }
  };

  const getAllBureauHistory = () => {
    if (!creditReport) return [];

    const allData = [];

    // Get unique dates across all bureaus
    const allDates = new Set();
    creditReport.bureauScores.forEach((bureau) => {
      bureau.history.forEach((item) => {
        allDates.add(item.date);
      });
    });

    // Convert dates to a proper format (e.g., "Feb 2025" to "2025-02-01")
    const parseDate = (dateStr) => {
      const [month, year] = dateStr.split(' ');
      const monthMap = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12',
      };
      return `${year}-${monthMap[month]}-01`; // Use the first day of the month for consistency
    };

    // Sort dates chronologically
    const sortedDates = Array.from(allDates)
      .map((date) => parseDate(date)) // Convert to YYYY-MM-DD format
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime()); // Sort by date

    // Create the combined dataset
    sortedDates.forEach((date) => {
      const dataPoint = { date };

      creditReport.bureauScores.forEach((bureau) => {
        const historyItem = bureau.history.find(
          (item) => parseDate(item.date) === date,
        );
        dataPoint[bureau.bureau] = historyItem ? historyItem.score : null;
      });

      //@ts-ignore
      allData.push(dataPoint);
    });

    return allData;
  };

  // Get the average bureau score
  const getAverageScore = () => {
    if (!creditReport?.bureauScores || creditReport.bureauScores.length === 0)
      return 0;

    const totalScore = creditReport.bureauScores.reduce(
      (sum, bureau) => sum + bureau.score,
      0,
    );
    return Math.round(totalScore / creditReport.bureauScores.length);
  };

  const avgScore = getAverageScore();
  const riskInfo = getRiskLevel(avgScore);

  // Get normalized bureau scores for speedometer
  const getNormalizedBureauScore = () => {
    if (!creditReport?.bureauScores || creditReport.bureauScores.length === 0)
      return null;

    // Just use the first bureau for now
    const bureauScore = creditReport.bureauScores[0];
    return {
      bureau: 'Normalized',
      score: bureauScore.score,
      rangeStart: bureauScore.rangeStart || 300,
      rangeEnd: bureauScore.rangeEnd || 900,
    };
  };

  // Transform credit report data for the UI
  const transformLoanData = () => {
    if (!creditReport) return [];

    const activeLoans = creditReport.loans.active.map((loan) => ({
      ...loan,
      status: 'Active',
      installmentsMissed: 0, // Assuming good standing by default
    }));

    const closedLoans = creditReport.loans.closed.map((loan) => ({
      ...loan,
      status: 'Closed',
      installmentsMissed: 0,
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
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row md:gap-4 md:space-y-0 gap-0 space-y-4">
              <Input
                placeholder="Enter PAN"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                autoComplete='true'
                className="w-full"
                />
              <Input
                placeholder="Enter Aadhaar"
                value={aadhaar}
                autoComplete='true'
                onChange={(e) => setAadhaar(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isSearching || !pan || !aadhaar}
            >
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
          {/* Restructured grid for credit score, loans and payment history */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Credit Score Card - takes half the space */}
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('creditScoreCard.title')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Credit Score Notification */}
                  {!(unifiedScore && !isLoadingUnifiedScore) && (
                    <div className="bg-blue-50 p-3 rounded-md flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-blue-700">
                        The displayed score is normalized using Min-max scaling.
                        To get a specialized unified score for your needs,
                        please select a loan type below.
                      </p>
                    </div>
                  )}

                  {/* Loan Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loan Type
                    </label>
                    <Select
                      value={selectedLoanType}
                      onValueChange={handleLoanTypeChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select loan type" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(loanPreferences).map((loanType) => (
                          <SelectItem key={loanType} value={loanType}>
                            {loanType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Normalized Credit Score Speedometer */}
                  {!(unifiedScore && !isLoadingUnifiedScore) && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">
                        Normalized Credit Score
                      </h3>
                      {getNormalizedBureauScore() && (
                        <EnhancedSpeedometer
                          data={getNormalizedBureauScore()}
                        />
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`${riskInfo.color} text-white p-1 rounded-full flex items-center justify-center`}
                          >
                            {riskInfo.icon}
                          </div>
                          <span className="text-sm font-medium">
                            {riskInfo.level}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {t('creditScoreCard.updateText')}{' '}
                          {creditReport.bureauScores[0]?.history?.[0]?.date ||
                            'Feb 2025'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Unified Score Section - appears when a loan type is selected */}
                  {isLoadingUnifiedScore && (
                    <div className="flex justify-center my-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  )}

                  {unifiedScore && !isLoadingUnifiedScore && (
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-sm font-medium mb-3">
                        Unified Score for {unifiedScore.loanType}
                      </h3>

                      {/* Unified Score Speedometer */}
                      <EnhancedSpeedometer
                        data={{
                          bureau: `Unified (${unifiedScore.loanType})`,
                          score: unifiedScore.unifiedScore,
                          rangeStart: 300,
                          rangeEnd: 900,
                        }}
                      />

                      {/* Score Breakdown */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Score Breakdown
                        </h4>
                        <div className="space-y-2">
                          {unifiedScore.scoreBreakdown.map((item, index) => (
                            <div
                              key={index}
                              className="p-2 bg-gray-50 rounded flex justify-between"
                            >
                              <div>
                                <span className="font-medium">
                                  {item.bureau}
                                </span>
                                <span className="text-sm text-gray-500 ml-2">
                                  (Score: {item.score})
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm">
                                  weight: {item.weight * 100}%
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  Contribution: {item.weightedContribution}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bureau Priority Information */}
                      <div className="mt-4">
                        <h4 className="text-sm font-medium mb-2">
                          Bureau Priority for {unifiedScore.loanType}
                        </h4>
                        <div className="flex space-x-2">
                          {unifiedScore.bureauPriorityOrder.map(
                            (bureau, index) => (
                              <div
                                key={index}
                                className={`px-2 py-1 rounded text-xs ${
                                  unifiedScore.missingBureaus.includes(bureau)
                                    ? 'bg-gray-200 text-gray-600'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {bureau}{' '}
                                {unifiedScore.missingBureaus.includes(bureau) &&
                                  '(Missing)'}
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Vertical Stack for Loans and Payment History */}
            <div className="col-span-1 space-y-4">
              {/* Active Loans Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('activeLoansCard.title')}
                  </CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {creditReport.loans.active.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t('activeLoansCard.totalOutstanding')} ₹
                    {creditReport.loans.active
                      .reduce((sum, loan) => sum + loan.amount, 0)
                      .toLocaleString()}
                  </p>

                  {/* Mini Loan List */}
                  {creditReport.loans.active.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Active Loans</h4>
                      <div className="space-y-2">
                        {creditReport.loans.active
                          .slice(0, 2)
                          .map((loan, index) => (
                            <div
                              key={index}
                              className="p-2 bg-gray-50 rounded-md flex justify-between"
                            >
                              <div>
                                <div className="font-medium">{loan.type}</div>
                                <div className="text-xs text-gray-500">
                                  {loan.lender}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  ₹{loan.amount.toLocaleString()}
                                </div>
                                <div className="text-xs text-gray-500">
                                  EMI: ₹{loan.emi?.toLocaleString() || 'N/A'}
                                </div>
                              </div>
                            </div>
                          ))}
                        {creditReport.loans.active.length > 2 && (
                          <div className="text-center text-sm text-blue-600">
                            + {creditReport.loans.active.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment History Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {t('paymentHistoryCard.title')}
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-3xl font-bold text-green-500">
                        {creditReport.paymentHistory.onTime}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        On-time payments
                      </p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-red-500">
                        {creditReport.paymentHistory.late}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t('paymentHistoryCard.missedInstallments')}
                      </p>
                    </div>
                  </div>

                  {/* Payment History Progress Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Payment History</span>
                      <span>
                        {Math.round(
                          (creditReport.paymentHistory.onTime /
                            creditReport.paymentHistory.totalAccounts) *
                            100,
                        )}
                        % On-time
                      </span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${
                            (creditReport.paymentHistory.onTime /
                              creditReport.paymentHistory.totalAccounts) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Credit Utilization */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Credit Utilization</span>
                      <span>{creditReport.creditUtilization}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          creditReport.creditUtilization <= 30
                            ? 'bg-green-500'
                            : creditReport.creditUtilization <= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${creditReport.creditUtilization}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Account Age Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Credit Account Age
                  </CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="text-3xl font-bold">
                      {creditReport.oldestAccount.age}
                    </div>
                    <div className="ml-2 text-sm text-gray-500">months</div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Oldest account: {creditReport.oldestAccount.type}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">{t('tabs.overview')}</TabsTrigger>
              <TabsTrigger value="creditHistory">
                {t('tabs.creditHistory')}
              </TabsTrigger>
              <TabsTrigger value="loans">{t('tabs.loans')}</TabsTrigger>
              <TabsTrigger value="riskAnalysis">
                {t('tabs.riskAnalysis')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t('sections.customerInfo.title')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        {t('sections.customerInfo.name')}
                      </h3>
                      <p>Rutu Bhimani</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Age</h3>
                      <p>20</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Address
                      </h3>
                      <p>{creditReport.personalInfo.address}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">
                        Inquiries (Last 12 months)
                      </h3>
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
                        <h3 className="text-sm font-medium text-gray-500">
                          {t('sections.creditSummary.currentScore')}
                        </h3>
                        <div className="flex items-center mt-1">
                          <span className="text-2xl font-bold">{avgScore}</span>
                          <span
                            className={`ml-2 ${riskInfo.color} text-white px-2 py-1 rounded text-xs`}
                          >
                            {riskInfo.level}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          {t('sections.creditSummary.activeLoans')}
                        </h3>
                        <p className="text-2xl font-bold">
                          {creditReport.loans.active.length}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">
                          {t('sections.creditSummary.totalEMI')}
                        </h3>
                        <p className="text-2xl font-bold">
                          ₹
                          {creditReport.loans.active
                            .reduce((sum, loan) => sum + (loan.emi || 0), 0)
                            .toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        {t('sections.creditSummary.recommendationTitle')}
                      </h3>
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
                  <div className="relative h-[50vh]">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CreditScoreChart data={getAllBureauHistory()} />
                    </div>
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">
                      {t('sections.creditHistory.scoreHistory')}
                    </h3>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">
                            {t('sections.creditHistory.date')}
                          </th>
                          <th className="text-left py-2">Bureau</th>
                          <th className="text-right py-2">
                            {t('sections.creditHistory.score')}
                          </th>
                          <th className="text-right py-2">
                            {t('sections.creditHistory.change')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {creditReport.bureauScores.flatMap((bureau) =>
                          bureau.history?.map((item, index, array) => {
                            const prevScore =
                              index < array.length - 1
                                ? array[index + 1].score
                                : item.score;
                            const change = item.score - prevScore;
                            return (
                              <tr
                                key={`${bureau.bureau}-${item.date}`}
                                className="border-b"
                              >
                                <td className="py-2">{item.date}</td>
                                <td className="py-2">{bureau.bureau}</td>
                                <td className="text-right">{item.score}</td>
                                <td
                                  className={`text-right ${
                                    change >= 0
                                      ? 'text-green-600'
                                      : 'text-red-600'
                                  }`}
                                >
                                  {change !== 0
                                    ? (change > 0 ? '+' : '') + change
                                    : '-'}
                                </td>
                              </tr>
                            );
                          }),
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
                      <div
                        key={`active-${index}`}
                        className="border rounded p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{loan.type}</h3>
                            <p className="text-sm text-gray-500">
                              Lender: {loan.lender}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                            Active
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-gray-500">
                              {t('sections.loanDetails.loanAmount')}
                            </p>
                            <p className="font-medium">
                              ₹{loan.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              {t('sections.loanDetails.monthlyEMI')}
                            </p>
                            <p className="font-medium">
                              ₹{loan.emi?.toLocaleString() || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Remaining Tenure
                            </p>
                            <p className="font-medium">
                              {loan.remainingTenure} months
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {creditReport.loans.closed.map((loan, index) => (
                      <div
                        key={`closed-${index}`}
                        className="border rounded p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">{loan.type}</h3>
                            <p className="text-sm text-gray-500">
                              Lender: {loan.lender}
                            </p>
                          </div>
                          <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                            Closed
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                          <div>
                            <p className="text-xs text-gray-500">
                              {t('sections.loanDetails.loanAmount')}
                            </p>
                            <p className="font-medium">
                              ₹{loan.amount.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">
                              Closure Date
                            </p>
                            <p className="font-medium">{loan.closureDate}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {creditReport.loans.rejected.length > 0 && (
                      <>
                        <h3 className="font-medium mt-8 mb-2">
                          Rejected Loan Applications
                        </h3>
                        {creditReport.loans.rejected.map((loan, index) => (
                          <div
                            key={`rejected-${index}`}
                            className="border rounded p-4 border-red-100"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-medium">{loan.type}</h3>
                                <p className="text-sm text-gray-500">
                                  Lender: {loan.lender}
                                </p>
                              </div>
                              <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">
                                Rejected
                              </span>
                            </div>

                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              <div>
                                <p className="text-xs text-gray-500">
                                  {t('sections.loanDetails.loanAmount')}
                                </p>
                                <p className="font-medium">
                                  ₹{loan.amount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Application Date
                                </p>
                                <p className="font-medium">{loan.date}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500">
                                  Rejection Reason
                                </p>
                                <p className="font-medium text-red-600">
                                  {loan.reason}
                                </p>
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
                      <div
                        className={`h-16 w-16 rounded-full flex items-center justify-center ${riskInfo.color}`}
                      >
                        {riskInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">
                          {riskInfo.level}
                        </h3>
                        <p className="text-gray-500">
                          {t('sections.riskAnalysis.basedOn', {
                            score: avgScore,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">
                        {t('sections.riskAnalysis.riskFactors')}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="border p-4 rounded">
                          <h4 className="font-medium mb-2">
                            {t('sections.riskAnalysis.creditUtilization')}
                          </h4>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">
                              {t('sections.riskAnalysis.current')}
                            </p>
                            <p
                              className={
                                creditReport.creditUtilization <= 30
                                  ? 'text-green-600'
                                  : creditReport.creditUtilization <= 50
                                  ? 'text-yellow-600'
                                  : 'text-red-600'
                              }
                            >
                              {creditReport.creditUtilization}%
                            </p>
                          </div>
                          <div className="mt-2 bg-gray-200 h-2 rounded-full">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${creditReport.creditUtilization}%`,
                              }}
                            ></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {t(
                              'sections.riskAnalysis.utilizationRecommendation',
                            )}
                          </p>
                        </div>

                        <div className="border p-4 rounded">
                          <h4 className="font-medium mb-2">
                            {t('sections.riskAnalysis.paymentHistory')}
                          </h4>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500">
                              {t('sections.riskAnalysis.missedPayments')}
                            </p>
                            <p
                              className={
                                creditReport.paymentHistory.late > 0
                                  ? 'text-red-600'
                                  : 'text-green-600'
                              }
                            >
                              {creditReport.paymentHistory.late}
                            </p>
                          </div>
                          <div className="mt-2 bg-gray-200 h-2 rounded-full">
                            <div
                              className={
                                creditReport.paymentHistory.late > 0
                                  ? 'bg-red-500 h-2 rounded-full'
                                  : 'bg-green-500 h-2 rounded-full'
                              }
                              style={{
                                width:
                                  creditReport.paymentHistory.late > 0
                                    ? '30%'
                                    : '100%',
                              }}
                            ></div>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            {t('sections.riskAnalysis.paymentRecommendation')}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2">
                        {t('sections.riskAnalysis.loanEligibility')}
                      </h3>
                      <div className="border p-4 rounded">
                        <h4 className="font-medium mb-1">
                          {t('sections.riskAnalysis.recommendedActions')}:
                        </h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {avgScore >= 750 ? (
                            <>
                              <li>
                                {t('loanRecommendations.excellent.eligible')}
                              </li>
                              <li>
                                {t(
                                  'loanRecommendations.excellent.preferentialRates',
                                )}
                              </li>
                              <li>
                                {t('loanRecommendations.excellent.homeLoan')}
                              </li>
                              <li>
                                {t(
                                  'loanRecommendations.excellent.personalLoan',
                                )}
                              </li>
                            </>
                          ) : avgScore >= 650 ? (
                            <>
                              <li>{t('loanRecommendations.good.eligible')}</li>
                              <li>
                                {t('loanRecommendations.good.regularRates')}
                              </li>
                              <li>{t('loanRecommendations.good.homeLoan')}</li>
                              <li>
                                {t('loanRecommendations.good.personalLoan')}
                              </li>
                              <li>
                                {t('loanRecommendations.good.improvePayment')}
                              </li>
                            </>
                          ) : (
                            <>
                              <li>
                                {t(
                                  'loanRecommendations.poor.limitedEligibility',
                                )}
                              </li>
                              <li>
                                {t('loanRecommendations.poor.securedOptions')}
                              </li>
                              <li>
                                {t('loanRecommendations.poor.higherRates')}
                              </li>
                              <li>{t('loanRecommendations.poor.guarantor')}</li>
                              <li>
                                {t('loanRecommendations.poor.counseling')}
                              </li>
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
