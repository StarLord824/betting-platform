import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ShieldCheck, LogOut } from "lucide-react";
import Link from "next/link";

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

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-indigo-900/50 bg-neutral-950/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4 lg:px-8 max-w-7xl mx-auto">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-indigo-400"
          >
            <ShieldCheck className="h-6 w-6" />
            <span className="font-bold text-xl tracking-tight">
              Admin Console
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400 hidden sm:inline-block bg-neutral-900 px-3 py-1 rounded-full border border-neutral-800">
              {user.phone || user.email}
            </span>
            <form action="/auth/signout" method="post">
              <button className="text-neutral-400 hover:text-white p-2 transition-colors">
                <LogOut className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container max-w-7xl mx-auto p-4 lg:p-8">
        {children}
      </main>
    </div>
  );
}
