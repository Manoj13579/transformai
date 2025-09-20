"use client";

import { usePathname } from "next/navigation";
import Navbar from "./main/Navbar";
import Footer from "./main/Footer";


export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Add routes or patterns where Navbar/Footer should be hidden
  const hideLayout =
    pathname === "/login" ||
    pathname.startsWith("/register") || 
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/admindashboard") ||
    pathname.startsWith("/subscription") ||
    pathname.startsWith("/userdashboard"); //pathname.startsWith for dynamic route n routes with same parent(here).

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}
