'use client'

import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabase"

export default function Items(){

const [items,setItems] = useState([])
const [insumos,setInsumos] = useState([])

const [id,setId] = useState(null)
const [nombre,setNombre] = useState('')
const [precioVenta,setPrecioVenta] = useState('')

const [receta,setReceta] = useState([])
const [costoTotal,setCostoTotal] = useState(0)

useEffect(()=>{

cargarItems()
cargarInsumos()

},[])

async function cargarItems(){

const {data} = await supabase
.from("items")
.select("*")
.order("id",{ascending:false})

setItems(data || [])

}

async function cargarInsumos(){

const {data} = await supabase
.from("insumos")
.select("*")
.order("nombre")

setInsumos(data || [])

}

function limpiar(){

setId(null)
setNombre('')
setPrecioVenta('')
setReceta([])
setCostoTotal(0)

}

function agregarInsumo(){

setReceta([
...receta,
{
insumo_id:'',
cantidad:0
}
])

}

function actualizarReceta(index,campo,valor){

const nueva = [...receta]

nueva[index][campo] = campo === "cantidad"
? Number(valor)
: valor

setReceta(nueva)

calcularCosto(nueva)

}

function calcularCosto(recetaActual){

let total = 0

recetaActual.forEach(r=>{

const ins = insumos.find(i=>i.id == r.insumo_id)

if(ins){

total += Number(r.cantidad) * Number(ins.costo)

}

})

setCostoTotal(total)

}

async function guardarItem(){

if(!nombre) return

let itemId = id

if(id){

await supabase
.from("items")
.update({
nombre,
precio_venta: Number(precioVenta)
})
.eq("id",id)

await supabase
.from("recetas")
.delete()
.eq("item_id",id)

}else{

const {data:item} = await supabase
.from("items")
.insert([
{
nombre,
precio_venta: Number(precioVenta)
}
])
.select()
.single()

itemId = item.id

// guardar codigo = id
await supabase
.from("items")
.update({
codigo:itemId
})
.eq("id",itemId)

}

for(const r of receta){

if(!r.insumo_id) continue

await supabase
.from("recetas")
.insert([
{
item_id:itemId,
insumo_id:r.insumo_id,
cantidad:Number(r.cantidad)
}
])

}

limpiar()
cargarItems()

}

async function editarItem(item){

setId(item.id)
setNombre(item.nombre)
setPrecioVenta(item.precio_venta)

const {data} = await supabase
.from("recetas")
.select("*")
.eq("item_id",item.id)

const recetaFormateada = (data || []).map(r=>({
insumo_id:Number(r.insumo_id),
cantidad:Number(r.cantidad)
}))

setReceta(recetaFormateada)

calcularCosto(recetaFormateada)

}

async function eliminarItem(id){

if(!confirm("Eliminar producto?")) return

await supabase
.from("items")
.delete()
.eq("id",id)

await supabase
.from("recetas")
.delete()
.eq("item_id",id)

cargarItems()

}

return(

<div className="max-w-3xl">

<h1 className="text-2xl font-bold mb-6">
Items / Productos
</h1>

{/* FORMULARIO */}

<div className="bg-gray-50 p-4 rounded-lg space-y-4 mb-8">

<input
placeholder="Nombre del producto"
value={nombre}
onChange={(e)=>setNombre(e.target.value)}
className="border p-2 rounded w-full"
/>

<input
type="number"
placeholder="Precio de venta"
min="0"
value={precioVenta}
onChange={(e)=>setPrecioVenta(e.target.value)}
className="border p-2 rounded w-full"
/>

<div>

<h3 className="font-semibold mb-2">
Insumos de la receta
</h3>

{receta.map((r,index)=>(

<div key={index} className="flex gap-2 mb-2">

<select
value={r.insumo_id}
onChange={(e)=>actualizarReceta(index,"insumo_id",e.target.value)}
className="border p-2 rounded w-full"
>

<option value="">
Seleccione insumo
</option>

{insumos.map(i=>(

<option key={i.id} value={i.id}>
{i.nombre}
</option>

))}

</select>

<input
type="number"
min="0"
placeholder="Cantidad"
value={r.cantidad}
onChange={(e)=>actualizarReceta(index,"cantidad",e.target.value)}
className="border p-2 rounded w-32"
/>

</div>

))}

<button
onClick={agregarInsumo}
className="bg-gray-200 px-3 py-1 rounded"
>
+ Agregar insumo
</button>

</div>

<div className="text-lg font-semibold">

Costo producción: ${costoTotal.toFixed(2)}

</div>

{precioVenta && (

<div className="text-md">

Ganancia: ${(precioVenta - costoTotal).toFixed(2)}

</div>

)}

<button
onClick={guardarItem}
className="bg-blue-600 text-white p-2 rounded w-full"
>

{id ? "Actualizar producto" : "Guardar producto"}

</button>

{id &&(

<button
onClick={limpiar}
className="border p-2 rounded w-full"
>

Cancelar edición

</button>

)}

</div>

{/* LISTADO */}

<h2 className="text-lg font-semibold mb-3">
Lista de productos
</h2>

<table className="w-full text-sm">

<thead>

<tr className="border-b text-gray-500">

<th className="text-left py-2">
Nombre
</th>

<th>
Venta
</th>

<th>
Acciones
</th>

</tr>

</thead>

<tbody>

{items.map(i=>(

<tr key={i.id} className="border-b hover:bg-gray-50">

<td className="py-2 font-medium">
{i.nombre}
</td>

<td>
${i.precio_venta}
</td>

<td className="flex gap-3 py-2">

<button
onClick={()=>editarItem(i)}
className="text-blue-600 hover:underline"
>
Editar
</button>

<button
onClick={()=>eliminarItem(i.id)}
className="text-red-600 hover:underline"
>
Eliminar
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

)

}