"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, MapPin, Building, Phone, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function TrackIncidentPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncident = async () => {
      const { doc, onSnapshot } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      const unsubscribe = onSnapshot(doc(db, "incidents", id as string), (docSnap) => {
        if (docSnap.exists()) {
          setIncident({ id: docSnap.id, ...docSnap.data() });
        } else {
          setIncident(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    };

    let unsub: any;
    fetchIncident().then(u => unsub = u);
    
    return () => {
      if (unsub) unsub();
    };
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading tracker...</div>;
  }

  if (!incident) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-bold">Incident Not Found</h2>
        <p className="text-muted-foreground mt-2">The incident ID {id} could not be located.</p>
      </div>
    );
  }

  const steps = ["New", "Acknowledged", "Responding", "Resolved"];
  const currentStepIndex = steps.indexOf(incident.status);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-3xl space-y-6">
        
        <div className="flex items-center justify-between glass-card p-6 rounded-2xl border-border">
          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Incident Tracker</p>
            <h1 className="text-3xl font-black text-foreground mt-1">{incident.id}</h1>
          </div>
          <div className="text-right">
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${incident.severity === 5 ? 'bg-destructive/20 text-destructive border-destructive/50' : 'bg-primary/20 text-primary border-primary/50'}`}>
              Severity {incident.severity}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-card p-6 rounded-2xl border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-primary"/> Location Details</h3>
            <div className="space-y-3">
              <p className="flex justify-between"><span className="text-muted-foreground">Property:</span> <span className="font-semibold text-right">{incident.property}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Region:</span> <span className="font-semibold text-right">{incident.region}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Room/Floor:</span> <span className="font-semibold text-right">{incident.room}, Fl {incident.floor}</span></p>
            </div>
          </div>
          <div className="glass-card p-6 rounded-2xl border-border">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-primary"/> Crisis Details</h3>
            <div className="space-y-3">
              <p className="flex justify-between"><span className="text-muted-foreground">Type:</span> <span className="font-semibold text-right">{incident.crisisType}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">Reported At:</span> <span className="font-semibold text-right">{new Date(incident.timestamp).toLocaleTimeString()}</span></p>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-warning" />
          <h3 className="text-xl font-bold mb-8">Live Status</h3>
          
          <div className="relative">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-border z-0" />
            <div className="space-y-8 relative z-10">
              {steps.map((step, index) => {
                const isCompleted = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                
                return (
                  <div key={step} className={`flex gap-6 items-start transition-opacity ${isCompleted ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${isCompleted ? 'bg-success/20 border-success text-success' : 'bg-secondary border-border text-muted-foreground'} ${isCurrent ? 'ring-4 ring-success/20 shadow-[0_0_15px_rgba(5,150,105,0.5)]' : ''}`}>
                      {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="pt-1">
                      <h4 className={`text-lg font-bold ${isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</h4>
                      {isCurrent && (
                        <p className="text-sm text-success mt-1">This step is currently in progress or completed.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {incident.aiAnalysis && (
          <div className="glass-card p-6 rounded-2xl border-border">
            <h3 className="text-lg font-bold mb-4 text-warning">AI Response Guidance</h3>
            <p className="text-sm text-muted-foreground mb-4">The following actions have been recommended to the response team:</p>
            <ol className="list-decimal pl-5 space-y-2 text-foreground/80 text-sm">
              {incident.aiAnalysis.immediateActions?.map((action: string, i: number) => (
                <li key={i} className="pl-2">{action}</li>
              ))}
            </ol>
          </div>
        )}

      </div>
    </div>
  );
}
