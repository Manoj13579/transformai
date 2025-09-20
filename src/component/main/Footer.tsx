import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="border-t py-8 mt-20 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
        <p>© {new Date().getFullYear()} TransformAI. All rights reserved.</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-primary">Privacy</Link>
          <Link href="/terms" className="hover:text-primary">Terms</Link>
          <Link href="/contact" className="hover:text-primary">Contact</Link>
        </div>
      </div>
    </motion.footer>
  );
}