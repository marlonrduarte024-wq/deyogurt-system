'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Vendido() {

  const [pedidos, setPedidos] = useState([])
  const [pedidoAbierto, setPedidoAbierto] = useState(null)
  const [fechaSeleccionada, setFechaSeleccionada] = useState("") // Fecha para filtrar
  const [totalVendido, setTotalVendido] = useState(0)

  useEffect(() => {
    cargarPedidosCompletados()
  }, [fechaSeleccionada])

  async function cargarPedidosCompletados() {

    let query = supabase
      .from("pedidos")
      .select(`
        id,
        fecha_entrega,
        clientes(nombre),
        pedido_items(
          cantidad,
          precio,
          items(nombre)
        )
      `)
      .eq("estado", "entregado")
      .eq("estado_pago", "si")
      .order("fecha_entrega", { ascending: false })

    if (fechaSeleccionada) {
      query = query.eq("fecha_entrega", fechaSeleccionada)
    }

    const { data, error } = await query

    if (error) {
      console.log(error)
      return
    }

    const pedidosData = data || []
    setPedidos(pedidosData)

    // Calcular total vendido
    const total = pedidosData.reduce((acc, p) => {
      return acc + p.pedido_items.reduce((a, i) => a + i.cantidad * i.precio, 0)
    }, 0)

    setTotalVendido(total)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">

      <h1 className="text-2xl font-bold">Pedidos Completados / Vendido</h1>

      {/* Selector de fecha */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold">Ver total vendido por fecha:</label>
        <input
          type="date"
          className="border p-2 rounded"
          value={fechaSeleccionada}
          onChange={(e) => setFechaSeleccionada(e.target.value)}
        />
        <span className="font-semibold">Total vendido: ${totalVendido}</span>
      </div>

      {pedidos.length === 0 && (
        <p className="text-gray-500 text-sm">No hay pedidos completados para esta fecha</p>
      )}

      {pedidos.map(p => {
        const total = p.pedido_items.reduce((a, i) => a + i.cantidad * i.precio, 0)

        return (
          <div key={p.id} className="bg-white p-4 rounded shadow space-y-2">

            <div className="flex justify-between">
              <span className="font-semibold">Pedido #{p.id}</span>
              <span className="text-sm">{p.fecha_entrega}</span>
            </div>

            <div className="text-sm">Cliente: {p.clientes?.nombre}</div>

            <button
              className="text-blue-600 text-sm underline"
              onClick={() => setPedidoAbierto(pedidoAbierto === p.id ? null : p.id)}
            >
              {pedidoAbierto === p.id ? "Ocultar pedido" : "Ver pedido"}
            </button>

            {pedidoAbierto === p.id && (
              <div className="bg-gray-50 p-2 rounded text-sm space-y-1">
                {p.pedido_items.map((i, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{i.cantidad} x {i.items.nombre}</span>
                    <span>${i.cantidad * i.precio}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-between text-sm font-semibold">
              <span>Total</span>
              <span>${total}</span>
            </div>

          </div>
        )
      })}

    </div>
  )
}
