"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { PROPERTIES } from "@/lib/constants";
import { FileText, Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ComplaintsPage() {
  const router = useRouter();
  const { role } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!role || (role !== "staff" && role !== "admin" && role !== "responder")) {
      router.push("/login");
    }
  }, [role, router]);

  if (!mounted || !role) return null;

  // Simplified Kanban Board
  const columns = [
    { id: "Open", title: "Open" },
    { id: "In Progress", title: "In Progress" },
    { id: "Awaiting Guest Response", title: "Awaiting Guest" },
    { id: "Resolved", title: "Resolved" }
  ];

  const mockComplaints = [
    { id: "CMP-001", title: "AC not working", priority: "High", status: "Open", property: "taj-bengal", room: "302" },
    { id: "CMP-002", title: "Room service delayed", priority: "Medium", status: "In Progress", property: "oberoi-grand", room: "105" },
    { id: "CMP-003", title: "Noisy neighbors", priority: "Low", status: "Open", property: "itc-sonar", room: "412" },
    { id: "CMP-004", title: "Wifi connection issues", priority: "Medium", status: "Awaiting Guest Response", property: "novotel", room: "804" },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 h-screen flex flex-col">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-primary">Complaints Board</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage guest requests and non-emergency complaints.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search complaints..." className="pl-9 bg-secondary border-border" />
          </div>
          <Button className="bg-primary hover:bg-primary/90 shrink-0"><Plus className="w-4 h-4 mr-2"/> New</Button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 h-full min-w-[1000px]">
          {columns.map(col => (
            <div key={col.id} className="flex-1 flex flex-col bg-secondary/30 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="font-bold text-foreground">{col.title}</h3>
                <span className="bg-secondary text-muted-foreground px-2 py-0.5 rounded text-xs font-bold">
                  {mockComplaints.filter(c => c.status === col.id).length}
                </span>
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto">
                {mockComplaints.filter(c => c.status === col.id).map(complaint => (
                  <div key={complaint.id} className="bg-background p-4 rounded-xl border border-border hover:border-primary/50 transition-colors cursor-grab active:cursor-grabbing">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-mono text-muted-foreground">{complaint.id}</span>
                      <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                        complaint.priority === 'High' ? 'bg-destructive/20 text-destructive' : 
                        complaint.priority === 'Medium' ? 'bg-warning/20 text-warning' : 
                        'bg-info/20 text-info'
                      }`}>
                        {complaint.priority}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm mb-3">{complaint.title}</h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="truncate max-w-[120px]">{PROPERTIES.find(p=>p.id===complaint.property)?.name}</span>
                      <span className="font-medium px-1.5 py-0.5 bg-secondary rounded">Rm {complaint.room}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
