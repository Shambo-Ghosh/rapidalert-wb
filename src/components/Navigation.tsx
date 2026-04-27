"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore, useAppStore } from "@/lib/store";
import { i18n } from "@/lib/i18n";
import { AlertTriangle, LayoutDashboard, FileText, User, LogOut, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const pathname = usePathname();
  const { role, logout } = useAuthStore();
  const { language, toggleLanguage } = useAppStore();
  const t = i18n[language];

  // Map roles to visible nav links
  const links = [
    { href: "/", label: t["nav.home"], icon: AlertTriangle, show: true },
    { href: "/report", label: t["nav.report"], icon: AlertTriangle, show: true },
    { href: "/dashboard", label: t["nav.dashboard"], icon: LayoutDashboard, show: role === "staff" || role === "admin" || role === "responder" },
    { href: "/complaints", label: t["nav.complaints"], icon: FileText, show: role === "staff" || role === "admin" || role === "responder" },
  ].filter(l => l.show);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r border-border bg-card/50 backdrop-blur-md z-50">
        <div className="p-6 flex items-center gap-2">
          <AlertTriangle className="text-primary w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">{t["app.title"]}</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <span className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'}`}>
                  <Icon className="w-5 h-5" />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-4">
          <Button variant="outline" size="sm" onClick={toggleLanguage} className="w-full flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {language === 'en' ? 'বাংলা' : 'English'}
          </Button>

          {role ? (
            <Button variant="ghost" onClick={async () => {
              const { auth } = await import("@/lib/firebase");
              const { signOut } = await import("firebase/auth");
              try {
                await signOut(auth);
                logout();
              } catch (e) {
                console.error(e);
              }
            }} className="w-full flex items-center justify-start gap-3 text-muted-foreground hover:text-destructive">
              <LogOut className="w-5 h-5" />
              Logout
            </Button>
          ) : (
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full">Login</Button>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Tab Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-xl z-50 flex justify-around p-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <span className={`flex flex-col items-center p-2 rounded-lg ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                <Icon className="w-6 h-6" />
                <span className="text-[10px] mt-1">{link.label}</span>
              </span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
