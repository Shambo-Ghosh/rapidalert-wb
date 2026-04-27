"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { ShieldAlert, MapPin, Building, Phone, Clock, FileText, CheckCircle2, User, AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { PROPERTIES } from "@/lib/constants";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

export default function IncidentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { role, user } = useAuthStore();
  const [incident, setIncident] = useState<any>(null);
  const [note, setNote] = useState("");
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "mock-key",
  });

  useEffect(() => {
    if (!role || (role !== "staff" && role !== "admin" && role !== "responder")) {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      const { doc, collection, onSnapshot, query, orderBy } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");

      const unsubIncident = onSnapshot(doc(db, "incidents", id as string), (docSnap) => {
        if (docSnap.exists()) {
          setIncident({ id: docSnap.id, ...docSnap.data() });
        }
        setLoading(false);
      });
      
      const q = query(collection(db, "incidents", id as string, "incidentLogs"), orderBy("timestamp", "desc"));
      const unsubLogs = onSnapshot(q, (snapshot) => {
        setNotes(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      });

      return () => {
        unsubIncident();
        unsubLogs();
      };
    };

    let unsub: any;
    fetchData().then(u => unsub = u);
    
    return () => {
      if (unsub) unsub();
    };
  }, [id, role, router]);

  const handleStatusChange = async (newStatus: string) => {
    const { doc, updateDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    
    await updateDoc(doc(db, "incidents", id as string), { status: newStatus });
    
    // Add log
    await addLog(`Status changed to ${newStatus}`, "system");
    toast.success(`Status updated to ${newStatus}`);
  };

  const addLog = async (message: string, type: "note" | "system" = "note") => {
    const { collection, addDoc } = await import("firebase/firestore");
    const { db } = await import("@/lib/firebase");
    
    const newNote = {
      message,
      type,
      author: type === "system" ? "System" : (user?.name || "Staff"),
      timestamp: Date.now(),
    };
    
    await addDoc(collection(db, "incidents", id as string, "incidentLogs"), newNote);
  };

  const submitNote = () => {
    if (!note.trim()) return;
    addLog(note, "note");
    setNote("");
    toast.success("Note added successfully");
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center">Loading incident details...</div>;

  if (!incident) return <div className="min-h-screen bg-background flex items-center justify-center">Incident not found.</div>;

  const propertyDetails = PROPERTIES.find(p => p.id === incident.property);
  const mapCenter = {
    lat: propertyDetails?.lat || 22.5726,
    lng: propertyDetails?.lng || 88.3639
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Header */}
      <div className={`glass-card p-6 rounded-2xl border-t-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
        incident.severity === 5 ? 'border-t-destructive' : 'border-t-primary'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full ${incident.severity === 5 ? 'bg-destructive/20 text-destructive animate-pulse' : 'bg-primary/20 text-primary'}`}>
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black">{incident.id}</h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                incident.status === 'Resolved' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
              }`}>
                {incident.status}
              </span>
              · Reported {new Date(incident.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={incident.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px] bg-secondary border-border">
              <SelectValue placeholder="Update Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Acknowledged">Acknowledged</SelectItem>
              <SelectItem value="Responding">Responding</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-white/5" onClick={() => window.print()}>Export PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-card p-6 rounded-xl border-border">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-primary"><User className="w-4 h-4"/> Reporter Details</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-muted-foreground">Name:</span> <span className="font-medium">{incident.name}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Phone:</span> <span className="font-medium">+91 {incident.phone}</span></p>
              </div>
            </div>
            
            <div className="glass-card p-6 rounded-xl border-border">
              <h3 className="font-bold flex items-center gap-2 mb-4 text-primary"><MapPin className="w-4 h-4"/> Location Details</h3>
              <div className="space-y-2 text-sm">
                <p className="flex justify-between"><span className="text-muted-foreground">Property:</span> <span className="font-medium">{propertyDetails?.name || incident.property}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Region:</span> <span className="font-medium">{incident.region}</span></p>
                <p className="flex justify-between"><span className="text-muted-foreground">Room:</span> <span className="font-medium">{incident.room} (Floor {incident.floor})</span></p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl border-border">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-primary"><FileText className="w-4 h-4"/> Incident Description</h3>
            <p className="text-foreground leading-relaxed bg-white/5 p-4 rounded-lg">{incident.description}</p>
          </div>

          <div className="glass-card p-6 rounded-xl border-border">
            <h3 className="font-bold flex items-center gap-2 mb-4 text-primary"><MessageSquare className="w-4 h-4"/> Staff Notes & Logs</h3>
            <div className="space-y-4 mb-6">
              <Textarea 
                placeholder="Add an internal note..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="bg-white/5 border-white/10"
              />
              <Button onClick={submitNote} className="bg-primary hover:bg-primary/90">Add Note</Button>
            </div>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {notes.length === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">No notes or logs yet.</p>
              ) : (
                notes.map(n => (
                  <div key={n.id} className={`p-4 rounded-lg text-sm ${n.type === 'system' ? 'bg-secondary/50 border border-border' : 'bg-white/5 border border-white/10'}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`font-bold ${n.type === 'system' ? 'text-muted-foreground' : 'text-info'}`}>{n.author}</span>
                      <span className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-foreground">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Map & AI */}
        <div className="space-y-6">
          <div className="glass-card p-0 rounded-xl overflow-hidden border-border h-[400px] relative">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '400px' }}
                center={mapCenter}
                zoom={14}
                options={{
                  disableDefaultUI: true,
                  zoomControl: true,
                  styles: [
                    { featureType: "all", elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
                    { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
                    { featureType: "all", elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
                    { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] }
                  ]
                }}
              >
                <Marker 
                  position={mapCenter} 
                  icon={{
                    path: typeof window !== "undefined" && window.google ? window.google.maps.SymbolPath.CIRCLE : 0,
                    scale: 10,
                    fillColor: incident.severity === 5 ? "#ef4444" : "#f59e0b",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 3,
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="absolute inset-0 bg-secondary/50 flex flex-col items-center justify-center p-4 text-center z-10">
                <MapPin className="w-12 h-12 text-primary mb-2 animate-pulse" />
                <p className="font-bold text-muted-foreground">Loading Maps API...</p>
              </div>
            )}
          </div>

          {incident.aiAnalysis && (
            <div className="glass-card p-6 rounded-xl border-warning/50">
              <div className="flex items-center gap-2 mb-4">
                <span className="bg-warning/20 text-warning px-2 py-1 rounded text-xs font-bold uppercase">AI Insights</span>
                <span className="text-sm text-muted-foreground">Generated at report time</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Risk Level</p>
                  <p className={`font-bold ${incident.aiAnalysis.riskLevel === 'Critical' ? 'text-destructive' : 'text-warning'}`}>
                    {incident.aiAnalysis.riskLevel}
                  </p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Recommended Actions</p>
                  <ul className="list-disc pl-4 text-sm space-y-1">
                    {incident.aiAnalysis.immediateActions?.map((act: string, i: number) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Team to Alert</p>
                  <p className="text-sm font-medium">{incident.aiAnalysis.teamToAlert}</p>
                </div>
                
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Est. Response Time</p>
                  <p className="text-sm font-medium">{incident.aiAnalysis.estimatedResponseTime}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
