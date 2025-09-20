"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Type as TypeIcon,
  Image as ImageIcon,
  Eraser,
  ClipboardCheck,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/userdashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/userdashboard/generate-article", label: "Write Article", icon: FileText },
  { href: "/userdashboard/generate-blog-title", label: "Blog Title", icon: TypeIcon },
  { href: "/userdashboard/generate-image", label: "Generate Image", icon: ImageIcon },
  { href: "/userdashboard/remove-image-background", label: "Remove Background", icon: Eraser },
  { href: "/userdashboard/resume-review", label: "Review Resume", icon: ClipboardCheck },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 shrink-0 border-r bg-background/60 backdrop-blur md:block">
      <div className="flex h-full flex-col gap-4 p-4">
        {/* Avatar + User Info */}
        <div className="flex items-center gap-3 p-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border">
            <Image
              alt={user?.name || "User"}
              src={user?.image || "/images/avatar.png"}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user && "Online"}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {items.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition hover:bg-accent",
                  active && "bg-accent text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
        {/* Settings */}
       <Button onClick={() => router.push("/profile-edit/user")}>Settings</Button>
        {/* Sign out */}
       <Button variant={"destructive"} onClick={() => signOut({ callbackUrl: "/" })}>Sign out</Button>

        {/* Footer */}
        <div className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Transform AI
        </div>
      </div>
    </aside>
  );
}