import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LogOut, Zap } from "lucide-react";
import Link from "next/link";
import { WalletDisplay } from "@/components/dashboard/wallet-display";
import prisma from "@/lib/db";

export default async function UserLayout({
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
    select: { balance: true, role: true },
  });

  // Admins can also view the user dashboard (no redirect)

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: "var(--mykd-bg)", color: "var(--mykd-text)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 w-full"
        style={{
          backgroundColor: "rgba(15, 22, 27, 0.9)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--mykd-border)",
        }}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div
              className="w-8 h-8 flex items-center justify-center clip-notch-sm"
              style={{ backgroundColor: "#45F882" }}
            >
              <Zap className="w-4 h-4" style={{ color: "#0F161B" }} />
            </div>
            <span
              className="text-lg tracking-wider"
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 800,
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: "#45F882" }}>BET</span>
              <span className="text-white">PLAY</span>
            </span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <WalletDisplay
              initialBalance={
                profile?.balance ? Number(profile.balance) : 50000
              }
            />

            <form action="/auth/signout" method="post">
              <button className="p-2 transition-colors rounded text-gray-500 hover:text-[#45F882]">
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
