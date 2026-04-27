"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";
import { i18n } from "@/lib/i18n";
import { ShieldAlert, Activity, Users, MapPin } from "lucide-react";

export default function HomePage() {
  const { language } = useAppStore();
  const t = i18n[language];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-warning/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-3xl"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-primary/10 rounded-full border border-primary/20">
            <ShieldAlert className="w-16 h-16 text-primary" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-foreground tracking-tight mb-6">
          RapidAlert <span className="text-primary">WB</span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
          Real-Time Crisis Response & Incident Management System for hospitality venues across West Bengal.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/report" className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-white bg-primary rounded-xl overflow-hidden transition-all hover:scale-105 shadow-[0_0_20px_rgba(229,62,62,0.4)] hover:shadow-[0_0_30px_rgba(229,62,62,0.6)]">
            <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
            <span className="relative flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Report Emergency
            </span>
          </Link>
          
          <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 font-bold text-foreground bg-secondary/50 rounded-xl hover:bg-secondary transition-colors border border-border">
            Staff Login
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 z-10 max-w-5xl w-full">
        <div className="glass-card p-6 rounded-2xl text-center">
          <Activity className="w-10 h-10 text-success mx-auto mb-4" />
          <h3 className="font-bold text-lg">Real-Time Tracking</h3>
          <p className="text-muted-foreground text-sm mt-2">Monitor incident resolution with live timeline updates.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <Users className="w-10 h-10 text-info mx-auto mb-4" />
          <h3 className="font-bold text-lg">Smart Dispatch</h3>
          <p className="text-muted-foreground text-sm mt-2">AI-powered classification ensures the right team responds.</p>
        </div>
        <div className="glass-card p-6 rounded-2xl text-center">
          <MapPin className="w-10 h-10 text-warning mx-auto mb-4" />
          <h3 className="font-bold text-lg">Precise Mapping</h3>
          <p className="text-muted-foreground text-sm mt-2">Pinpoint accuracy for hospitality venues across West Bengal.</p>
        </div>
      </div>
    </div>
  );
}
