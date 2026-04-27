"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Users, Activity, CheckCircle2 } from "lucide-react";

export default function StaffPanelPage() {
  const router = useRouter();
  const { role } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!role || role !== "admin") {
      router.push("/dashboard");
    }
  }, [role, router]);

  if (!mounted || role !== "admin") return null;

  // Mock staff data
  const staffMembers = [
    { id: "S1", name: "Rahul Sharma", role: "Responder", region: "Kolkata Metro", activeIncidents: 2, resolvedWeekly: 14, status: "On Duty", load: 20 },
    { id: "S2", name: "Priya Das", role: "Responder", region: "Darjeeling Hills", activeIncidents: 0, resolvedWeekly: 8, status: "On Duty", load: 0 },
    { id: "S3", name: "Amit Kumar", role: "Staff", region: "Sundarbans Delta", activeIncidents: 1, resolvedWeekly: 5, status: "On Break", load: 10 },
    { id: "S4", name: "Sneha Roy", role: "Staff", region: "Kolkata Metro", activeIncidents: 3, resolvedWeekly: 18, status: "On Duty", load: 30 },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black tracking-tight text-primary">Staff Attention Panel</h1>
        <div className="bg-primary/20 text-primary px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2">
          <Users className="w-4 h-4"/> 4 Active Personnel
        </div>
      </div>

      <div className="glass-card p-0 rounded-2xl border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Personnel</th>
                <th className="px-6 py-4 font-medium">Role & Region</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Current Workload</th>
                <th className="px-6 py-4 font-medium">Resolved (Week)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {staffMembers.map((staff) => (
                <tr key={staff.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-foreground">{staff.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">{staff.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-info">{staff.role}</div>
                    <div className="text-xs text-muted-foreground mt-1">{staff.region}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      staff.status === 'On Duty' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                    }`}>
                      {staff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold">{staff.activeIncidents}</span>
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden min-w-[100px]">
                        <div 
                          className={`h-full ${staff.load > 25 ? 'bg-destructive' : staff.load > 15 ? 'bg-warning' : 'bg-success'}`}
                          style={{ width: `${staff.load}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success"/>
                      <span className="font-bold">{staff.resolvedWeekly}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
