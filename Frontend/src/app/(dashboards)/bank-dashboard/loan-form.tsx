'use client';

import { useEffect, useRef, useState } from 'react';
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
import { AlertCircle, CheckCircle, AlertTriangle, ArrowRight, Shield, FileWarning, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { giveSuggestions } from './action';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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
  const resultRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    // Scroll to results when they become available
    if (result && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

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
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'MODIFY':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'REJECT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
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
      <Card className="shadow-md dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Loan Risk Assessment</CardTitle>
          <CardDescription className="dark:text-gray-300">
            Enter loan request details to get an AI-powered risk assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="requestedAmount" className="dark:text-gray-200">Loan Amount (₹)</Label>
                <Input
                  id="requestedAmount"
                  type="number"
                  placeholder="Enter loan amount"
                  value={loanRequest.requestedAmount || ''}
                  onChange={(e) =>
                    handleInputChange('requestedAmount', e.target.value)
                  }
                  className={`${errors.requestedAmount ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.requestedAmount && (
                  <p className="text-red-500 text-xs">
                    {errors.requestedAmount}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="requestedTenure" className="dark:text-gray-200">Loan Tenure (months)</Label>
                <Input
                  id="requestedTenure"
                  type="number"
                  placeholder="Enter loan tenure"
                  value={loanRequest.requestedTenure || ''}
                  onChange={(e) =>
                    handleInputChange('requestedTenure', e.target.value)
                  }
                  className={`${errors.requestedTenure ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.requestedTenure && (
                  <p className="text-red-500 text-xs">
                    {errors.requestedTenure}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose" className="dark:text-gray-200">Loan Purpose</Label>
              <Textarea
                id="purpose"
                placeholder="Describe the purpose of the loan"
                value={loanRequest.purpose || ''}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                className={`${errors.purpose ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.purpose && (
                <p className="text-red-500 text-xs">{errors.purpose}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="monthlyIncome" className="dark:text-gray-200">Monthly Income (₹)</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  placeholder="Enter monthly income"
                  value={loanRequest.monthlyIncome || ''}
                  onChange={(e) =>
                    handleInputChange('monthlyIncome', e.target.value)
                  }
                  className={`${errors.monthlyIncome ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
                />
                {errors.monthlyIncome && (
                  <p className="text-red-500 text-xs">{errors.monthlyIncome}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType" className="dark:text-gray-200">Employment Type</Label>
                <Select
                  value={loanRequest.employmentType}
                  onValueChange={(value) =>
                    handleInputChange('employmentType', value)
                  }
                >
                  <SelectTrigger id="employmentType" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="SALARIED">Salaried</SelectItem>
                    <SelectItem value="SELF_EMPLOYED">Self-Employed</SelectItem>
                    <SelectItem value="BUSINESS">Business Owner</SelectItem>
                    <SelectItem value="RETIRED">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="employmentTenure" className="dark:text-gray-200">
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
                className={`${errors.employmentTenure ? 'border-red-500' : ''} dark:bg-gray-700 dark:border-gray-600 dark:text-white`}
              />
              {errors.employmentTenure && (
                <p className="text-red-500 text-xs">
                  {errors.employmentTenure}
                </p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full transition-all duration-300 hover:shadow-lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                <span className="flex items-center">
                  Assess Risk
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AnimatePresence>
        {result && (
          <motion.div 
            ref={resultRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-lg border dark:border-gray-700 dark:bg-gray-800">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-blue-500" />
                    <CardTitle className="text-xl font-bold dark:text-white">Risk Assessment Result</CardTitle>
                  </div>
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                  >
                    <Badge className={`text-sm font-semibold px-3 py-1 rounded-full ${getDecisionColor(result.decision)}`}>
                      <span className="flex items-center">
                        {getDecisionIcon(result.decision)}
                        <span className="ml-2">{result.decision}</span>
                      </span>
                    </Badge>
                  </motion.div>
                </div>
                <CardDescription className="dark:text-gray-300">
                  AI-powered analysis of the loan application
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-700 border-l-4 border-blue-500">
                  <div className="flex items-center mb-2">
                    <FileCheck className="h-5 w-5 text-blue-500 mr-2" />
                    <h3 className="font-semibold text-lg dark:text-white">Analysis Summary</h3>
                  </div>
                  <p className="text-gray-700 dark:text-gray-200">{result.reasoning}</p>
                </div>

                <Separator className="dark:bg-gray-600" />

                <div>
                  <div className="flex items-center mb-4">
                    <FileWarning className="h-5 w-5 text-red-500 mr-2" />
                    <h3 className="font-semibold text-lg dark:text-white">Risk Factors</h3>
                  </div>
                  
                  <div className="bg-red-50 bg-opacity-80 dark:bg-red-900 dark:bg-opacity-30 rounded-lg p-4 border-l-4 border-red-500">
                    <ul className="space-y-3">
                      {result.riskFactors.map((factor, index) => (
                        <motion.li 
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.15 }}
                          className="text-red-800 dark:text-red-200 flex items-start"
                        >
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span>{factor}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>

                {result.recommendations.length > 0 && (
                  <>
                    <Separator className="dark:bg-gray-600" />
                    
                    <div>
                      <div className="flex items-center mb-4">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <h3 className="font-semibold text-lg dark:text-white">Recommendations</h3>
                      </div>
                      
                      <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-30 rounded-lg p-4 border-l-4 border-green-500">
                        <ul className="space-y-3">
                          {result.recommendations.map((recommendation, index) => (
                            <motion.li 
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.15 }}
                              className="text-green-800 dark:text-green-200 flex items-start"
                            >
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              <span>{recommendation}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
              
              <CardFooter className="bg-gray-50 border-t p-4 dark:bg-gray-700 dark:border-gray-600">
                <p className="text-sm text-blue-500 dark:text-gray-300">
                  This assessment is based on the provided information and credit history. 
                  Final lending decisions may require additional verification.
                </p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}