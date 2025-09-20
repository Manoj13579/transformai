"use client";

import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  query: string;
  setQuery: (q: string) => void;
  toggleSidebar: () => void;
}

export default function Header({ query, setQuery, toggleSidebar }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-3">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full md:w-1/3"
      />
    </div>
  );
}