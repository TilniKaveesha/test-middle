"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Validation schema remains the same
const FormSchema = z.object({
  nic: z.string().min(1, "NIC is required"),
  password: z.string().min(8, "Password must have at least 8 characters"),
});

const SignInForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      nic: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    setErrorMessage(null);
    setIsLoading(true);

    try {
      // Convert NIC to uppercase to match database format
      const normalizedNIC = values.nic.toUpperCase();
      
      const result = await signIn("credentials", {
        nic: normalizedNIC,
        password: values.password,
        redirect: false,
      });

      if (result?.error) {
        // Enhanced error handling
        let errorMessage = "Login failed. Please try again.";
        
        if (result.error.includes("Credentials required")) {
          errorMessage = "NIC and password are required";
        } else if (result.error.includes("User not found")) {
          errorMessage = "No account found with this NIC";
        } else if (result.error.includes("Invalid credentials")) {
          errorMessage = "Invalid NIC or password";
        }

        setErrorMessage(errorMessage);
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Fetch fresh session data with role information
      const sessionResponse = await fetch("/api/auth/session");
      const session = await sessionResponse.json();

      if (!session?.user?.role) {
        throw new Error("No role information found");
      }

      // Enhanced role-based redirection
      switch(session.user.role.toLowerCase()) {
        case "admin":
          router.push("/admin");
          break;
        case "suser":
          router.push("/Suser");
          break;
        case "user":
          router.push("/user");
          break;
        default:
          router.push("/dashboard");
      }

    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An unexpected error occurred");
      toast({
        title: "Error",
        description: "Oops! Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // UI remains exactly the same as your original
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-md"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {["nic", "password"].map((fieldName, index) => (
              <motion.div
                key={fieldName}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <FormField
                  control={form.control}
                  name={fieldName as keyof z.infer<typeof FormSchema>}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        {fieldName === "nic" ? "NIC" : "Password"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type={fieldName === "password" ? "password" : "text"}
                          placeholder={
                            fieldName === "nic" 
                              ? "Enter your NIC number" 
                              : "Enter your password"
                          }
                          {...field}
                          className="focus-visible:ring-2 focus-visible:ring-primary"
                          // Auto-uppercase NIC input
                          onChange={(e) => field.onChange(
                            fieldName === "nic" ? e.target.value.toUpperCase() : e.target.value
                          )}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </motion.div>
            ))}
          </div>

          {/* Forgot password link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-right"
          >
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </motion.div>

          {/* Error message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-sm text-center text-destructive bg-destructive/15 rounded-md"
            >
              {errorMessage}
            </motion.div>
          )}

          {/* Submit button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
          >
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </motion.div>
        </form>

        {/* Sign-up link - Updated to show only for admin/suser registration */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="mt-4 text-center text-sm"
        >
          <span className="text-muted-foreground">
            Need special access?{" "}
          </span>
          <Link
            href="/sign-up"
            className="font-medium text-primary hover:underline"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/sign-up'; // Force full page reload
            }}
          >
            Request account
          </Link>
        </motion.div>
      </Form>
    </motion.div>
  );
};

export default SignInForm;