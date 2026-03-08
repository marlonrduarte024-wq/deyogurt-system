"use client";

import { useState } from "react";

export default function Sidebar() {

  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Botón móvil */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-40 bg-white shadow p-2 rounded-md md:hidden"
      >
        ☰
      </button>

      {/* Fondo oscuro móvil */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed md:static z-40
        bg-white w-64 h-full border-r shadow
        transform ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        transition-transform
      `}
      >

        {/* Logo */}
        <div className="p-4 border-b flex items-center gap-3">

          <img
            src="/logo.png"
            className="h-10"
          />

          <span className="font-bold text-lg">
            DE-YOGURT
          </span>

        </div>

        {/* Menu */}
        <nav className="flex flex-col p-3 text-sm font-medium">

          <a
            href="/panel"
            className="px-3 py-2 rounded hover:bg-green-100 hover:text-green-700"
          >
            📊 Panel
          </a>

          <a
            href="/pedidos"
            className="px-3 py-2 rounded hover:bg-green-100 hover:text-green-700"
          >
            🧾 Pedidos
          </a>

          <a
            href="/items"
            className="px-3 py-2 rounded hover:bg-green-100 hover:text-green-700"
          >
            🍦 Items
          </a>

          <a
            href="/insumos"
            className="px-3 py-2 rounded hover:bg-green-100 hover:text-green-700"
          >
            🧂 Insumos
          </a>

          <a
            href="/clientes"
            className="px-3 py-2 rounded hover:bg-green-100 hover:text-green-700"
          >
            👤 Clientes
          </a>

        </nav>

      </aside>
    </>
  );
}