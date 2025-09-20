"use client";

import React, { useState } from "react";
import Sidebar from "@/component/admindashboard/Sidebar";
import Header from "@/component/admindashboard/Header";
import OverviewTab from "@/component/admindashboard/OverviewTab";
import UsersTab from "@/component/admindashboard/UsersTab";
import LogsTab from "@/component/admindashboard/LogsTab";
import UsageTab from "@/component/admindashboard/UsageTab";

export type Tab = "overview" | "users" | "logs" | "usage";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [query, setQuery] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);


  return (
    <div className="min-h-screen bg-surface-50 p-4 md:p-8">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-6 gap-6">
        {/* Sidebar */}
        <Sidebar
         activeTab={activeTab} 
         setActiveTab={setActiveTab}  
         isOpen={isSidebarOpen}
        closeSidebar={() => setSidebarOpen(false)}
 />

        {/* Main */}
        <main className="col-span-1 md:col-span-5">
          {/* query passed to header. this(AdminDashboard) is parent component that passes query to child. when something typed in input in header, query is updated here and it's value is passed to UsersTab below for search */}
          <Header
  query={query}
  setQuery={setQuery}
   toggleSidebar={() => setSidebarOpen((p) => !p)}

/>
          {/* search only needed in UsersTab. The query state is passed down to UsersTab only when activeTab is set to "users". If you're in another tab (such as "overview", "logs" etc.), the UsersTab component is not rendered, so it doesn't react to the query state. */}
          {activeTab === "overview" && <OverviewTab />}     
          {activeTab === "users" && <UsersTab query={query} />}
          {activeTab === "logs" && <LogsTab />}
          {activeTab === "usage" && <UsageTab />}

          <footer className="mt-8 text-sm text-muted-foreground">
            TransformAI &copy; {new Date().getFullYear()} — Admin panel
          </footer>
        </main>
      </div>
    </div>
  );
}
