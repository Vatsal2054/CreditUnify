'use client';
import MaxWidthWrapper from '@/components/MaxWidthWrapper';
import { ModeToggle } from '@/components/ModeToggle';
import { Passwordcmp } from '@/components/Passwordcmp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
import { Switch } from '@/components/ui/switch';
import { useCurrentUserClient } from '@/hooks/use-current-user';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
import {
  IconBuildingBank,
  IconCheck,
  IconId,
  IconLock,
  IconMail,
  IconPalette,
  IconShieldLock,
  IconUser,
} from '@tabler/icons-react';
import { Loader2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import zxcvbn from 'zxcvbn';
import { getUserDocuments, updatePassword, updatePersonalInfo, updateTwoFactor, updateUserDocuments } from './action';

// Extended schema to include UPI ID, Aadhaar, PAN, and Bank
const ExtendedSettingsSchema = z.object({
  name: z.optional(z.string()),
  isTwoFactorEnable: z.optional(z.boolean()),
  email: z.optional(z.string().email()),
  password: z.optional(
    z.string().min(6, { message: 'password shold be of min 6 characters' }),
  ),
  newPassword: z.optional(z.string().min(6)),
  theme: z.optional(z.string()),
  role: z.enum([UserRole.ADMIN, UserRole.USER, UserRole.BANK]),
  aadhaarNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^\d{12}$/.test(val), {
      message: 'Aadhaar number must be 12 digits',
    }),
  PAN: z
    .string()
    .optional()
    .refine((val) => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
      message: 'PAN must be in the format ABCDE1234F',
    }),
  bankName: z.string().optional(),
});

const SettingsPage = () => {
  const searchParams = useSearchParams();
  const user = useCurrentUserClient();
  const role = user?.role;
  const { update } = useSession();
  
  // Separate loading states for different sections
  const [isPersonalInfoPending, startPersonalInfoTransition] = useTransition();
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isTwoFactorPending, startTwoFactorTransition] = useTransition();
  const [isDocPending, startDocTransition] = useTransition();

  const [isPasswordVisible1, setIsPasswordVisible1] = useState<boolean>(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState<boolean>(false);
  const [oldpassword, setoldPassword] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errorpassword, setErrorpassword] = useState<string | undefined>('');
  const [errorpassword1, setErrorpassword1] = useState<string | undefined>('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(user?.isTwoFactorEnabled || false);
  const router = useRouter();
  const [userDocs, setUserDocs] = useState({
    aadhaarNumber: '',
    PAN: '',
    bankName: '',
  });
  // Fetch user documents on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.id) {
          if (role === 'USER') {
            const docsResult = await getUserDocuments(user.id);
            if (docsResult) {
              setUserDocs({
                aadhaarNumber: docsResult.aadhaarNumber || '',
                PAN: docsResult.PAN || '',
                bankName: '',
              });
            }
          } else if (role === "BANK") {
            const docsResult = await getUserDocuments(user.id);
            if (docsResult) {
              setUserDocs({
                aadhaarNumber: '',
                PAN: '',
                bankName: docsResult.bankName || '',
              });
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [user, role]);

  // Show warning for missing documents
  useEffect(() => {
    const missing = searchParams.get('missing');
    console.log("missing: ",missing);
    if (missing == "aadhaar" || missing == "both") {
      console.log("missing aadhaar");
      toast.warning('Please add your Aadhaar details to continue', {
        description: 'Aadhaar is required for this feature',
      });
    }
    if (missing === "PAN" || missing === "both") {
      console.log("missing PAN");
      toast.warning('Please add your PAN details to continue', {
        description: 'PAN is required for this feature',
      });
    }
  }, []);

  // Password strength evaluation
  const Password_testResult = useMemo(() => zxcvbn(password), [password]);
  const password_score = useMemo(
    () => (Password_testResult.score * 100) / 4,
    [Password_testResult.score],
  );

  const PassProgressColor = useCallback(() => {
    switch (Password_testResult.score) {
      case 0:
        return '#828282';
      case 1:
        return '#EA1111';
      case 2:
        return '#FFAD00';
      case 3:
        return '#9bc158';
      case 4:
        return '#00b500';
      default:
        return 'none';
    }
  }, [Password_testResult.score]);

  const createPassLable = useCallback(() => {
    switch (Password_testResult.score) {
      case 0:
        return 'Very weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return 'none';
    }
  }, [Password_testResult.score]);

  const form = useForm<z.infer<typeof ExtendedSettingsSchema>>({
    resolver: zodResolver(ExtendedSettingsSchema),
    defaultValues: {
      name: user?.name || undefined,
      email: user?.email || undefined,
      password: undefined,
      newPassword: undefined,
      isTwoFactorEnable: user?.isTwoFactorEnabled || undefined,
      theme: undefined,
      role: user?.role || UserRole.USER,
      aadhaarNumber: userDocs.aadhaarNumber || undefined,
      PAN: userDocs.PAN || undefined,
      bankName: userDocs.bankName || undefined,
    },
  });

  // Update form values when data is fetched
  useEffect(() => {

    if (userDocs.aadhaarNumber) {
      form.setValue('aadhaarNumber', userDocs.aadhaarNumber);
    }

    if (userDocs.PAN) {
      form.setValue('PAN', userDocs.PAN);
    }

    if (userDocs.bankName) {
      form.setValue('bankName', userDocs.bankName);
    }
  }, [userDocs, form]);

  // Update personal information
  const updatePersonalInformation = () => {
    const name = form.getValues('name');
    const email = form.getValues('email');
    
    if (name === user?.name && email === user?.email) {
      toast.info('No changes to update');
      return;
    }
    
    const toastId = toast.loading('Updating personal information...');
    startPersonalInfoTransition(() => {
      updatePersonalInfo({ name, email })
        .then((data) => {
          if (data?.error) {
            toast.error(data.error, { id: toastId });
          } else if (data?.success) {
            update();
            toast.success(data.success, { id: toastId });
          }
        })
        .catch((e) => {
          toast.error('Failed to update personal information', { id: toastId });
        });
    });
  };

  // Update password
  const updateUserPassword = () => {
    if (oldpassword === '') {
      setErrorpassword1('Current password is required');
      return;
    }
    if (password === '') {
      setErrorpassword('New password is required');
      return;
    }
    if (password_score < 70) {
      setErrorpassword('Please use a stronger password');
      return;
    }
    
    const toastId = toast.loading('Updating password...');
    startPasswordTransition(() => {
      updatePassword({ currentPassword: oldpassword, newPassword: password })
        .then((data) => {
          if (data?.error) {
            toast.error(data.error, { id: toastId });
          } else if (data?.success) {
            setoldPassword('');
            setPassword('');
            toast.success(data.success, { id: toastId });
          }
        })
        .catch((e) => {
          toast.error('Failed to update password', { id: toastId });
        });
    });
  };

  // Update two-factor authentication
  const updateTwoFactorAuth = (enabled: boolean) => {
    const toastId = toast.loading(`${enabled ? 'Enabling' : 'Disabling'} two-factor authentication...`);
    startTwoFactorTransition(() => {
      updateTwoFactor({ enabled })
        .then((data) => {
          if (data?.error) {
            // Revert the switch if there's an error
            setTwoFactorEnabled(!enabled);
            form.setValue('isTwoFactorEnable', !enabled);
            toast.error(data.error, { id: toastId });
          } else if (data?.success) {
            update();
            toast.success(data.success, { id: toastId });
          }
        })
        .catch((e) => {
          // Revert the switch if there's an error
          setTwoFactorEnabled(!enabled);
          form.setValue('isTwoFactorEnable', !enabled);
          toast.error('Failed to update two-factor authentication', { id: toastId });
        });
    });
  };

  // Update user documents
  const updateDocuments = (data: {
    aadhaarNumber?: string;
    PAN?: string;
    bankName?: string;
  }) => {
    console.log("Aadhaar Number:", data.aadhaarNumber);
    console.log("PAN Number:", data.PAN);
    if ((
      (data.aadhaarNumber && data.PAN===undefined) ||
      (data.PAN && data.aadhaarNumber===undefined) || (
        !data.aadhaarNumber && !data.PAN
      )) && !data.bankName
    ) {
      toast.info('Enter Both Aadhaar Number and PAN Number');
      return;
    }
    if (
      (data.aadhaarNumber === userDocs.aadhaarNumber || !data.aadhaarNumber) &&
      (data.PAN === userDocs.PAN || !data.PAN) &&
      (data.bankName === userDocs.bankName || !data.bankName)
    ) {
      toast.info('No changes to update');
      return;
    }
    const toastId = toast.loading('Updating documents...');
    startDocTransition(() => {
      updateUserDocuments(data)
        .then((result) => {
          if (result && result.success) {
            setUserDocs({
              ...userDocs,
              ...(data.aadhaarNumber && { aadhaarNumber: data.aadhaarNumber }),
              ...(data.PAN && { PAN: data.PAN }),
              ...(data.bankName && { bankName: data.bankName }),
            });
            const missing = searchParams.get('missing');
            toast.success('Documents updated successfully', {
              id: toastId,
            });
            
            if(missing){
              router.push("/user-dashboard");
            }

          } else {
            toast.error(result?.error || 'Failed to update documents', {
              id: toastId,
            });
          }
        })
        .catch((error) => {
          console.error('Error updating documents:', error);
          toast.error('Something went wrong while updating documents', {
            id: toastId,
          });
        });
    });
  };

  return (
    <MaxWidthWrapper>
      <div className="mx-auto flex w-full max-w-screen-xl flex-wrap items-center justify-between p-4">
        <div className="flex w-full flex-col gap-5 px-4">
          <div className="z-10 mb-4 flex items-center justify-between bg-white py-4 dark:bg-zinc-950">
            <h1 className="text-3xl font-bold">Settings</h1>
          </div>

          <Form {...form}>
            <form className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    disabled={isPersonalInfoPending}
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <IconUser size={18} />
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Doe"
                            defaultValue={user?.name ?? ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user?.isOAuth === false && (
                    <FormField
                      disabled={isPersonalInfoPending}
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconMail size={18} />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="john@example.com"
                              defaultValue={user?.email ?? ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  
                  <Button
                    type="button"
                    onClick={updatePersonalInformation}
                    disabled={isPersonalInfoPending}
                    className="mt-4 flex gap-2"
                  >
                    {isPersonalInfoPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <IconCheck size={18} />
                    )}
                    Update Personal Info
                  </Button>
                </CardContent>
              </Card>

              {/* Role-Specific Card for USER */}
              {role === 'USER' && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">
                      Verification Documents
                    </h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="aadhaarNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconId size={18} />
                            Aadhaar Number
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="123456789012"
                                value={field.value || ''}
                                onChange={(e) => {
                                  // Only allow numeric input
                                  const value = e.target.value.replace(
                                    /\D/g,
                                    '',
                                  );
                                  field.onChange(value);
                                }}
                                maxLength={12}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Your 12-digit Aadhaar identification number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="PAN"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconId size={18} />
                            PAN Card
                          </FormLabel>
                          <div className="flex items-center gap-2">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="ABCDE1234F"
                                value={field.value || ''}
                                onChange={(e) => {
                                  // Convert to uppercase
                                  const value = e.target.value.toUpperCase();
                                  field.onChange(value);
                                }}
                                maxLength={10}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Your 10-character Permanent Account Number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={() =>
                        updateDocuments({
                          aadhaarNumber: form.getValues('aadhaarNumber'),
                          PAN: form.getValues('PAN'),
                        })
                      }
                      disabled={isDocPending}
                      className="mt-4 flex gap-2"
                    >
                      {isDocPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconCheck size={18} />
                      )}
                      Update Documents
                    </Button>
                  </CardContent>
                </Card>
              )}
              
              {/* Role-Specific Card for BANK */}
              {role === 'BANK' && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Bank Settings</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconBuildingBank size={18} />
                            Bank Identity
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your bank" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className='h-64'>
                              <SelectItem value="SBI">
                                State Bank of India (SBI)
                              </SelectItem>
                              <SelectItem value="HDFC">HDFC Bank</SelectItem>
                              <SelectItem value="ICICI">ICICI Bank</SelectItem>
                              <SelectItem value="AXIS">Axis Bank</SelectItem>
                              <SelectItem value="KOTAK">
                                Kotak Mahindra Bank
                              </SelectItem>
                              <SelectItem value="PNB">
                                Punjab National Bank
                              </SelectItem>
                              <SelectItem value="BOB">
                                Bank of Baroda
                              </SelectItem>
                              <SelectItem value="CANARA">
                                Canara Bank
                              </SelectItem>
                              <SelectItem value="IDBI">IDBI Bank</SelectItem>
                              <SelectItem value="YES">Yes Bank</SelectItem>
                              <SelectItem value="INDUSIND">
                                IndusInd Bank
                              </SelectItem>
                              <SelectItem value="PAYTM">
                                Paytm Payments Bank
                              </SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Your bank institution identification
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={() =>
                        updateDocuments({
                          bankName: form.getValues('bankName'),
                        })
                      }
                      disabled={isDocPending}
                      className="mt-4 flex gap-2"
                    >
                      {isDocPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconCheck size={18} />
                      )}
                      Update Bank Details
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Role-Specific Card for ADMIN */}
              {role === 'ADMIN' && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Admin Settings</h2>
                  </CardHeader>
                  <CardContent>
                    <FormDescription className="text-center py-4">
                      Admin-specific settings are managed through the admin
                      dashboard.
                    </FormDescription>
                  </CardContent>
                </Card>
              )}

              {user?.isOAuth === false && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Security</h2>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      disabled={isPasswordPending}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconLock size={18} />
                            Current Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={isPasswordVisible1 ? 'text' : 'password'}
                                onChange={(e) => {
                                  setoldPassword(e.target.value);
                                  setErrorpassword1('');
                                }}
                                value={oldpassword}
                                className="pr-10"
                                placeholder="Enter current password"
                              />
                              <Passwordcmp
                                isPasswordVisible={isPasswordVisible1}
                                setisPasswordVisible={setIsPasswordVisible1}
                              />
                            </div>
                          </FormControl>
                          {errorpassword1 !== '' && (
                            <FormMessage>{errorpassword1}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      disabled={isPasswordPending}
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconLock size={18} />
                            New Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={isPasswordVisible2 ? 'text' : 'password'}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  setErrorpassword('');
                                }}
                                value={password}
                                className="pr-10"
                                placeholder="Enter new password"
                              />
                              <Passwordcmp
                                isPasswordVisible={isPasswordVisible2}
                                setisPasswordVisible={setIsPasswordVisible2}
                              />
                            </div>
                          </FormControl>
                          {errorpassword === '' &&
                            password !== '' &&
                            !isPasswordPending && (
                              <div className="mt-2">
                                <div className="h-2 w-full rounded-full bg-gray-200">
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${password_score}%`,
                                      backgroundColor: PassProgressColor(),
                                    }}
                                  ></div>
                                </div>
                                <p
                                  className="mt-1 text-sm"
                                  style={{ color: PassProgressColor() }}
                                >
                                  {createPassLable()}
                                </p>
                              </div>
                            )}
                          {errorpassword !== '' && (
                            <FormMessage>{errorpassword}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />


                    <FormField
                      disabled={isTwoFactorPending}
                      control={form.control}
                      name="isTwoFactorEnable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-6">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              <div className="flex items-center gap-2">
                                <IconShieldLock size={18} />
                                Two Factor Authentication
                              </div>
                            </FormLabel>
                            <FormDescription>
                              Enable two factor authentication for your account
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                setTwoFactorEnabled(checked);
                                updateTwoFactorAuth(checked);
                              }}
                              disabled={isTwoFactorPending}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      type="button"
                      onClick={updateUserPassword}
                      disabled={isPasswordPending}
                      className="mt-4 flex gap-2"
                    >
                      {isPasswordPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <IconCheck size={18} />
                      )}
                      Update Password
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Preferences</h2>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="theme"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            <div className="flex items-center gap-2">
                              <IconPalette size={18} />
                              Theme
                            </div>
                          </FormLabel>
                          <FormDescription>
                            Choose between light and dark mode
                          </FormDescription>
                        </div>
                        <FormControl>
                          <ModeToggle />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </form>
          </Form>
        </div>
      </div>
    </MaxWidthWrapper>
  );
};

export default SettingsPage;