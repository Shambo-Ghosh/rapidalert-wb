"use client";

import { useEffect, useState } from "react";
import { isDemoMode } from "@/lib/firebase";
import { i18n } from "@/lib/i18n";
import { useAppStore } from "@/lib/store";

export function DemoInit() {
  const [mounted, setMounted] = useState(false);
  const { language } = useAppStore();
  const t = i18n[language];

  useEffect(() => {
    setMounted(true);
    if (isDemoMode) {
      // Initialize local storage demo data if empty
      if (!localStorage.getItem('incidents')) {
        const demoIncidents = [
          {
            id: 'INC-1001',
            name: 'John Doe',
            phone: '9876543210',
            region: 'Kolkata Metro',
            property: 'taj-bengal',
            room: 'Lobby',
            floor: 'G',
            crisisType: 'Fire',
            description: 'Smoke coming from the kitchen vent.',
            severity: 5,
            status: 'New',
            timestamp: Date.now() - 600000,
          },
          // Added one demo incident, more can be added later
        ];
        localStorage.setItem('incidents', JSON.stringify(demoIncidents));
      }
    }
  }, []);

  if (!mounted || !isDemoMode) return null;

  return (
    <div className="bg-warning text-warning-foreground px-4 py-2 text-center text-sm font-medium z-[100] relative">
      {t["demo.banner"]}
    </div>
  );
}
