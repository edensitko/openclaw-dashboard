"use client";

import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Background orbs — iOS-like ambient gradient */}
      <div className="orb w-[300px] h-[300px] md:w-[600px] md:h-[600px] top-[-15%] left-[-10%]" style={{ background: "var(--orb-1)" }} />
      <div className="orb w-[250px] h-[250px] md:w-[500px] md:h-[500px] top-[30%] right-[-15%]" style={{ background: "var(--orb-2)" }} />
      <div className="orb w-[200px] h-[200px] md:w-[400px] md:h-[400px] bottom-[-10%] left-[25%]" style={{ background: "var(--orb-3)" }} />

      <Sidebar />
      <div className="ml-0 lg:ml-[240px] min-h-screen flex flex-col relative z-10">
        <TopBar />
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
