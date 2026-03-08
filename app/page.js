"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

export default function LoginPage() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      alert("Usuario o contraseña incorrectos");
      setLoading(false);
      return;
    }

    router.push("/pedidos");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">

      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-sm">

        {/* LOGO */}
        <div className="text-center mb-6">
          <img
            src="/logo.png"
            className="mx-auto h-20 mb-3"
            alt="logo"
          />
          <h1 className="text-xl font-bold text-gray-800">
            Sistema de Pedidos
          </h1>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Correo"
            className="w-full border rounded-lg p-3"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="w-full border rounded-lg p-3"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-lg font-semibold"
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>

        </form>

      </div>

    </div>
  );
}