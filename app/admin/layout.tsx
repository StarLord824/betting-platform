import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--mykd-bg)", color: "var(--mykd-text)" }}
    >
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          backgroundColor: "rgba(15, 22, 27, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
        }}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          <Link href="/admin" className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 flex items-center justify-center clip-notch-sm"
              style={{ backgroundColor: "#8B5CF6" }}
            >
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span
              className="text-lg tracking-wider"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#8B5CF6" }}>ADMIN</span>{" "}
              <span className="text-white">CONSOLE</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span
              className="text-sm hidden sm:inline-block px-3 py-1 clip-notch-sm"
              style={{
                color: "var(--mykd-text-muted)",
                backgroundColor: "var(--mykd-surface)",
                border: "1px solid var(--mykd-border)",
              }}
            >
              {user.phone || user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button
                className="p-2 transition-colors"
                style={{ color: "var(--mykd-text-dim)" }}
              >
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
