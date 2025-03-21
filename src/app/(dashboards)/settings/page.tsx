"use client";

import { settings } from "@/actions/auth/settings";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import { ModeToggle } from "@/components/ModeToggle";
import { Passwordcmp } from "@/components/Passwordcmp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useCurrentUserClient } from "@/hooks/use-current-user";
import { useCurrentRole } from "@/hooks/use-current-role";
import { SettingsSchema } from "@/lib/index";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IconLock,
  IconMail,
  IconPalette,
  IconShieldLock,
  IconUser,
  IconId,
  IconBuildingBank,
} from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import zxcvbn from "zxcvbn";
import {  updateUserDocuments, getUserDocuments } from "./action"
import { useSearchParams } from "next/navigation";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";

// Extended schema to include UPI ID, Aadhaar, PAN, and Bank
const ExtendedSettingsSchema = z.object({
    name:z.optional(z.string()),
    isTwoFactorEnable:z.optional(z.boolean()),
    email : z.optional(z.string().email()),
    password:z.optional(z.string().min(6,{message:"password shold be of min 6 characters"})),
    newPassword:z.optional(z.string().min(6)),
    theme: z.optional(z.string()),
    role : z.enum([UserRole.ADMIN,UserRole.USER]),
  aadhaarNumber: z.string()
    .optional()
    .refine(val => !val || /^\d{12}$/.test(val), {
      message: "Aadhaar number must be 12 digits",
    }),
  PAN: z.string()
    .optional()
    .refine(val => !val || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val), {
      message: "PAN must be in the format ABCDE1234F",
    }),
  bankName: z.string().optional(),
});

const SettingsPage = () => {
  const searchParams = useSearchParams();
  const user = useCurrentUserClient();
  const role = user?.role;
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();
  const [isDocPending, startDocTransition] = useTransition();

  const [isPasswordVisible1, setIsPasswordVisible1] = useState<boolean>(false);
  const [isPasswordVisible2, setIsPasswordVisible2] = useState<boolean>(false);
  const [oldpassword, setoldPassword] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [errorpassword, setErrorpassword] = useState<string | undefined>("");
  const [errorpassword1, setErrorpassword1] = useState<string | undefined>("");
  const [onoff, setonoff] = useState<boolean>(false);
  const [userDocs, setUserDocs] = useState({
    aadhaarNumber: "",
    PAN: "",
    bankName: "",
  });

  // Fetch UPI ID and user documents on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (user?.id) {
          
          // Fetch user documents
          if (role === "USER") {
            const docsResult = await getUserDocuments(user.id);
            if (docsResult) {
              setUserDocs({
                aadhaarNumber: docsResult.aadhaarNumber || "",
                PAN: docsResult.PAN || "",
                bankName: docsResult.bankName || "",
              });
            }
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [user, role]);

  useEffect(() => {
    const missing = searchParams.get("missing");

   if (missing === "aadhaar") {
      toast.warning("Please add your Aadhaar details to continue", {
        description: "Aadhaar verification is required for this feature",
      });
    }
  }, [searchParams]);

  const Password_testResult = useMemo(() => zxcvbn(password), [password]);
  const password_score = useMemo(
    () => (Password_testResult.score * 100) / 4,
    [Password_testResult.score]
  );

  const PassProgressColor = useCallback(() => {
    switch (Password_testResult.score) {
      case 0:
        return "#828282";
      case 1:
        return "#EA1111";
      case 2:
        return "#FFAD00";
      case 3:
        return "#9bc158";
      case 4:
        return "#00b500";
      default:
        return "none";
    }
  }, [Password_testResult.score]);

  const createPassLable = useCallback(() => {
    switch (Password_testResult.score) {
      case 0:
        return "Very weak";
      case 1:
        return "Weak";
      case 2:
        return "Fear";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "none";
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
      aadhaarNumber: userDocs.aadhaarNumber || undefined,
      PAN: userDocs.PAN || undefined,
      bankName: userDocs.bankName || undefined,
    },
  });

  // Update form values when data is fetched
  useEffect(() => {
    if (userDocs.aadhaarNumber) {
      form.setValue("aadhaarNumber", userDocs.aadhaarNumber);
    }
    if (userDocs.PAN) {
      form.setValue("PAN", userDocs.PAN);
    }
    if (userDocs.bankName) {
      form.setValue("bankName", userDocs.bankName);
    }
  }, [ userDocs, form]);

  const onSubmit = (values: z.infer<typeof ExtendedSettingsSchema>) => {
    if (oldpassword !== "") {
      if (password === "") {
        setErrorpassword("Password field is empty!");
        return;
      }
      if (password_score < 70) {
        setErrorpassword("Set an Strong password Password");
        return;
      }
    }
    if (password !== "") {
      if (oldpassword === "") {
        setErrorpassword1("Password field is empty!");
        return;
      }
    }

    values.theme = undefined;
    const newvalues = {
      ...values,
      password: oldpassword,
      newPassword: password,
      isTwoFactorEnable: onoff,
    };

    const toastid: any = toast.loading("Evaluating Updates...");
    startTransition(() => {
      settings(newvalues)
        .then((data) => {
          if (data.error) {
            toast.error(data.error, {
              id: toastid,
            });
          } else if (data.success) {
            update();
            toast.success(data.success, {
              id: toastid,
            });
          }
        })
        .catch((e) => {
          toast.error("Something went wrong!!", {
            id: toastid,
          });
        });
    });
  };
  // Handle user document updates
  const updateDocuments = (data: {
    aadhaarNumber?: string;
    PAN?: string;
    bankName?: string;
  }) => {
    if (
      (data.aadhaarNumber === userDocs.aadhaarNumber || !data.aadhaarNumber) &&
      (data.PAN === userDocs.PAN || !data.PAN) &&
      (data.bankName === userDocs.bankName || !data.bankName)
    )
      return; // No changes, don't update

    const toastId = toast.loading("Updating documents...");
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
            toast.success("Documents updated successfully", {
              id: toastId,
            });
          } else {
            toast.error("Failed to update documents", {
              id: toastId,
            });
          }
        })
        .catch((error) => {
          console.error("Error updating documents:", error);
          toast.error("Something went wrong while updating documents", {
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
            <Button
              onClick={form.handleSubmit(onSubmit)}
              disabled={isPending}
              className="w-32"
            >
              Save Changes
            </Button>
          </div>

          <Form {...form}>
            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">
                    Personal Information
                  </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    disabled={isPending}
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
                            defaultValue={user?.name ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {user?.isOAuth === false && (
                    <FormField
                      disabled={isPending}
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
                              defaultValue={user?.email ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </CardContent>
              </Card>

              {/* Role-Specific Card for USER */}
              {role === "USER" && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Verification Documents</h2>
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
                                value={field.value || ""}
                                onChange={(e) => {
                                  // Only allow numeric input
                                  const value = e.target.value.replace(/\D/g, '');
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
                                value={field.value || ""}
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

                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconBuildingBank size={18} />
                            Bank Name
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
                            <SelectContent>
                              <SelectItem value="SBI">State Bank of India (SBI)</SelectItem>
                              <SelectItem value="HDFC">HDFC Bank</SelectItem>
                              <SelectItem value="ICICI">ICICI Bank</SelectItem>
                              <SelectItem value="AXIS">Axis Bank</SelectItem>
                              <SelectItem value="KOTAK">Kotak Mahindra Bank</SelectItem>
                              <SelectItem value="PNB">Punjab National Bank</SelectItem>
                              <SelectItem value="BOB">Bank of Baroda</SelectItem>
                              <SelectItem value="CANARA">Canara Bank</SelectItem>
                              <SelectItem value="IDBI">IDBI Bank</SelectItem>
                              <SelectItem value="YES">Yes Bank</SelectItem>
                              <SelectItem value="INDUSIND">IndusInd Bank</SelectItem>
                              <SelectItem value="PAYTM">Paytm Payments Bank</SelectItem>
                              <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Select your primary banking partner
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={() => updateDocuments({
                        aadhaarNumber: form.getValues("aadhaarNumber"),
                        PAN: form.getValues("PAN"),
                        bankName: form.getValues("bankName"),
                      })}
                      disabled={isDocPending}
                      className="mt-4"
                    >
                      {isDocPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Update Documents
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Role-Specific Card for BANK */}
              {role === "BANK" && (
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
                            <SelectContent>
                              <SelectItem value="SBI">State Bank of India (SBI)</SelectItem>
                              <SelectItem value="HDFC">HDFC Bank</SelectItem>
                              <SelectItem value="ICICI">ICICI Bank</SelectItem>
                              <SelectItem value="AXIS">Axis Bank</SelectItem>
                              <SelectItem value="KOTAK">Kotak Mahindra Bank</SelectItem>
                              <SelectItem value="PNB">Punjab National Bank</SelectItem>
                              <SelectItem value="BOB">Bank of Baroda</SelectItem>
                              <SelectItem value="CANARA">Canara Bank</SelectItem>
                              <SelectItem value="IDBI">IDBI Bank</SelectItem>
                              <SelectItem value="YES">Yes Bank</SelectItem>
                              <SelectItem value="INDUSIND">IndusInd Bank</SelectItem>
                              <SelectItem value="PAYTM">Paytm Payments Bank</SelectItem>
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
                      onClick={() => updateDocuments({
                        bankName: form.getValues("bankName"),
                      })}
                      disabled={isDocPending}
                      className="mt-4"
                    >
                      {isDocPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Update Bank Details
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Role-Specific Card for ADMIN */}
              {role === "ADMIN" && (
                <Card>
                  <CardHeader>
                    <h2 className="text-xl font-semibold">Admin Settings</h2>
                  </CardHeader>
                  <CardContent>
                    <FormDescription className="text-center py-4">
                      Admin-specific settings are managed through the admin dashboard.
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
                      disabled={isPending}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <IconLock size={18} />
                            Old Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type={isPasswordVisible1 ? "text" : "password"}
                                onChange={(e) => {
                                  setoldPassword(e.target.value);
                                  setErrorpassword1("");
                                }}
                                value={oldpassword}
                                className="pr-10"
                              />
                              <Passwordcmp
                                isPasswordVisible={isPasswordVisible1}
                                setisPasswordVisible={setIsPasswordVisible1}
                              />
                            </div>
                          </FormControl>
                          {errorpassword1 !== "" && (
                            <FormMessage>{errorpassword1}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      disabled={isPending}
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
                                type={isPasswordVisible2 ? "text" : "password"}
                                onChange={(e) => {
                                  setPassword(e.target.value);
                                  setErrorpassword("");
                                }}
                                value={password}
                                className="pr-10"
                              />
                              <Passwordcmp
                                isPasswordVisible={isPasswordVisible2}
                                setisPasswordVisible={setIsPasswordVisible2}
                              />
                            </div>
                          </FormControl>
                          {errorpassword === "" &&
                            password !== "" &&
                            !isPending && (
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
                          {errorpassword !== "" && (
                            <FormMessage>{errorpassword}</FormMessage>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      disabled={isPending}
                      control={form.control}
                      name="isTwoFactorEnable"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
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
                                setonoff(checked);
                              }}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <h2 className="text-xl font-semibold">Preferences</h2>
                </CardHeader>
                <CardContent>
                  <FormField
                    disabled={isPending}
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