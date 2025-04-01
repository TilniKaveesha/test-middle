import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Provider from "@/components/Provider";
import { Metadata } from "next"; // Import Metadata type

const inter = Inter({ subsets: ["latin"] });

// Define metadata (if not already defined in a separate file)
export const metadata: Metadata = {
  title: "Vishvabiyathra",
  description: "Your app description",
  icons: {
    icon: "/favicon.ico", // Default favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Metadata is automatically injected by Next.js */}
      </head>
      <body className={inter.className}>
        <Provider> {/* Wrap the entire body with Provider */}
          {children}
          <Toaster /> {/* Toaster for notifications */}
        </Provider>
      </body>
    </html>
  );
}