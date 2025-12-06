import { ReactNode } from "react";
import { TabBar } from "./TabBar";

interface MobileLayoutProps {
  children: ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>
      <TabBar />
    </div>
  );
}
