"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function AuthGuard({ children }) {

  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {

    const checkSession = async () => {

      const { data } = await supabase.auth.getSession();

      setSession(data.session);
      setLoading(false);

      if (!data.session && pathname !== "/") {
        router.push("/");
      }

      if (data.session && pathname === "/") {
        router.push("/pedidos");
      }
    };

    checkSession();

  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Cargando...
      </div>
    );
  }

  return children;
}