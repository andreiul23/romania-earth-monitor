import { ReactNode } from "react";
import { Header } from "./Header";

interface LayoutProps {
  children: ReactNode;
  fullHeight?: boolean;
}

export function Layout({ children, fullHeight = false }: LayoutProps) {
  return (
    <div className={`min-h-screen bg-background data-grid ${fullHeight ? "h-screen overflow-hidden" : ""}`}>
      <Header />
      <main className={fullHeight ? "pt-16 h-[calc(100vh-4rem)]" : "pt-16"}>
        {children}
      </main>
    </div>
  );
}
