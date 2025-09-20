import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-primary">
          TransformAI
        </Link>
        <nav className="hidden md:flex gap-6 text-sm font-medium">
          <Link href="#features" className="hover:text-primary">Features</Link>
          <Link href="#pricing" className="hover:text-primary">Pricing</Link>
          <Link href="#about" className="hover:text-primary">About</Link>
        </nav>
        <Button>
          <Link href="/login">Get Started</Link>
        </Button>
      </div>
    </motion.header>
  );
}