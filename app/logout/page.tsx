"use client";

import { useEffect } from "react";
import { createClient } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    };
    logout();
  }, [router]);

  return <p>Logging out...</p>;
}
