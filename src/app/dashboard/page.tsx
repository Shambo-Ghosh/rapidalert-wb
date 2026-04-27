"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldAlert, Activity, CheckCircle2, Clock, MapPin, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const { role } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  
  useEffect(() => {
    if (!role || (role !== "staff" && role !== "admin" && role !== "responder")) {
      router.push("/login");
      return;
    }

    const fetchIncidents = async () => {
      const { collection, onSnapshot, query, orderBy } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const q = query(collection(db, "incidents"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setIncidents(data);
      });
      return unsubscribe;
    };

    let unsub: any;
    fetchIncidents().then(u => unsub = u);
    
    return () => {
      if (unsub) unsub();
    };
  }, [role, router]);

  if (!role) return null;

  const activeIncidents = incidents.filter(i => i.status !== "Resolved");
  const criticalCount = activeIncidents.filter(i => i.severity === 5).length;
  const respondingCount = activeIncidents.filter(i => i.status === "Responding").length;
  const resolvedToday = incidents.filter(i => i.status === "Resolved" && (Date.now() - i.timestamp < 86400000)).length;

  const filteredIncidents = incidents.filter(i => {
    const matchSearch = i.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       i.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       i.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = filterSeverity === "all" || i.severity.toString() === filterSeverity;
    return matchSearch && matchSeverity;
  });

  return (
    <div className="p-4 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight">Staff Dashboard</h1>
        <div className="flex items-center gap-2 text-sm text-success">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          Live Sync Active
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-xl border-t-4 border-t-primary">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
              <h3 className="text-3xl font-bold mt-2">{activeIncidents.length}</h3>
            </div>
            <Activity className="w-8 h-8 text-primary opacity-50" />
          </div>
        </div>
        
        <div className={`glass-card p-6 rounded-xl border-t-4 ${criticalCount > 0 ? 'border-t-destructive animate-pulse-border' : 'border-t-muted'}`}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Critical Right Now</p>
              <h3 className="text-3xl font-bold mt-2 text-destructive">{criticalCount}</h3>
            </div>
            <AlertTriangle className="w-8 h-8 text-destructive opacity-50" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-t-4 border-t-warning">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Responding</p>
              <h3 className="text-3xl font-bold mt-2 text-warning">{respondingCount}</h3>
            </div>
            <Clock className="w-8 h-8 text-warning opacity-50" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-t-4 border-t-success">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
              <h3 className="text-3xl font-bold mt-2 text-success">{resolvedToday}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-success opacity-50" />
          </div>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between border-border sticky top-4 z-30 bg-background/80 backdrop-blur-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID, Room, Name..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[180px] bg-white/5 border-white/10">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              <SelectItem value="5">Severity 5 (Critical)</SelectItem>
              <SelectItem value="4">Severity 4 (High)</SelectItem>
              <SelectItem value="3">Severity 3 (Mod)</SelectItem>
              <SelectItem value="2">Severity 2 (Low)</SelectItem>
              <SelectItem value="1">Severity 1 (Minor)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredIncidents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
            No incidents found matching your criteria.
          </div>
        ) : (
          filteredIncidents.map((incident) => {
            const timeElapsed = Math.floor((Date.now() - incident.timestamp) / 60000); // mins
            return (
              <motion.div 
                key={incident.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`glass-card rounded-xl p-6 border-l-4 ${
                  incident.severity === 5 ? 'border-l-destructive shadow-[0_0_15px_rgba(229,62,62,0.15)]' : 
                  incident.severity === 4 ? 'border-l-orange-500' : 
                  incident.severity === 3 ? 'border-l-yellow-500' : 
                  'border-l-blue-500'
                } hover:bg-white/5 transition-colors`}
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono font-bold text-primary">{incident.id}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3"/> {timeElapsed} mins ago</span>
                      {incident.aiAnalysis?.riskLevel && (
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                          incident.aiAnalysis.riskLevel === 'Critical' ? 'bg-destructive/20 text-destructive' : 'bg-secondary text-muted-foreground'
                        }`}>
                          AI: {incident.aiAnalysis.riskLevel}
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-muted-foreground" /> {incident.crisisType}
                    </h4>
                    <p className="text-muted-foreground mt-1 text-sm line-clamp-2">{incident.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {incident.property} ({incident.room})</span>
                      <span className="px-2 py-1 rounded bg-secondary text-secondary-foreground font-medium">Status: {incident.status}</span>
                      <span className="text-muted-foreground">Reporter: {incident.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 min-w-[140px] shrink-0">
                    <Link href={`/incident/${incident.id}`} className="w-full">
                      <Button variant="default" className="w-full bg-primary hover:bg-primary/90 text-white">View Details</Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={async () => {
                        const { doc, updateDoc } = await import("firebase/firestore");
                        const { db } = await import("@/lib/firebase");
                        const { user } = useAuthStore.getState();
                        await updateDoc(doc(db, "incidents", incident.id), { 
                          assignedTo: user?.name || "Staff",
                          status: incident.status === "New" ? "Responding" : incident.status
                        });
                      }}
                      disabled={!!incident.assignedTo}
                      className="w-full bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      {incident.assignedTo ? `Assigned to ${incident.assignedTo}` : "Assign to Me"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
