// 'use client';

// import { useState } from 'react';
// import { useTranslations } from 'next-intl';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { useForm } from 'react-hook-form';
// import { z } from 'zod';
// import { Loader2 } from 'lucide-react';

// import { Button } from '@/components/ui/button';
// import {
//   Form,
//   FormControl,
//   FormDescription,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage
// } from '@/components/ui/form';
// import { Input } from '@/components/ui/input';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';
// import { toast } from 'sonner';

// const bankNames = [
//   'SBI', 'HDFC', 'ICICI', 'AXIS', 'KOTAK', 'PNB', 'BOB', 'CANARA', 'IDBI', 'UCO', 'BOI',
//   'IOB', 'CBI', 'SIB', 'FEDERAL', 'KVB', 'LVB', 'DBS', 'CITI', 'HSBC', 'SC', 'RBL', 'YES',
//   'INDUSIND', 'BANDHAN', 'AU', 'IDFC', 'EQUITAS', 'ESAF', 'UJJIVAN', 'SMALLFIN', 'PAYTM',
//   'FINCARE', 'JANA', 'NORTHEAST', 'GRAMEEN', 'UTKARSH', 'SURYODAY', 'JALGAON', 'AKOLA',
//   'KASHI', 'SAMARTH', 'KAIJS', 'KALUPUR', 'OTHER'
// ] as const;

// const formSchema = z.object({
//   name: z.string().min(2).optional(),
//   email: z.string().email(),
//   password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
//   role: z.enum(['BANK']),
//   bankName: z.enum(bankNames).optional()
// });

// export function UserAddForm() {
//   const [isLoading, setIsLoading] = useState(false);
//   const t = useTranslations('admin.UserAddForm');

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: '',
//       email: '',
//       password: '',
//       role: 'BANK'
//     }
//   });

//   const watchRole = form.watch('role');

//   function onSubmit(values: z.infer<typeof formSchema>) {
//     setIsLoading(true);
//     setTimeout(() => {
//       setIsLoading(false);
//       toast(t('userCreatedSuccess'), {
//         description: t('userCreatedDescription', { email: values.email, role: values.role })
//       });
//       form.reset();
//     }, 1500);
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <FormField
//             control={form.control}
//             name="name"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>{t('name')}</FormLabel>
//                 <FormControl>
//                   <Input placeholder={t('namePlaceholder')} {...field} />
//                 </FormControl>
//                 <FormDescription>{t('nameDescription')}</FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="email"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>{t('email')}</FormLabel>
//                 <FormControl>
//                   <Input placeholder={t('emailPlaceholder')} type="email" required {...field} />
//                 </FormControl>
//                 <FormDescription>{t('emailDescription')}</FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="password"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>{t('password')}</FormLabel>
//                 <FormControl>
//                   <Input placeholder={t('passwordPlaceholder')} type="password" required {...field} />
//                 </FormControl>
//                 <FormDescription>{t('passwordDescription')}</FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           <FormField
//             control={form.control}
//             name="role"
//             render={({ field }) => (
//               <FormItem>
//                 <FormLabel>{t('role')}</FormLabel>
//                 <Select onValueChange={field.onChange} defaultValue={field.value}>
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder={t('rolePlaceholder')} />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="BANK">{t('role')}</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormDescription>{t('roleDescription')}</FormDescription>
//                 <FormMessage />
//               </FormItem>
//             )}
//           />

//           {watchRole === 'BANK' && (
//             <FormField
//               control={form.control}
//               name="bankName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>{t('bankName')}</FormLabel>
//                   <Select onValueChange={field.onChange} value={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder={t('bankNamePlaceholder')} />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent className="max-h-[200px]">
//                       {bankNames.map((bank) => (
//                         <SelectItem key={bank} value={bank}>
//                           {bank}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormDescription>{t('bankNameDescription')}</FormDescription>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           )}
//         </div>

//         <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
//           {isLoading ? (
//             <>
//               <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//               {t('creatingUser')}
//             </>
//           ) : (
//             t('createUser')
//           )}
//         </Button>
//       </form>
//     </Form>
//   );
// }



'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

import { createBankUser } from '../../admin-dashboard/action';
import { BankName } from '@prisma/client';
const bankNameValues = [
  'SBI', 'HDFC', 'ICICI', 'AXIS', 'KOTAK', 'PNB', 'BOB', 'CANARA', 'IDBI', 'UCO', 'BOI',
  'IOB', 'CBI', 'SIB', 'FEDERAL', 'KVB', 'LVB', 'DBS', 'CITI', 'HSBC', 'SC', 'RBL', 'YES',
  'INDUSIND', 'BANDHAN', 'AU', 'IDFC', 'EQUITAS', 'ESAF', 'UJJIVAN', 'SMALLFIN', 'PAYTM',
  'FINCARE', 'JANA', 'NORTHEAST', 'GRAMEEN', 'UTKARSH', 'SURYODAY', 'JALGAON', 'AKOLA',
  'KASHI', 'SAMARTH', 'KAIJS', 'KALUPUR', 'OTHER'
] as const;

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
    { message: "Password must contain at least one uppercase letter, one lowercase letter, and one number" }
  ),
  role: z.enum(['BANK']),
  bankName: z.enum(bankNameValues, { 
    required_error: "Please select a bank", 
    invalid_type_error: "Please select a valid bank"
  })
});

export function UserAddForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations('admin.UserAddForm');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'BANK'
    }
  });

  const watchRole = form.watch('role');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Show loading toast
    const loadingToast = toast.loading(t('creatingUser'), {
      description: t('processingRequest')
    });
    
    try {
      // Call the server action
      const result = await createBankUser(values);
      
      if (result.success) {
        // Show success toast
        toast.success(t('userCreatedSuccess'), {
          description: t('userCreatedDescription', { 
            email: values.email, 
            role: values.role,
            bank: values.bankName || ''
          }),
          duration: 5000,
          id: loadingToast
        });
        
        form.reset();
      } else {
        // Show error toast
        toast.error(t('userCreationFailed'), {
          description: result.message,
          duration: 5000,
          id: loadingToast
        });
        
        // Set form errors if we have validation errors from the server
        if (result.errors) {
          result.errors.forEach(error => {
            const fieldPath = error.path as any;
            if (fieldPath && fieldPath !== 'root') {
              form.setError(fieldPath, { 
                type: 'server', 
                message: error.message 
              });
            }
          });
        }
      }
    } catch (error) {
      toast.error(t('userCreationFailed'), {
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        duration: 5000,
        id:loadingToast
      });
      
      console.error('Failed to create user:', error);
    } finally {
      setIsSubmitting(false);
    }
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
                <FormLabel>{t('name')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('namePlaceholder')} {...field} />
                </FormControl>
                <FormDescription>{t('nameDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('email')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('emailPlaceholder')} type="email" required {...field} />
                </FormControl>
                <FormDescription>{t('emailDescription')}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('passwordPlaceholder')} type="password" required {...field} />
                </FormControl>
                <FormDescription>{t('passwordDescription')}</FormDescription>
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
                  <FormLabel>{t('bankName')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('bankNamePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-[200px]">
                      {bankNameValues.map((bank) => (
                        <SelectItem key={bank} value={bank}>
                          {bank}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>{t('bankNameDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('creatingUser')}
            </>
          ) : (
            t('createUser')
          )}
        </Button>
      </form>
    </Form>
  );
}