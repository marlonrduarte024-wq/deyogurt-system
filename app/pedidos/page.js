"use client"

import { useEffect,useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Pedidos(){

const [clientes,setClientes] = useState([])
const [items,setItems] = useState([])

const [clienteSeleccionado,setClienteSeleccionado] = useState("")
const [fechaEntrega,setFechaEntrega] = useState("")
const [pagado,setPagado] = useState(false)

const [nuevoCliente,setNuevoCliente] = useState({
nombre:"",
telefono:"",
direccion:""
})

const [itemSeleccionado,setItemSeleccionado] = useState("")
const [cantidad,setCantidad] = useState(1)

const [carrito,setCarrito] = useState([])

useEffect(()=>{
cargarClientes()
cargarItems()
},[])

async function cargarClientes(){

const {data} = await supabase
.from("clientes")
.select("*")
.order("nombre")

setClientes(data || [])
}

async function cargarItems(){

const {data} = await supabase
.from("items")
.select("*")

setItems(data || [])
}

async function crearCliente(){

const {error} = await supabase
.from("clientes")
.insert([nuevoCliente])

if(error){
alert(error.message)
return
}

setNuevoCliente({
nombre:"",
telefono:"",
direccion:""
})

cargarClientes()
}

function agregarItem(){

if(!itemSeleccionado) return

const item = items.find(i=>i.id == itemSeleccionado)

const subtotal = item.precio_venta * cantidad

setCarrito([
...carrito,
{
item_id:item.id,
nombre:item.nombre,
precio:item.precio_venta,
cantidad,
subtotal
}
])

setCantidad(1)
}

const total = carrito.reduce((acc,i)=>acc + i.subtotal,0)

async function guardarPedido(){

if(!clienteSeleccionado){
alert("Selecciona cliente")
return
}

const hoy = new Date().toISOString().split("T")[0]

const estadoPago = pagado ? "si" : "debe"

const {data,error} = await supabase
.from("pedidos")
.insert([
{
cliente_id:clienteSeleccionado,
fecha_pedido:hoy,
fecha_entrega:fechaEntrega,
estado:"pendiente",
estado_pago:estadoPago
}
])
.select()

if(error){
console.log(error)
alert(error.message)
return
}

const pedido = data[0]

for(const c of carrito){

await supabase
.from("pedido_items")
.insert([
{
pedido_id:pedido.id,
item_id:c.item_id,
cantidad:c.cantidad,
precio:c.precio
}
])

}

alert("Pedido creado")

setCarrito([])
}

return(

<div className="space-y-6">

<h1 className="text-2xl font-bold">Pedidos</h1>

{/* CLIENTE */}

<div className="bg-white p-4 rounded shadow space-y-3">

<h2 className="font-semibold">Cliente</h2>

<select
className="border p-2 w-full"
value={clienteSeleccionado}
onChange={(e)=>setClienteSeleccionado(e.target.value)}
>
<option value="">Seleccionar cliente</option>

{clientes.map(c=>(
<option key={c.id} value={c.id}>
{c.nombre} - {c.telefono}
</option>
))}

</select>

</div>

{/* CREAR CLIENTE */}

<div className="bg-white p-4 rounded shadow space-y-2">

<h2 className="font-semibold">Nuevo cliente</h2>

<input
className="border p-2 w-full"
placeholder="Nombre"
value={nuevoCliente.nombre}
onChange={(e)=>setNuevoCliente({...nuevoCliente,nombre:e.target.value})}
/>

<input
className="border p-2 w-full"
placeholder="Telefono"
value={nuevoCliente.telefono}
onChange={(e)=>setNuevoCliente({...nuevoCliente,telefono:e.target.value})}
/>

<input
className="border p-2 w-full"
placeholder="Direccion"
value={nuevoCliente.direccion}
onChange={(e)=>setNuevoCliente({...nuevoCliente,direccion:e.target.value})}
/>

<button
className="bg-green-600 text-white px-4 py-2 rounded"
onClick={crearCliente}
>
Crear cliente
</button>

</div>

{/* FECHA */}

<div className="bg-white p-4 rounded shadow space-y-2">

<h2 className="font-semibold">Entrega</h2>

<input
type="date"
className="border p-2"
value={fechaEntrega}
onChange={(e)=>setFechaEntrega(e.target.value)}
/>

<label className="flex items-center gap-2">

<input
type="checkbox"
checked={pagado}
onChange={(e)=>setPagado(e.target.checked)}
/>

Pedido pagado

</label>

</div>

{/* ITEMS */}

<div className="bg-white p-4 rounded shadow space-y-2">

<h2 className="font-semibold">Agregar producto</h2>

<select
className="border p-2 w-full"
value={itemSeleccionado}
onChange={(e)=>setItemSeleccionado(e.target.value)}
>

<option value="">Seleccionar producto</option>

{items.map(i=>(
<option key={i.id} value={i.id}>
{i.nombre} - ${i.precio_venta}
</option>
))}

</select>

<input
type="number"
className="border p-2 w-24"
value={cantidad}
min="1"
onChange={(e)=>setCantidad(Number(e.target.value))}
/>

<button
className="bg-blue-600 text-white px-4 py-2 rounded"
onClick={agregarItem}
>
Agregar
</button>

</div>

{/* CARRITO */}

<div className="bg-white p-4 rounded shadow">

<h2 className="font-semibold mb-2">Productos</h2>

{carrito.map((c,i)=>(

<div key={i} className="flex justify-between">

<span>
{c.nombre} x {c.cantidad}
</span>

<span>
${c.subtotal}
</span>

</div>

))}

<hr className="my-2"/>

<div className="font-bold">

Total: ${total}

</div>

</div>

<button
className="bg-purple-700 text-white px-6 py-3 rounded"
onClick={guardarPedido}
>
Guardar pedido
</button>

</div>

)

}