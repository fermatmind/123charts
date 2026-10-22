import { siteTitle, siteDescription, noIndex } from "@/lib/seo";
import { ShieldAlert } from "lucide-react";
import LoginClient from "./login-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: siteTitle("Admin Login"),
  description: siteDescription("123Charts admin login."),
  ...noIndex(),
};

export default function AdminLoginPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConfigured = !!(supabaseUrl && supabaseAnonKey);

  if (!isConfigured) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-terminal-border bg-terminal-surface">
          <ShieldAlert className="h-5 w-5 text-amber-500" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-terminal-fg">
          Admin Not Configured
        </h1>
        <p className="text-xs text-terminal-dim leading-relaxed max-w-sm mx-auto">
          Set <code className="text-terminal-muted">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="text-terminal-muted">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
          environment variables to enable the admin panel.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-xl font-bold tracking-tight text-terminal-fg">
          123Charts Admin
        </h1>
        <p className="text-xs text-terminal-dim">
          Sign in to access the admin panel.
        </p>
      </div>
      <LoginClient supabaseUrl={supabaseUrl} supabaseAnonKey={supabaseAnonKey} />
    </div>
  );
}
