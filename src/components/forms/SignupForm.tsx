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
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";

// Validation schema
const SuserSchema = z.object({
  NIC: z.string()
    .min(1, "NIC is required")
    .max(12, "NIC can have maximum 12 characters")
    .regex(/^[0-9]{9,12}[Vv]?$/, "Invalid NIC format"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string()
    .min(9, "Phone number must be 10 digits")
    .max(9, "Phone number must be 10 digits")
    .regex(/^[0-9]+$/, "Only numbers allowed"),
  school: z.string().min(1, "School is required"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm password"),
}).refine(data => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords don't match"
});

export default function SuserSignUpForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof SuserSchema>>({
    resolver: zodResolver(SuserSchema),
    defaultValues: {
      NIC: "",
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      school: "",
      password: "",
      confirmPassword: "",
    }
  });

  const onSubmit = async (values: z.infer<typeof SuserSchema>) => {
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/suser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          role: "suser",
          phoneNumber: `+94${values.phoneNumber}`
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess("Suser account created successfully! Redirecting...");
      setTimeout(() => router.push("/auth/sign-in"), 2000);
      
    } catch (err: any) {
      setError(err.message || "An error occurred during registration");
    } finally {
      setIsLoading(false);
    }
  };

  // Protect route - only allow unauthenticated or admin users
  if (session?.user && session.user.role !== "admin") {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-semibold">Access Denied</h3>
        <p>Only administrators can access this page</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-md mx-auto"
    >
      <h2 className="text-2xl font-bold text-center mb-6">Suser Registration</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {[
            "NIC", 
            "username", 
            "firstName", 
            "lastName", 
            "email",
            "phoneNumber",
            "school",
            "password",
            "confirmPassword"
          ].map((field, index) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <FormField
                control={form.control}
                name={field as keyof z.infer<typeof SuserSchema>}
                render={({ field: formField }) => (
                  <FormItem>
                    <FormLabel>
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={
                          field === "password" || field === "confirmPassword" 
                            ? "password" 
                            : field === "phoneNumber" 
                            ? "tel" 
                            : "text"
                        }
                        placeholder={
                          field === "phoneNumber" 
                            ? "77 123 4567" 
                            : `Enter ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
                        }
                        value={formField.value as string}
                        onChange={(e) => {
                          let value = e.target.value;
                          if (field === "phoneNumber") {
                            // Auto-format phone number
                            value = value.replace(/\D/g, '').slice(0, 10);
                          } else if (field === "NIC") {
                            // Auto-uppercase NIC
                            value = value.toUpperCase();
                          }
                          formField.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          ))}

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 text-sm text-red-600 bg-red-50 rounded-md"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-3 text-sm text-green-600 bg-green-50 rounded-md"
            >
              {success}
            </motion.div>
          )}

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Registering...
              </>
            ) : "Register as Suser"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Form>
    </motion.div>
  );
}