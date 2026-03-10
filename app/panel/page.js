'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Panel(){

  const [fecha,setFecha] = useState("")
  const [pedidos,setPedidos] = useState([])
  const [abonos,setAbonos] = useState({})
  const [pedidoAbierto,setPedidoAbierto] = useState(null)

  const [procesandoPago,setProcesandoPago] = useState(null)

  const [resumen,setResumen] = useState({
    totalPedidos:0,
    totalVendido:0,
    pagado:0,
    debe:0
  })

  const [produccion,setProduccion] = useState({})
  const [insumos,setInsumos] = useState({})

  useEffect(()=>{
    cargarPedidos()
  },[fecha])

  async function cargarPedidos(){

    let query = supabase
      .from("pedidos")
      .select(`
        id,
        fecha_entrega,
        fecha_entregado,
        estado_pago,
        valor_debe,
        estado,
        clientes(nombre),
        pedido_items(
          cantidad,
          precio,
          item_id,
          items(
            id,
            nombre
          )
        )
      `)
      .order("fecha_entrega")

    if(fecha){
      query = query.eq("fecha_entrega",fecha)
    }

    const {data,error} = await query
    if(error){
      console.log(error)
      return
    }

    const pedidosData = data || []
    setPedidos(pedidosData)

    const pedidosActivos = pedidosData.filter(p => !(p.estado === "entregado" && p.estado_pago === "si"))

    calcularResumen(pedidosActivos)
    calcularProduccion(pedidosActivos)
    calcularInsumos(pedidosActivos)
  }

  function calcularResumen(data){

    let totalPedidos = data.length
    let totalVendido = 0
    let pagado = 0
    let debe = 0

    data.forEach(p=>{

      const total = p.pedido_items.reduce((a,i)=>a+(i.cantidad*i.precio),0)
      const abonado = Number(p.valor_debe || 0)

      totalVendido += total

      if(p.estado_pago === "si"){
        pagado += total
      }else{
        pagado += abonado
        const deuda = total - abonado
        if(deuda>0) debe += deuda
      }

    })

    setResumen({ totalPedidos, totalVendido, pagado, debe })
  }

  function calcularProduccion(data){

    let prod = {}

    data.forEach(p=>{
      p.pedido_items.forEach(i=>{
        const nombre = i.items.nombre
        if(!prod[nombre]) prod[nombre] = 0
        prod[nombre] += Number(i.cantidad)
      })
    })

    setProduccion(prod)
  }

  async function calcularInsumos(data){

    let prodItems = []

    data.forEach(p=>{
      p.pedido_items.forEach(i=>{
        prodItems.push({ item_id:i.item_id, cantidad:i.cantidad })
      })
    })

    if(prodItems.length===0){
      setInsumos({})
      return
    }

    const {data:recetas} = await supabase
      .from("recetas")
      .select(`
        item_id,
        cantidad,
        insumo_id,
        insumos(nombre, unidad, costo)
      `)

    let ins = {}

    prodItems.forEach(p=>{
      (recetas || [])
      .filter(r=>r.item_id==p.item_id)
      .forEach(r=>{

        const nombre = r.insumos.nombre
        const unidad = r.insumos.unidad
        const totalCantidad = r.cantidad * p.cantidad
        const costoUnitario = Number(r.insumos.costo || 0)
        const totalCosto = totalCantidad * costoUnitario

        if(!ins[nombre]){
          ins[nombre] = { cantidad:0, unidad, costoTotal:0 }
        }

        ins[nombre].cantidad += Number(totalCantidad)
        ins[nombre].costoTotal += totalCosto

      })
    })

    setInsumos(ins)
  }

  async function marcarPagado(id){

    const confirmar = confirm(`¿El cliente pagó la totalidad del pedido #${id}?`)
    if(!confirmar) return

    setProcesandoPago(id)

    await supabase
      .from("pedidos")
      .update({
        estado_pago:"si",
        valor_debe:0
      })
      .eq("id",id)

    setProcesandoPago(null)

    cargarPedidos()
  }

  async function registrarAbono(id){

    const valor = Number(abonos[id] || 0)
    if(!valor) return

    const pedido = pedidos.find(p=>p.id==id)

    const total = pedido.pedido_items.reduce((a,i)=>a+(i.cantidad*i.precio),0)

    const abonadoActual = Number(pedido.valor_debe || 0)

    const nuevoAbono = abonadoActual + valor
    const deuda = total - nuevoAbono

    await supabase
      .from("pedidos")
      .update({
        valor_debe: nuevoAbono,
        estado_pago: deuda<=0?"si":"no"
      })
      .eq("id",id)

    setAbonos({...abonos,[id]:""})
    cargarPedidos()
  }

  async function entregarPedido(id){

    const confirmar = confirm(`¿Has entregado el pedido #${id}?`)
    if(!confirmar) return

    const hoy = new Date().toISOString().split("T")[0]

    await supabase
      .from("pedidos")
      .update({
        estado:"entregado",
        fecha_entregado:hoy
      })
      .eq("id",id)

    cargarPedidos()
  }

  const hoy = new Date().toISOString().split("T")[0]

  return(
    <div className="space-y-6 pb-20">

      <h1 className="text-2xl font-bold">Panel Producción</h1>

      <input
        type="date"
        className="border p-2 rounded w-full"
        value={fecha}
        onChange={(e)=>setFecha(e.target.value)}
      />

      {/* RESUMEN */}
      <div className="grid grid-cols-2 gap-3">

        <div className="bg-white p-3 rounded shadow">
          <p className="text-gray-500 text-sm">Pedidos</p>
          <h2 className="text-xl font-bold">{resumen.totalPedidos}</h2>
        </div>

        <div className="bg-white p-3 rounded shadow">
          <p className="text-gray-500 text-sm">Ventas</p>
          <h2 className="text-xl font-bold">${resumen.totalVendido}</h2>
        </div>

        <div className="bg-white p-3 rounded shadow">
          <p className="text-gray-500 text-sm">Pagado</p>
          <h2 className="text-xl font-bold text-green-600">${resumen.pagado}</h2>
        </div>

        <div className="bg-white p-3 rounded shadow">
          <p className="text-gray-500 text-sm">Por cobrar</p>
          <h2 className="text-xl font-bold text-red-600">${resumen.debe}</h2>
        </div>

      </div>

      {/* PEDIDOS */}
      <div className="space-y-3">

        <h2 className="font-semibold text-lg">Pedidos</h2>

        {pedidos
        .filter(p=>!(p.estado==="entregado" && p.estado_pago==="si"))
        .map(p=>{

          const total = p.pedido_items.reduce((a,i)=>a+(i.cantidad*i.precio),0)
          const abonado = Number(p.valor_debe || 0)
          const deuda = p.estado_pago === "si" ? 0 : total - abonado

          return(

            <div key={p.id} className="bg-white p-4 rounded shadow space-y-2">

              <div className="flex justify-between">
                <span className="font-semibold">Pedido #{p.id}</span>
                <span className="text-sm">{p.fecha_entrega}</span>
              </div>

              <div className="text-sm">
                Cliente: {p.clientes?.nombre}
              </div>

              {p.fecha_entregado && (
                <div className="text-xs text-green-700 font-semibold">
                  Entregado el: {p.fecha_entregado}
                </div>
              )}

              <button
                className="text-blue-600 text-sm underline"
                onClick={() => setPedidoAbierto(pedidoAbierto===p.id?null:p.id)}
              >
                {pedidoAbierto===p.id?"Ocultar pedido":"Ver pedido"}
              </button>

              {pedidoAbierto===p.id && (

                <div className="bg-gray-50 p-2 rounded text-sm space-y-1">

                  {p.pedido_items.map((i,index)=>(
                    <div key={index} className="flex justify-between">
                      <span>{i.cantidad} x {i.items.nombre}</span>
                      <span>${i.cantidad*i.precio}</span>
                    </div>
                  ))}

                </div>

              )}

              <div className="flex justify-between text-sm">
                <span>Total</span>
                <span>${total}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Deuda</span>
                <span className="text-red-600 font-semibold">${deuda}</span>
              </div>

              <div className="flex justify-between items-center">

                <span className={
                  p.estado_pago==="si"
                  ?"text-green-600 font-semibold"
                  :"text-red-600 font-semibold"
                }>
                  {p.estado_pago==="si"?"Pagado":"Debe"}
                </span>

                {p.estado !== "entregado" && (
                  <button
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm"
                    onClick={()=>entregarPedido(p.id)}
                  >
                    Entregar pedido
                  </button>
                )}

              </div>

              {p.estado_pago!=="si" && (

                <div className="flex gap-2">

                  <input
                    type="number"
                    placeholder="Abono"
                    className="border p-1 rounded w-full"
                    value={abonos[p.id]||""}
                    onChange={(e)=>setAbonos({...abonos,[p.id]:e.target.value})}
                  />

                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={()=>registrarAbono(p.id)}
                  >
                    Abonar
                  </button>

                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                    onClick={()=>marcarPagado(p.id)}
                    disabled={procesandoPago===p.id}
                  >
                    {procesandoPago===p.id ? "Guardando..." : "Pagado"}
                  </button>

                </div>

              )}

            </div>

          )

        })}

      </div>

    </div>
  )
}
