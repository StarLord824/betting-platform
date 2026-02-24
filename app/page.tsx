import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/db";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is admin
  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (profile?.role === "admin") {
    redirect("/admin");
  }

  // Regular users go to the user dashboard (which is the (user) group page)
  // The (user)/page.tsx will render the dashboard
  // Since this is the root page and (user) group is also at root,
  // Next.js will prefer this page.tsx. We need to handle it properly.
  redirect("/dashboard");
}
