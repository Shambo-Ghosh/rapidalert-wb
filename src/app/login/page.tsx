"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldAlert, LogIn, UserPlus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent, mode: "login" | "register") => {
    e.preventDefault();
    setLoading(true);

    try {
      const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
      const { auth, db } = await import("@/lib/firebase");
      const { doc, getDoc, setDoc } = await import("firebase/firestore");

      let userCredential;
      if (mode === "register") {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      
      const user = userCredential.user;

      // Fetch or create user role document
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      let role = "staff";
      if (userDoc.exists()) {
        role = userDoc.data().role;
      } else {
        // Assign roles based on email domain or keywords for demo purposes
        if (email.includes("admin")) role = "admin";
        else if (email.includes("responder")) role = "responder";
        
        await setDoc(userDocRef, {
          email: user.email,
          role: role,
          createdAt: Date.now()
        });
      }

      setAuth({ email: user.email, uid: user.uid, name: "Staff Member" }, role as any);
      toast.success(mode === "login" ? `Welcome back, ${role}` : `Account created! Logged in as ${role}`);
      
      router.push("/dashboard");
    } catch (error: any) {
      console.error(error);
      let errorMessage = "Authentication failed";
      if (error.code === 'auth/user-not-found') errorMessage = "User not found. Please create an account.";
      if (error.code === 'auth/wrong-password') errorMessage = "Incorrect password.";
      if (error.code === 'auth/email-already-in-use') errorMessage = "An account with this email already exists.";
      if (error.code === 'auth/invalid-credential') errorMessage = "Invalid email or password.";
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-2xl p-8 border border-border">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-primary/10 rounded-full mb-4">
            <ShieldAlert className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Staff Portal</h1>
          <p className="text-muted-foreground text-sm mt-1 text-center">
            Access the RapidAlert WB Dashboard
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Create Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="staff@rapidalert.wb" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <Button type="submit" disabled={loading} className="w-full mt-2">
                {loading ? "Authenticating..." : <span className="flex items-center gap-2"><LogIn className="w-4 h-4"/> Sign In</span>}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={(e) => handleAuth(e, "register")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reg-email">Work Email</Label>
                <Input id="reg-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="new.staff@rapidalert.wb" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" minLength={6} />
              </div>
              <Button type="submit" disabled={loading} variant="secondary" className="w-full mt-2">
                {loading ? "Creating account..." : <span className="flex items-center gap-2"><UserPlus className="w-4 h-4"/> Register Account</span>}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center border-t border-border pt-6">
          <Link href="/report" className="text-sm text-primary hover:underline flex items-center justify-center gap-1">
            Report an emergency without login &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
