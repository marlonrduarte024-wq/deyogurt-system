"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"
export default function Clientes(){

const [clientes,setClientes] = useState([])
const [nuevo,setNuevo] = useState({
nombre:"",
telefono:"",
direccion:""
})

const [seleccionado,setSeleccionado] = useState(null)
const [resumen,setResumen] = useState(null)

useEffect(()=>{
cargarClientes()
},[])

async function cargarClientes(){

const {data} = await supabase
.from("clientes")
.select("*")
.order("nombre")

setClientes(data || [])

}

async function crearCliente(){

if(!nuevo.nombre) return

await supabase
.from("clientes")
.insert(nuevo)

setNuevo({
nombre:"",
telefono:"",
direccion:""
})

cargarClientes()

}

async function guardarCliente(){

await supabase
.from("clientes")
.update({
nombre:seleccionado.nombre,
telefono:seleccionado.telefono,
direccion:seleccionado.direccion
})
.eq("id",seleccionado.id)

cargarClientes()

}

async function cargarResumen(cliente){

setSeleccionado(cliente)

const {data:pedidos} = await supabase
.from("pedidos")
.select(`
id,
estado_pago,
valor_debe,
pedido_items(
cantidad,
precio,
items(nombre)
)
`)
.eq("cliente_id",cliente.id)

let totalPedidos = pedidos?.length || 0
let pagado = 0
let debe = 0
let items = {}

pedidos?.forEach(p=>{

const total = p.pedido_items.reduce(
(a,i)=>a+(i.cantidad*i.precio),0
)

const abonado = Number(p.valor_debe || 0)

pagado += abonado
debe += total - abonado

p.pedido_items.forEach(i=>{

const nombre = i.items.nombre

if(!items[nombre]){
items[nombre]=0
}

items[nombre]+=Number(i.cantidad)

})

})

let favorito = "-"

if(Object.keys(items).length){

favorito = Object.entries(items)
.sort((a,b)=>b[1]-a[1])[0][0]

}

setResumen({
totalPedidos,
pagado,
debe,
favorito
})

}

return(

<div className="space-y-6">

<h1 className="text-2xl font-bold">
Clientes
</h1>

{/* CREAR CLIENTE */}

<div className="bg-white p-4 rounded shadow space-y-2">

<h2 className="font-semibold">
Nuevo cliente
</h2>

<input
placeholder="Nombre"
className="border p-2 rounded w-full"
value={nuevo.nombre}
onChange={(e)=>setNuevo({...nuevo,nombre:e.target.value})}
/>

<input
placeholder="Telefono"
className="border p-2 rounded w-full"
value={nuevo.telefono}
onChange={(e)=>setNuevo({...nuevo,telefono:e.target.value})}
/>

<input
placeholder="Direccion"
className="border p-2 rounded w-full"
value={nuevo.direccion}
onChange={(e)=>setNuevo({...nuevo,direccion:e.target.value})}
/>

<button
className="bg-green-600 text-white px-4 py-2 rounded"
onClick={crearCliente}
>
Guardar
</button>

</div>

{/* LISTA */}

<div className="space-y-2">

<h2 className="font-semibold">
Lista de clientes
</h2>

{clientes.map(c=>{

const telefono = (c.telefono || "").replace(/\D/g,"")

return(

<div
key={c.id}
className="bg-white p-3 rounded shadow flex justify-between items-center"
>

<div>

<p className="font-semibold">
{c.nombre}
</p>

<p className="text-sm text-gray-500">
{c.telefono}
</p>

</div>

<div className="flex gap-2">

<button
className="text-blue-600 text-sm"
onClick={()=>cargarResumen(c)}
>
Ver
</button>

{telefono && (

<a
href={`https://wa.me/57${telefono}?text=Hola%20te%20escribimos%20desde%20De-Yogurt`}
target="_blank"
className="bg-green-600 text-white text-sm px-2 py-1 rounded"
>
WhatsApp
</a>

)}

</div>

</div>

)

})}

</div>

{/* RESUMEN CLIENTE */}

{seleccionado && resumen && (

<div className="bg-white p-4 rounded shadow space-y-3">

<h2 className="font-semibold">
Cliente
</h2>

<input
className="border p-2 rounded w-full"
value={seleccionado.nombre}
onChange={(e)=>setSeleccionado({
...seleccionado,
nombre:e.target.value
})}
/>

<input
className="border p-2 rounded w-full"
value={seleccionado.telefono || ""}
onChange={(e)=>setSeleccionado({
...seleccionado,
telefono:e.target.value
})}
/>

<input
className="border p-2 rounded w-full"
value={seleccionado.direccion || ""}
onChange={(e)=>setSeleccionado({
...seleccionado,
direccion:e.target.value
})}
/>

<button
className="bg-blue-600 text-white px-3 py-2 rounded"
onClick={guardarCliente}
>
Guardar cambios
</button>

<hr/>

<div className="grid grid-cols-2 gap-3 text-sm">

<div>
<p className="text-gray-500">Pedidos</p>
<p className="font-semibold">{resumen.totalPedidos}</p>
</div>

<div>
<p className="text-gray-500">Pagado</p>
<p className="font-semibold text-green-600">
${resumen.pagado}
</p>
</div>

<div>
<p className="text-gray-500">Debe</p>
<p className="font-semibold text-red-600">
${resumen.debe}
</p>
</div>

<div>
<p className="text-gray-500">Favorito</p>
<p className="font-semibold">
{resumen.favorito}
</p>
</div>

</div>

</div>

)}

</div>

)

}