"use client";

import { Button } from "@/components/ui/button";
import { Tab } from "@/app/admindashboard/page";
import { X } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  activeTab: Tab;
  setActiveTab: (t: Tab) => void;
  isOpen: boolean;
  closeSidebar: () => void;
};

export default function Sidebar({ activeTab, setActiveTab, isOpen, closeSidebar }: Props) {
const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 md:hidden z-40"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed md:static top-0 left-0 h-full md:h-fit w-64 md:w-auto
          bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-lg md:shadow-none
          rounded-none md:rounded-2xl p-4 z-50 md:z-auto
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Close button on mobile */}
        <div className="flex justify-between items-center mb-6 md:hidden">
          <h2 className="text-lg font-bold">TransformAI — Admin</h2>
          <Button variant="ghost" size="icon" onClick={closeSidebar}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Avatar + Admin Info for desktop */}
        <div className="mb-6 hidden md:block">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border">
  <Image
    alt={user?.name || "User"}
    src={user?.image || "/images/avatar.png"}
    fill
    sizes="40px"
    className="object-cover"
  />
</div>

          <p className="text-sm text-muted-foreground">
            Hello {user?.name}
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          {(["overview", "users", "logs", "usage"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setActiveTab(t);
                closeSidebar();
              }}
              className={`text-left rounded-md p-2 w-full cursor-pointer ${
                activeTab === t ? "bg-primary/10" : "hover:bg-muted/40"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}

          <div className="mt-4 border-t pt-4">
            <Button
              size="sm"
              onClick={() => router.push("/profile-edit/admin")}
            >
              Settings
            </Button>
          </div>
            {/* Sign out */}
            <div className="mt-4 border-t pt-4">
                   <Button 
                   variant={"destructive"} 
                   size="sm"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    >
                      Sign out
                      </Button>
            </div>
        </nav>
      </aside>
    </>
  );
}