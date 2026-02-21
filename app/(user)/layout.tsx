import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Gamepad2, LogOut, Wallet } from "lucide-react";
import Link from "next/link";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance, role")
    .eq("id", user.id)
    .single();

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-emerald-400">
            <Gamepad2 className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">BetPlay</span>
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded-full">
              <Wallet className="h-4 w-4 text-emerald-400" />
              <span className="font-medium text-sm">
                ₹{profile?.balance?.toLocaleString() || "0"}
              </span>
            </div>

            <form action="/auth/signout" method="post">
              <button className="text-neutral-400 hover:text-white p-2">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-lg mx-auto p-4">{children}</main>
    </div>
  );
}
