"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";

// Import the ExtendedUser type from your auth.ts file
import { ExtendedUser } from "@/lib/auth"; // Adjust the import path as necessary

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session || !session.user) {
      router.push("/sign-in");
      return;
    }

    // Type-cast session.user to ExtendedUser so TypeScript knows about the 'role' property
    const user = session.user as ExtendedUser;

    if (user.role === "suser") {
      router.push("/Suser");
    } else {
      router.push("user");
    }
  }, [session, status, router]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: -20, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20, rotate: 10 }}
      transition={{ duration: 0.6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
      className="flex justify-center items-center h-screen text-lg font-semibold"
    >
      <motion.p
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 5 }}
        transition={{ duration: 1.2, repeat: Infinity, repeatType: "mirror" }}
        className="text-blue-500"
      >
        Redirecting...
      </motion.p>
      <motion.div
        initial={{ scale: 1 }}
        animate={{ scale: 1.2 }}
        transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
        className="ml-2 w-4 h-4 bg-blue-500 rounded-full"
      />
    </motion.div>
  );
}
