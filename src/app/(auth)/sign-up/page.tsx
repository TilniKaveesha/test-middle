"use client";

import { motion } from "framer-motion";
import SignUpForm from "@/components/forms/SignupForm";

const Page = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      {/* Animated Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
      >
        {/* Animated Heading */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-2xl font-semibold text-gray-800"
        >
            
          Vishvyabiyathra
        </motion.h2>

        {/* Animated Subtext */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-1 text-center text-sm text-gray-600"
        >
          Fill in your details to get started.
        </motion.p>

        {/* Form Wrapper with Fade-in */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-4"
        >
          <SignUpForm />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Page;
