'use client';

import type React from 'react';
import { useState } from 'react';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { giveSuggestions } from './action';

// Schema for loan request validation
const LoanRequestSchema = z.object({
  requestedAmount: z.number().positive(),
  purpose: z.string().min(3),
  requestedTenure: z.number().int().positive(),
  monthlyIncome: z.number().positive(),
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'BUSINESS', 'RETIRED']),
  employmentTenure: z.number().min(0),
});

type LoanRequest = z.infer<typeof LoanRequestSchema>;

interface RiskAssessmentResult {
  decision: 'APPROVE' | 'REJECT' | 'MODIFY';
  reasoning: string;
  riskFactors: string[];
  recommendations: string[];
  error?: string;
}

export default function LoanRiskForm({ creditReport }: { creditReport: any }) {
  const [loanRequest, setLoanRequest] = useState<Partial<LoanRequest>>({
    employmentType: 'SALARIED',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<RiskAssessmentResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof LoanRequest, value: string) => {
    if (field === 'employmentType') {
      //@ts-ignore
      setLoanRequest({ ...loanRequest, [field]: value });
      return;
    }

    // Convert numeric fields to numbers
    const numericFields = [
      'requestedAmount',
      'requestedTenure',
      'monthlyIncome',
      'employmentTenure',
    ];
    const newValue = numericFields.includes(field) ? Number(value) || 0 : value;

    setLoanRequest({ ...loanRequest, [field]: newValue });

    // Clear error for this field if it exists
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Check required fields
    if (!loanRequest.requestedAmount || loanRequest.requestedAmount <= 0) {
      newErrors.requestedAmount = 'Please enter a valid loan amount';
    }

    if (!loanRequest.purpose || loanRequest.purpose.trim().length < 3) {
      newErrors.purpose = 'Please enter a valid loan purpose';
    }

    if (!loanRequest.requestedTenure || loanRequest.requestedTenure <= 0) {
      newErrors.requestedTenure = 'Please enter a valid loan tenure';
    }

    if (!loanRequest.monthlyIncome || loanRequest.monthlyIncome <= 0) {
      newErrors.monthlyIncome = 'Please enter a valid monthly income';
    }

    if (
      loanRequest.employmentTenure === undefined ||
      loanRequest.employmentTenure < 0
    ) {
      newErrors.employmentTenure = 'Please enter a valid employment tenure';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the server action with loan request and credit report
      const assessmentResult = await giveSuggestions(loanRequest, creditReport);
      console.log(assessmentResult);

      if (assessmentResult.error) {
        toast.error(assessmentResult.error);
        return;
      }

      setResult(assessmentResult as RiskAssessmentResult);
      toast.success('Loan risk assessment completed');
    } catch (e) {
      console.error('Assessment error:', e);
      toast.error('Failed to assess loan risk. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDecisionColor = (decision?: string) => {
    switch (decision) {
      case 'APPROVE':
        return 'text-green-600';
      case 'MODIFY':
        return 'text-yellow-600';
      case 'REJECT':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getDecisionIcon = (decision?: string) => {
    switch (decision) {
      case 'APPROVE':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'MODIFY':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'REJECT':
        return <AlertCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Loan Risk Assessment</CardTitle>
          <CardDescription>
            Enter loan request details to get an AI-powered risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requestedAmount">Loan Amount (₹)</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  placeholder="Enter loan amount"
                  value={loanRequest.requestedAmount || ''}
                  onChange={(e) =>
                    handleInputChange('requestedAmount', e.target.value)
                  }
                  className={errors.requestedAmount ? 'border-red-500' : ''}
                />
                {errors.requestedAmount && (
                  <p className="text-red-500 text-xs">
                    {errors.requestedAmount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedTenure">Loan Tenure (months)</Label>
                <Input
                  id="requestedTenure"
                  type="number"
                  placeholder="Enter loan tenure"
                  value={loanRequest.requestedTenure || ''}
                  onChange={(e) =>
                    handleInputChange('requestedTenure', e.target.value)
                  }
                  className={errors.requestedTenure ? 'border-red-500' : ''}
                />
                {errors.requestedTenure && (
                  <p className="text-red-500 text-xs">
                    {errors.requestedTenure}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Loan Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of the loan"
                value={loanRequest.purpose || ''}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className={errors.purpose ? 'border-red-500' : ''}
              />
              {errors.purpose && (
                <p className="text-red-500 text-xs">{errors.purpose}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="Enter monthly income"
                  value={loanRequest.monthlyIncome || ''}
                  onChange={(e) =>
                    handleInputChange('monthlyIncome', e.target.value)
                  }
                  className={errors.monthlyIncome ? 'border-red-500' : ''}
                />
                {errors.monthlyIncome && (
                  <p className="text-red-500 text-xs">{errors.monthlyIncome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type</Label>
                <Select
                  value={loanRequest.employmentType}
                  onValueChange={(value) =>
                    handleInputChange('employmentType', value)
                  }
                >
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALARIED">Salaried</SelectItem>
                    <SelectItem value="SELF_EMPLOYED">Self-Employed</SelectItem>
                    <SelectItem value="BUSINESS">Business Owner</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentTenure">
                Employment Tenure (years)
              </Label>
              <Input
                id="employmentTenure"
                type="number"
                placeholder="Enter years of employment"
                value={loanRequest.employmentTenure || ''}
                onChange={(e) =>
                  handleInputChange('employmentTenure', e.target.value)
                }
                className={errors.employmentTenure ? 'border-red-500' : ''}
              />
              {errors.employmentTenure && (
                <p className="text-red-500 text-xs">
                  {errors.employmentTenure}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Analyzing...' : 'Assess Risk'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Risk Assessment Result</CardTitle>
              <div
                className={`flex items-center ${getDecisionColor(
                  result.decision,
                )}`}
              >
                {getDecisionIcon(result.decision)}
                <span className="ml-2 font-bold">{result.decision}</span>
              </div>
            </div>
            <CardDescription>
              AI-powered analysis of the loan application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Analysis</h3>
              <p className="text-gray-700">{result.reasoning}</p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Risk Factors</h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.riskFactors.map((factor, index) => (
                  <li key={index} className="text-gray-700">
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">
                {result.decision === 'MODIFY' && 'Recommendations'}
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                {result.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-gray-700">
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 border-t">
            <p className="text-sm text-gray-500">
              This assessment is based on the provided information and credit
              history. Final lending decisions may require additional
              verification.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
