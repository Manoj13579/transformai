"use client";
import { SessionProvider } from "next-auth/react";
/*  need to define sessionProvider in separate file coz it uses context so is client component. can make layout.tsx a client component n use it in layout.tsx but not good  */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60}>
      {children}
    </SessionProvider>
  );
}