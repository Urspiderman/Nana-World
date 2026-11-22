import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MusicProvider from "@/components/music/MusicProvider";
import FloatingLoveDock from "@/components/music/FloatingLoveDock";
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  return (
    <MusicProvider>
      {children}
      <FloatingLoveDock />
    </MusicProvider>
  );
}
