'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Define the bank names from the enum
const bankNames = [
  'SBI',
  'HDFC',
  'ICICI',
  'AXIS',
  'KOTAK',
  'PNB',
  'BOB',
  'CANARA',
  'IDBI',
  'UCO',
  'BOI',
  'IOB',
  'CBI',
  'SIB',
  'FEDERAL',
  'KVB',
  'LVB',
  'DBS',
  'CITI',
  'HSBC',
  'SC',
  'RBL',
  'YES',
  'INDUSIND',
  'BANDHAN',
  'AU',
  'IDFC',
  'EQUITAS',
  'ESAF',
  'UJJIVAN',
  'SMALLFIN',
  'PAYTM',
  'FINCARE',
  'JANA',
  'NORTHEAST',
  'GRAMEEN',
  'UTKARSH',
  'SURYODAY',
  'JALGAON',
  'AKOLA',
  'KASHI',
  'SAMARTH',
  'KAIJS',
  'KALUPUR',
  'OTHER',
] as const;

const formSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: 'Name must be at least 2 characters.',
    })
    .optional(),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters.',
    })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
    }),
  role: z.enum(['BANK'], {
    required_error: 'Please select a role.',
  }),
  bankName: z.enum(bankNames).optional(),
  aadhaarNumber: z
    .string()
    .regex(/^\d{12}$/, {
      message: 'Aadhaar number must be 12 digits.',
    })
    .optional()
    .or(z.literal('')),
  PAN: z
    .string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
      message: 'PAN must be in the format ABCDE1234F.',
    })
    .optional()
    .or(z.literal('')),
});

export function UserAddForm() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'BANK',
      aadhaarNumber: '',
      PAN: '',
    },
  });

  // Watch the role field to conditionally show bank name
  const watchRole = form.watch('role');

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast('User created successfully', {
        description: `${values.email} has been added with ${values.role} role.`,
      });
      form.reset();
    }, 1500);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormDescription>The user's full name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@example.com"
                    type="email"
                    required
                    {...field}
                  />
                </FormControl>
                <FormDescription>The user's email address.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="••••••••"
                    type="password"
                    required
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Must be at least 8 characters with uppercase, lowercase, and
                  number.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="BANK">Bank</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The user's permission level.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {watchRole === 'BANK' && (
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank Name</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bank" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {bankNames.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Required for bank users.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

        </div>

        <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating User...
            </>
          ) : (
            'Create User'
          )}
        </Button>
      </form>
    </Form>
  );
}
