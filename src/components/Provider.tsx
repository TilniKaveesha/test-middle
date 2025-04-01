"use client";
import React, { FC } from 'react';
import { SessionProvider } from 'next-auth/react';

interface ProviderProps {
  children: React.ReactNode;  // Explicitly type children
}

const Provider: FC<ProviderProps> = ({ children }) => {
  return <SessionProvider>{children}</SessionProvider>;
}

export default Provider;
