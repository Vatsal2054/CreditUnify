'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpIcon,
  ArrowDownIcon,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import EnhancedSpeedometer from '@/app/components/Dashboard/Speedometer';
import CreditScoreChart from '../_components/User/CreditScoreChart';

// Mock API function to simulate data fetching
const fetchUserCreditData = async (id) => {
  // In a real app, this would be an API call
  // Simulating a delay for API fetch
  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    personalInfo: {
      name: 'Alex Johnson',
      age: 32,
      address: '456 Maple Avenue, Springfield, IL',
    },
    bureauScores: [
      {
        bureau: 'CIBIL',
        score: 780,
        rangeStart: 300,
        rangeEnd: 900,
        history: [
          { date: 'Feb 2025', score: 780 },
          { date: 'Jan 2025', score: 765 },
          { date: 'Dec 2024', score: 750 },
          { date: 'Nov 2024', score: 720 },
          { date: 'Oct 2024', score: 710 },
          { date: 'Sep 2024', score: 700 },
        ],
      },
      {
        bureau: 'Equifax',
        score: 820,
        rangeStart: 300,
        rangeEnd: 900,
        history: [
          { date: 'Feb 2025', score: 820 },
          { date: 'Jan 2025', score: 810 },
          { date: 'Dec 2024', score: 800 },
          { date: 'Nov 2024', score: 790 },
          { date: 'Oct 2024', score: 785 },
          { date: 'Sep 2024', score: 770 },
        ],
      },
      {
        bureau: 'Experian',
        score: 740,
        rangeStart: 300,
        rangeEnd: 900,
        history: [
          { date: 'Feb 2025', score: 740 },
          { date: 'Jan 2025', score: 730 },
          { date: 'Dec 2024', score: 720 },
          { date: 'Nov 2024', score: 700 },
          { date: 'Oct 2024', score: 690 },
          { date: 'Sep 2024', score: 670 },
        ],
      },
      // Note: CRIF HighMark is not available in this example
    ],
    loans: {
      active: [
        {
          type: 'Mortgage',
          lender: 'First National Bank',
          amount: 250000,
          emi: 1850,
          remainingTenure: 168,
        },
        {
          type: 'Personal Loan',
          lender: 'Universal Credit',
          amount: 50000,
          emi: 1200,
          remainingTenure: 36,
        },
      ],
      closed: [
        {
          type: 'Auto Loan',
          lender: 'Metro Finance',
          amount: 80000,
          closureDate: 'Oct 2024',
        },
        {
          type: 'Education Loan',
          lender: 'National Education Fund',
          amount: 40000,
          closureDate: 'May 2023',
        },
      ],
      rejected: [
        {
          type: 'Business Loan',
          lender: 'Capital Bank',
          amount: 100000,
          date: 'Aug 2024',
          reason: 'Existing high debt',
        },
      ],
    },
    paymentHistory: {
      onTime: 48,
      late: 2,
      totalAccounts: 6,
    },
    creditUtilization: 28, // percentage
    inquiries: 3, // last 12 months
    oldestAccount: { type: 'Credit Card', age: 8 }, // years
  };
};

export default function CreditDashboard() {
  const [idType, setIdType] = useState('aadhar');
  const [idNumber, setIdNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);

  const handleIdTypeChange = (value) => {
    setIdType(value);
  };

  const handleFetchData = async () => {
    // Validate input
    if (!idNumber.trim()) {
      setError('Please enter a valid ID number');
      return;
    }

    if (idType === 'aadhar' && !/^\d{12}$/.test(idNumber)) {
      setError('Aadhar number must be 12 digits');
      return;
    }

    if (idType === 'pan' && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(idNumber)) {
      setError('PAN must be in the format ABCDE1234F');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const data = await fetchUserCreditData(idNumber);
      setUserData(data);
    } catch (err) {
      setError('Failed to fetch credit data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate credit health indicators based on data
  const getCreditHealthStatus = () => {
    if (!userData) return null;

    // Calculate average score across all bureaus
    const avgScore =
      userData.bureauScores.reduce((acc, bureau) => acc + bureau.score, 0) /
      userData.bureauScores.length;

    // Determine overall status
    let status = 'poor';
    let color = 'destructive';
    let message = 'Your credit score needs improvement';

    if (avgScore >= 750) {
      status = 'excellent';
      color = 'success';
      message = 'Your credit score is excellent';
    } else if (avgScore >= 700) {
      status = 'good';
      color = 'success';
      message = 'Your credit score is good';
    } else if (avgScore >= 650) {
      status = 'fair';
      color = 'warning';
      message = 'Your credit score is fair';
    }

    return { status, color, message, avgScore };
  };

  // Get all bureau history combined for the chart
  const getAllBureauHistory = () => {
    if (!userData) return [];

    const allData = [];

    // Get unique dates across all bureaus
    const allDates = new Set();
    userData.bureauScores.forEach((bureau) => {
      bureau.history.forEach((item) => {
        allDates.add(item.date);
      });
    });

    // Create the combined dataset
    Array.from(allDates)
      .sort()
      .forEach((date) => {
        const dataPoint = { date };

        userData.bureauScores.forEach((bureau) => {
          const historyItem = bureau.history.find((item) => item.date === date);
          dataPoint[bureau.bureau] = historyItem ? historyItem.score : null;
        });

        allData.push(dataPoint);
      });

    return allData;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Credit Score Dashboard
        </h1>
        <p className="text-muted-foreground">
          View your credit scores from multiple bureaus and get insights on your
          credit health.
        </p>
      </div>

      {!userData ? (
        <Card>
          <CardHeader>
            <CardTitle>Enter Your Details</CardTitle>
            <CardDescription>
              Provide your Aadhar or PAN number to fetch your credit details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Tabs defaultValue="aadhar" onValueChange={handleIdTypeChange}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="aadhar">Aadhar Number</TabsTrigger>
                  <TabsTrigger value="pan">PAN Number</TabsTrigger>
                </TabsList>
                <TabsContent value="aadhar" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aadhar">
                      Enter your 12-digit Aadhar Number
                    </Label>
                    <Input
                      id="aadhar"
                      placeholder="XXXX XXXX XXXX"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="pan" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="pan">Enter your PAN</Label>
                    <Input
                      id="pan"
                      placeholder="ABCDE1234F"
                      value={idNumber}
                      onChange={(e) =>
                        setIdNumber(e.target.value.toUpperCase())
                      }
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full"
                onClick={handleFetchData}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Fetch Credit Data'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Personal Info Section */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {userData.personalInfo.name}
                  </h2>
                  <p className="text-muted-foreground">
                    {userData.personalInfo.age} years •{' '}
                    {userData.personalInfo.address}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setUserData(null)}>
                  Change ID
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credit Health Overview */}
          {getCreditHealthStatus() && (
            <Card
              className={`border-l-4 border-${getCreditHealthStatus().color}`}
            >
              <CardHeader className="pb-2">
                <CardTitle>Credit Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-lg font-medium">
                      {getCreditHealthStatus().message}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Average score:{' '}
                      {Math.round(getCreditHealthStatus().avgScore)}
                    </p>
                  </div>
                  <Badge
                    variant={getCreditHealthStatus().color}
                    className="text-lg py-1 px-3"
                  >
                    {getCreditHealthStatus().status.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bureau Scores Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Credit Bureau Scores</h2>

            {/* Main content area - side-by-side layout on larger screens */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left side - Chart takes 7/12 columns on large screens */}
              <Card className="col-span-1 lg:col-span-5 flex flex-col">
                <CardHeader>
                  <CardTitle>Credit Score History</CardTitle>
                  <CardDescription>
                    Track how your credit scores have changed over time
                  </CardDescription>
                </CardHeader>
                <CardContent className='flex-1'>
                  <div className="h-[100%] flex items-center">
                    <CreditScoreChart data={getAllBureauHistory()} />
                  </div>
                </CardContent>
              </Card>

              {/* Right side - Speedometers take 5/12 columns on large screens */}
              <div className="col-span-1 lg:col-span-7">
                <Card>
                  <CardHeader>
                    <CardTitle>Bureau Scores</CardTitle>
                    <CardDescription>
                      Current credit scores from all reporting bureaus
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {/* 2x2 Grid of speedometers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {userData.bureauScores.map((bureau, index) => (
                        <div key={index} className="flex justify-center">
                          <EnhancedSpeedometer data={bureau} />
                        </div>
                      ))}

                      {/* Show "not available" cards if less than 4 bureaus */}
                      {Array.from({
                        length: Math.max(0, 4 - userData.bureauScores.length),
                      }).map((_, index) => (
                        <div
                          key={`empty-${index}`}
                          className="flex justify-center"
                        >
                          <Card className="bg-gray-50 w-full h-full border border-gray-100 p-4 rounded-xl flex flex-col items-center justify-center">
                            <CardHeader className="text-center p-4">
                              <CardTitle className="text-xl text-gray-500">
                                CRIF HighMark
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="text-center py-2">
                              <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">
                                Score not available
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Loan Summary Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Loan Summary</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-lg">Active Loans</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {userData.loans.active.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Total amount: ₹
                    {userData.loans.active
                      .reduce((sum, loan) => sum + loan.amount, 0)
                      .toLocaleString('en-IN')}
                  </p>

                  <ScrollArea className="h-48 mt-4">
                    {userData.loans.active.map((loan, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{loan.type}</div>
                          <Badge variant="outline">{loan.lender}</Badge>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>₹{loan.amount.toLocaleString('en-IN')}</span>
                          <span>{loan.remainingTenure} months left</span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span>
                              EMI: ₹{loan.emi.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                        {index < userData.loans.active.length - 1 && (
                          <Separator className="mt-2" />
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">Closed Loans</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {userData.loans.closed.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fully repaid loans
                  </p>

                  <ScrollArea className="h-48 mt-4">
                    {userData.loans.closed.map((loan, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{loan.type}</div>
                          <Badge variant="outline">{loan.lender}</Badge>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>₹{loan.amount.toLocaleString('en-IN')}</span>
                          <span className="text-green-600">
                            Closed: {loan.closureDate}
                          </span>
                        </div>
                        {index < userData.loans.closed.length - 1 && (
                          <Separator className="mt-2" />
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <CardTitle className="text-lg">
                      Rejected Applications
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {userData.loans.rejected.length}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Loan applications not approved
                  </p>

                  <ScrollArea className="h-48 mt-4">
                    {userData.loans.rejected.map((loan, index) => (
                      <div key={index} className="mb-4">
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{loan.type}</div>
                          <Badge variant="outline">{loan.lender}</Badge>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span>₹{loan.amount.toLocaleString('en-IN')}</span>
                          <span>{loan.date}</span>
                        </div>
                        <div className="mt-1 text-xs text-red-500">
                          Reason: {loan.reason}
                        </div>
                        {index < userData.loans.rejected.length - 1 && (
                          <Separator className="mt-2" />
                        )}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Credit Factors Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Credit Factors</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment History */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                    Payment History
                  </CardTitle>
                  <CardDescription>
                    Your record of paying bills on time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        On-time payments
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        {userData.paymentHistory.onTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Late payments</span>
                      <span className="text-sm font-medium text-red-600">
                        {userData.paymentHistory.late}
                      </span>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">
                          Payment Score
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(
                            (userData.paymentHistory.onTime /
                              (userData.paymentHistory.onTime +
                                userData.paymentHistory.late)) *
                              100,
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={
                          (userData.paymentHistory.onTime /
                            (userData.paymentHistory.onTime +
                              userData.paymentHistory.late)) *
                          100
                        }
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Utilization */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-500" />
                    Credit Utilization
                  </CardTitle>
                  <CardDescription>
                    The amount of available credit you're using
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">
                          {userData.creditUtilization}%
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {userData.creditUtilization <= 30
                            ? 'Good utilization (under 30%)'
                            : 'High utilization (over 30%)'}
                        </p>
                      </div>
                      <div className="h-16 w-16 rounded-full border-8 border-green-200 flex items-center justify-center">
                        <span
                          className={`text-lg font-bold ${
                            userData.creditUtilization <= 30
                              ? 'text-green-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {userData.creditUtilization}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-muted-foreground">
                          Utilization
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {userData.creditUtilization}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            userData.creditUtilization <= 30
                              ? 'bg-green-600'
                              : userData.creditUtilization <= 50
                              ? 'bg-amber-500'
                              : 'bg-red-600'
                          }`}
                          style={{ width: `${userData.creditUtilization}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                        <span>0%</span>
                        <span>30%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Credit Age */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-amber-500" />
                    Credit Age
                  </CardTitle>
                  <CardDescription>
                    The age of your oldest credit account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {userData.oldestAccount.age} years
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Oldest account: {userData.oldestAccount.type}
                    </p>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          userData.oldestAccount.age >= 7
                            ? 'bg-green-600'
                            : userData.oldestAccount.age >= 3
                            ? 'bg-amber-500'
                            : 'bg-red-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (userData.oldestAccount.age / 10) * 100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 year</span>
                      <span>5 years</span>
                      <span>10+ years</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Inquiries */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                    Recent Inquiries
                  </CardTitle>
                  <CardDescription>
                    Credit checks in the last 12 months
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {userData.inquiries}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {userData.inquiries <= 2
                        ? 'Good (2 or fewer)'
                        : 'High number of inquiries'}
                    </p>
                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          userData.inquiries <= 2
                            ? 'bg-green-600'
                            : userData.inquiries <= 4
                            ? 'bg-amber-500'
                            : 'bg-red-600'
                        }`}
                        style={{
                          width: `${Math.min(
                            100,
                            (userData.inquiries / 10) * 100,
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>2-4</span>
                      <span>10+</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recommendations section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Recommendations</h2>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {userData.paymentHistory.late > 0 && (
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 bg-amber-100 p-2 rounded-full">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Set up automatic payments
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You have {userData.paymentHistory.late} late payments.
                          Setting up automatic payments can help you avoid
                          missing due dates.
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.creditUtilization > 30 && (
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 bg-blue-100 p-2 rounded-full">
                        <ArrowDownIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Reduce credit utilization
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Your credit utilization is{' '}
                          {userData.creditUtilization}%. Try to keep it below
                          30% to improve your score.
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.inquiries > 2 && (
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 bg-purple-100 p-2 rounded-full">
                        <AlertCircle className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Limit new credit applications
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You have {userData.inquiries} recent inquiries. Try to
                          space out new credit applications.
                        </p>
                      </div>
                    </div>
                  )}

                  {userData.oldestAccount.age < 3 && (
                    <div className="flex items-start space-x-4">
                      <div className="mt-1 bg-green-100 p-2 rounded-full">
                        <Calendar className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          Keep building credit history
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Your oldest account is only{' '}
                          {userData.oldestAccount.age} years old. Maintain your
                          accounts to build a longer credit history.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Always show this recommendation */}
                  <div className="flex items-start space-x-4">
                    <div className="mt-1 bg-emerald-100 p-2 rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">
                        Monitor your credit regularly
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Regular monitoring helps catch errors and fraud early.
                        Check your reports at least once every 3 months.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
