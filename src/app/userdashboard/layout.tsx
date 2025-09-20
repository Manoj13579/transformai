import type { Metadata } from "next";
import "@/app/globals.css";
import { Sidebar } from "@/component/userdashboard/SideBar";
import Shell from "@/component/userdashboard/Shell";

export const metadata: Metadata = {
  title: "User Dashboard",
  description: "All-in-one AI workspace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
      <div>
        <Sidebar />
        <Shell>{children}</Shell>     
        </div>
  );
}
/* layout.tsx workflow 
whatever component is kept in return in layout.tsx will always remain.
children is page.tsx(/userdashboard).
so this children is passed to Shell as props. <Shell>{children}</Shell> and <Shell children={children} />  same
write-article is /userdashboard/write-article coz they are children of /userdashboard.
/userdashboard/blog-title/ etc can be accessed from anywhere so are accessed from sidebar.
*/