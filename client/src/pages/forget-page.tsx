import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const confirmResetSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ForgetPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Get token from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const resetToken = urlParams.get("token");

  const resetPasswordForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const confirmResetForm = useForm({
    resolver: zodResolver(confirmResetSchema),
    defaultValues: {
      token: resetToken || "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onResetPassword = async (data: z.infer<typeof resetPasswordSchema>) => {
    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Reset email sent",
          description: "Check your email for the password reset link",
        });
      } else {
        throw new Error(result.message || "Failed to send reset email");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to process reset request",
        variant: "destructive",
      });
    }
  };

  const onConfirmReset = async (data: z.infer<typeof confirmResetSchema>) => {
    try {
      const response = await fetch("/api/reset-password/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Password reset successful",
          description: "You can now login with your new password",
        });
        setLocation("/auth?tab=login");
      } else {
        throw new Error(result.message || "Failed to reset password");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to reset password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {resetToken
              ? "Enter your new password"
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resetToken ? (
            <Form {...confirmResetForm}>
              <form
                onSubmit={confirmResetForm.handleSubmit(onConfirmReset)}
                className="space-y-4"
              >
                <FormField
                  control={confirmResetForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={confirmResetForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Reset Password
                </Button>
              </form>
            </Form>
          ) : (
            <Form {...resetPasswordForm}>
              <form
                onSubmit={resetPasswordForm.handleSubmit(onResetPassword)}
                className="space-y-4"
              >
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  Send Reset Link
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
