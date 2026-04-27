"use client";

import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { i18n } from "@/lib/i18n";
import { WB_REGIONS, PROPERTIES, CRISIS_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertTriangle, MapPin, Building, ShieldAlert, Phone, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useJsApiLoader, GoogleMap, Marker } from "@react-google-maps/api";

export default function ReportPage() {
  const router = useRouter();
  const { language } = useAppStore();
  const t = i18n[language];
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [newIncidentId, setNewIncidentId] = useState<string | null>(null);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "mock-key",
  });
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    region: "",
    property: "",
    room: "",
    floor: "",
    crisisType: "",
    description: "",
    severity: 0,
    confirmed: false,
  });

  const handlePropertyChange = (value: string) => {
    const prop = PROPERTIES.find((p) => p.id === value);
    setFormData({ ...formData, property: value, region: prop?.region || "" });
  };

  const submitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone.length !== 10) {
      toast.error("Phone number must be 10 digits");
      return;
    }
    if (formData.description.length < 20) {
      toast.error("Please provide a more detailed description (min 20 chars)");
      return;
    }
    if (formData.severity === 0) {
      toast.error("Please select a severity level");
      return;
    }
    if (!formData.confirmed) {
      toast.error("You must confirm this is a real emergency");
      return;
    }

    setLoading(true);
    
    try {
      // Call Gemini API
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crisisType: formData.crisisType,
          severity: formData.severity,
          description: formData.description,
        })
      });
      
      const aiAnalysis = await res.json();
      
      // Save to Firebase Firestore
      const { collection, doc, setDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      
      const newIncident = {
        id: `INC-${Math.floor(1000 + Math.random() * 9000)}`,
        ...formData,
        status: "New",
        timestamp: Date.now(),
        aiAnalysis
      };

      await setDoc(doc(collection(db, "incidents"), newIncident.id), newIncident);

      setAnalysisResult(aiAnalysis);
      setNewIncidentId(newIncident.id);
      toast.success("Emergency report submitted successfully!");
    } catch (error) {
      toast.error("Failed to process report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const propertyDetails = PROPERTIES.find(p => p.id === formData.property);
  const mapCenter = {
    lat: propertyDetails?.lat || 22.5726,
    lng: propertyDetails?.lng || 88.3639
  };

  if (analysisResult && newIncidentId) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-2xl glass-card p-8 rounded-2xl border-success/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-success animate-pulse" />
          <div className="flex flex-col items-center text-center mb-8">
            <CheckCircle2 className="w-16 h-16 text-success mb-4" />
            <h2 className="text-3xl font-bold text-foreground">Incident Reported</h2>
            <p className="text-xl text-muted-foreground mt-2">ID: <span className="text-primary font-mono font-bold">{newIncidentId}</span></p>
          </div>
          
          <div className="space-y-6">
            <div className="glass-card p-0 rounded-2xl overflow-hidden h-[300px] relative border-border">
              {isLoaded ? (
                <GoogleMap
                  mapContainerStyle={{ width: '100%', height: '300px' }}
                  center={mapCenter}
                  zoom={15}
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
                      fillColor: "#ef4444",
                      fillOpacity: 1,
                      strokeColor: "#ffffff",
                      strokeWeight: 3,
                    }}
                  />
                </GoogleMap>
              ) : (
                <div className="absolute inset-0 bg-secondary/50 flex flex-col items-center justify-center p-4 text-center z-10">
                  <MapPin className="w-12 h-12 text-primary mb-2 animate-pulse" />
                  <p className="font-bold text-muted-foreground">Loading Map API...</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-secondary/50 rounded-xl p-6 mb-8 border border-border">
            <h3 className="text-lg font-bold text-warning mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" /> Recommended Immediate Actions
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-foreground">
              {analysisResult.immediateActions?.map((action: string, i: number) => (
                <li key={i} className="pl-2">{action}</li>
              ))}
            </ol>
            <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Team Alerted</p>
                <p className="font-semibold text-info">{analysisResult.teamToAlert}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Est. Response</p>
                <p className="font-semibold">{analysisResult.estimatedResponseTime}</p>
              </div>
            </div>
          </div>
          
          <Link href={`/track/${newIncidentId}`}>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(229,62,62,0.4)]">
              Track Your Incident &rarr;
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col items-center py-12 px-4">
      {/* Top Banner */}
      <div className="fixed top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 z-40 font-bold text-sm shadow-md animate-pulse">
        {t["banner.emergency"]}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl mt-12 glass-card rounded-2xl p-8 border border-primary/20 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8 pb-6 border-b border-border">
            <div className="p-3 bg-primary/20 rounded-full">
              <ShieldAlert className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{t["report.title"]}</h1>
              <p className="text-muted-foreground mt-1">Please provide accurate details for immediate response.</p>
            </div>
          </div>

          <form onSubmit={submitReport} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4"/> Mobile Number</Label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-white/10 bg-white/5 text-muted-foreground rounded-l-md">+91</span>
                  <Input id="phone" required type="tel" maxLength={10} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g,'')})} placeholder="10-digit number" className="rounded-l-none bg-white/5 border-white/10" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Building className="w-4 h-4"/> Property</Label>
              <Select value={formData.property} onValueChange={handlePropertyChange} required>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select the affected property" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTIES.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.region})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="room">Room / Location</Label>
                <Input id="room" required value={formData.room} onChange={(e) => setFormData({...formData, room: e.target.value})} placeholder="e.g. Room 402 or Main Lobby" className="bg-white/5 border-white/10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Input id="floor" required value={formData.floor} onChange={(e) => setFormData({...formData, floor: e.target.value})} placeholder="e.g. 4th Floor" className="bg-white/5 border-white/10" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2"><AlertTriangle className="w-4 h-4"/> Crisis Type</Label>
              <Select value={formData.crisisType} onValueChange={(v) => setFormData({...formData, crisisType: v})} required>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select crisis type" />
                </SelectTrigger>
                <SelectContent>
                  {CRISIS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea 
                id="description" 
                required 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Describe the situation clearly..." 
                className="bg-white/5 border-white/10 min-h-[100px]" 
              />
              <p className="text-xs text-muted-foreground text-right">{formData.description.length} chars (min 20)</p>
            </div>

            <div className="space-y-3">
              <Label>Severity Level</Label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { level: 1, label: "Minor", color: "bg-green-500/20 hover:bg-green-500/40 text-green-500 border-green-500/50" },
                  { level: 2, label: "Low", color: "bg-blue-500/20 hover:bg-blue-500/40 text-blue-500 border-blue-500/50" },
                  { level: 3, label: "Mod", color: "bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 border-yellow-500/50" },
                  { level: 4, label: "High", color: "bg-orange-500/20 hover:bg-orange-500/40 text-orange-500 border-orange-500/50" },
                  { level: 5, label: "Critical", color: "bg-red-500/20 hover:bg-red-500/40 text-red-500 border-red-500/50" }
                ].map((s) => (
                  <button
                    key={s.level}
                    type="button"
                    onClick={() => setFormData({...formData, severity: s.level})}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${s.color} ${formData.severity === s.level ? 'ring-2 ring-white scale-105' : 'opacity-70'}`}
                  >
                    <span className="text-lg font-bold">{s.level}</span>
                    <span className="text-[10px] uppercase font-semibold">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4">
              <input 
                type="checkbox" 
                id="confirm" 
                required
                className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary bg-white/5"
                checked={formData.confirmed}
                onChange={(e) => setFormData({...formData, confirmed: e.target.checked})}
              />
              <label htmlFor="confirm" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-red-400">
                {t["report.confirm"]}
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-6 text-lg rounded-xl shadow-[0_0_20px_rgba(229,62,62,0.4)] transition-all hover:shadow-[0_0_30px_rgba(229,62,62,0.6)]">
              {loading ? "Submitting..." : "EMERGENCY REPORT"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
