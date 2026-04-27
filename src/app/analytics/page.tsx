"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Activity, Clock, ShieldAlert, CheckCircle2 } from "lucide-react";

const COLORS = ['#E53E3E', '#D97706', '#059669', '#2563EB', '#8B5CF6'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { role } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!role || role !== "admin") {
      router.push("/dashboard");
      return;
    }
    const fetchIncidents = async () => {
      const { collection, onSnapshot } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const unsubscribe = onSnapshot(collection(db, "incidents"), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Generate some mock history if not enough data
        if (data.length < 5) {
          const mockHistory = Array.from({length: 20}).map((_, i) => ({
            id: `INC-HIST-${i}`,
            crisisType: ["Fire", "Medical Emergency", "Security Threat", "Power Failure"][Math.floor(Math.random() * 4)],
            region: ["Kolkata Metro", "Darjeeling Hills", "Sundarbans Delta"][Math.floor(Math.random() * 3)],
            severity: Math.floor(Math.random() * 5) + 1,
            status: "Resolved",
            timestamp: Date.now() - (Math.random() * 1000000000), // past few days
          }));
          setIncidents([...data, ...mockHistory]);
        } else {
          setIncidents(data);
        }
      });
      return unsubscribe;
    };

    let unsub: any;
    fetchIncidents().then(u => unsub = u);
    
    return () => {
      if (unsub) unsub();
    };
  }, [role, router]);

  if (!mounted || role !== "admin") return null;

  // Process data for charts
  const typeCount = incidents.reduce((acc, inc) => {
    acc[inc.crisisType] = (acc[inc.crisisType] || 0) + 1;
    return acc;
  }, {});
  const typeData = Object.keys(typeCount).map(key => ({ name: key, value: typeCount[key] }));

  const regionCount = incidents.reduce((acc, inc) => {
    acc[inc.region] = (acc[inc.region] || 0) + 1;
    return acc;
  }, {});
  const regionData = Object.keys(regionCount).map(key => ({ name: key, value: regionCount[key] }));

  // Mock timeline data
  const timelineData = [
    { name: 'Mon', count: 4 }, { name: 'Tue', count: 7 }, { name: 'Wed', count: 5 },
    { name: 'Thu', count: 12 }, { name: 'Fri', count: 8 }, { name: 'Sat', count: 15 }, { name: 'Sun', count: 9 },
  ];

  const avgResponseTime = "8 mins";
  const resolutionRate = Math.round((incidents.filter(i => i.status === "Resolved").length / incidents.length) * 100) || 0;

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-primary">System Analytics</h1>
        <button className="px-4 py-2 bg-secondary rounded-md text-sm border border-border" onClick={() => window.print()}>Export Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-6 rounded-xl border-border">
          <p className="text-sm text-muted-foreground">Total Incidents</p>
          <h3 className="text-3xl font-bold mt-2">{incidents.length}</h3>
          <Activity className="w-6 h-6 text-primary absolute top-6 right-6 opacity-50" />
        </div>
        <div className="glass-card p-6 rounded-xl border-border">
          <p className="text-sm text-muted-foreground">Critical Incidents</p>
          <h3 className="text-3xl font-bold mt-2 text-destructive">{incidents.filter(i=>i.severity===5).length}</h3>
          <ShieldAlert className="w-6 h-6 text-destructive absolute top-6 right-6 opacity-50" />
        </div>
        <div className="glass-card p-6 rounded-xl border-border">
          <p className="text-sm text-muted-foreground">Avg Response Time</p>
          <h3 className="text-3xl font-bold mt-2 text-warning">{avgResponseTime}</h3>
          <Clock className="w-6 h-6 text-warning absolute top-6 right-6 opacity-50" />
        </div>
        <div className="glass-card p-6 rounded-xl border-border">
          <p className="text-sm text-muted-foreground">Resolution Rate</p>
          <h3 className="text-3xl font-bold mt-2 text-success">{resolutionRate}%</h3>
          <CheckCircle2 className="w-6 h-6 text-success absolute top-6 right-6 opacity-50" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 rounded-xl border-border h-[400px]">
          <h3 className="font-bold mb-6">Incidents by Type</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" tick={{fontSize: 12}} />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{backgroundColor: '#0f1117', borderColor: '#1e2433'}} />
              <Bar dataKey="value" fill="#E53E3E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 rounded-xl border-border h-[400px]">
          <h3 className="font-bold mb-6">Incidents by Region</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={regionData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" label={({name})=>name}>
                {regionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{backgroundColor: '#0f1117', borderColor: '#1e2433'}} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-6 rounded-xl border-border h-[400px] lg:col-span-2">
          <h3 className="font-bold mb-6">Incident Frequency (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{backgroundColor: '#0f1117', borderColor: '#1e2433'}} />
              <Line type="monotone" dataKey="count" stroke="#059669" strokeWidth={3} dot={{r: 6}} activeDot={{r: 8}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
