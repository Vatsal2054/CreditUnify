'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LoanInterestRate {
  bank_name: string; // Changed from bankName to bank
  interest_rate: string; // Changed from interestRate to interest
}

export default function LoanInterestRates() {
  const [interestRates, setInterestRates] = useState<LoanInterestRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLoanType, setSelectedLoanType] = useState('car_loan');

  const loanTypes = [
    { value: 'car_loan', label: 'Car Loans' },
    { value: 'two_wheeler_loan', label: 'Two-Wheeler Loans' },
    { value: 'used_car_loan', label: 'Used Car Loans' },
    { value: 'education_loan', label: 'Education Loans' },
  ];

  const fetchInterestRates = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FAKER_URL}/api/loans?type=${selectedLoanType}`,
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const responseData = await response.json();

      setInterestRates(responseData.data);
    } catch (err) {
      console.error('Failed to fetch interest rates:', err);
      setError('Failed to load interest rates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterestRates();
  }, [selectedLoanType]);

  const handleLoanTypeChange = (value: string) => {
    setSelectedLoanType(value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Current Loan Interest Rates</CardTitle>
            <CardDescription>
              Latest interest rates from major banks
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchInterestRates}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Select value={selectedLoanType} onValueChange={handleLoanTypeChange}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select loan type" />
            </SelectTrigger>
            <SelectContent>
              {loanTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : interestRates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No interest rate data available for{' '}
            {loanTypes.find((t) => t.value === selectedLoanType)?.label ||
              selectedLoanType}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead className="text-right">Interest Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interestRates.map((rate, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {rate.bank_name}
                  </TableCell>
                  <TableCell className="text-right">
                    {rate.interest_rate}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
