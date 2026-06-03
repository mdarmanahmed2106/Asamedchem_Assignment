"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    // Fetch session to determine role-based redirect
    const res = await fetch("/api/auth/session");
    const session = await res.json();

    if (session?.user?.role === "ADMIN") {
      router.push("/admin/products");
    } else {
      router.push("/seller/catalog");
    }

    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-none border-2 border-black bg-black text-white font-bold text-lg mx-auto dark:border-white dark:bg-white dark:text-black">
            I
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Inventory & Order System
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the portal
          </p>
        </div>

        <Card className="border border-border shadow-none rounded-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="rounded-sm border-border bg-background focus:ring-0 focus:border-black"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="rounded-sm border-border bg-background focus:ring-0 focus:border-black"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-sm">
                  <p className="text-xs font-medium text-black dark:text-white text-center">{error}</p>
                </div>
              )}
              <Button type="submit" className="w-full rounded-sm btn-monochrome-hover bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-8 border-t border-border pt-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 text-center">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2 border border-border rounded-sm bg-neutral-50 dark:bg-neutral-900">
                  <p className="font-bold text-foreground">Admin Portal</p>
                  <p className="text-muted-foreground">admin@example.com</p>
                  <p className="text-muted-foreground mt-1">pwd: <span className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">admin123</span></p>
                </div>
                <div className="p-2 border border-border rounded-sm bg-neutral-50 dark:bg-neutral-900">
                  <p className="font-bold text-foreground">Seller Catalog</p>
                  <p className="text-muted-foreground">seller@example.com</p>
                  <p className="text-muted-foreground mt-1">pwd: <span className="font-mono bg-neutral-200 dark:bg-neutral-800 px-1 py-0.5 rounded">seller123</span></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <p className="px-8 text-center text-xs text-muted-foreground">
          Secure authentication powered by NextAuth.js
        </p>
      </div>
    </div>
  );
}
