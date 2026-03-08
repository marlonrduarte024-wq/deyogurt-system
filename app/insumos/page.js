'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Insumos() {

  const [insumos, setInsumos] = useState([])

  const [id, setId] = useState(null)
  const [codigo, setCodigo] = useState('')
  const [nombre, setNombre] = useState('')
  const [costo, setCosto] = useState('')
  const [unidad, setUnidad] = useState('')

  useEffect(() => {
    cargarInsumos()
  }, [])

  async function cargarInsumos() {

    const { data } = await supabase
      .from('insumos')
      .select('*')
      .order('id', { ascending: false })

    setInsumos(data || [])
  }

  function limpiarFormulario() {
    setId(null)
    setCodigo('')
    setNombre('')
    setCosto('')
    setUnidad('')
  }

  async function guardarInsumo() {

    if (!nombre || !unidad) return

    if (id) {

      await supabase
        .from('insumos')
        .update({
          codigo,
          nombre,
          costo,
          unidad
        })
        .eq('id', id)

    } else {

      await supabase
        .from('insumos')
        .insert([
          {
            codigo,
            nombre,
            costo,
            unidad
          }
        ])
    }

    limpiarFormulario()
    cargarInsumos()
  }

  function editarInsumo(i) {

    setId(i.id)
    setCodigo(i.codigo)
    setNombre(i.nombre)
    setCosto(i.costo)
    setUnidad(i.unidad)
  }

  async function eliminarInsumo(id) {

    if (!confirm("¿Eliminar insumo?")) return

    await supabase
      .from('insumos')
      .delete()
      .eq('id', id)

    cargarInsumos()
  }

  return (

    <div>

      <h1 className="text-2xl font-bold mb-6">
        Insumos
      </h1>

      {/* FORMULARIO */}

      <div className="bg-gray-50 p-4 rounded-lg mb-8 space-y-3">

        <input
          placeholder="Código"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <input
          placeholder="Costo"
          type="number"
          value={costo}
          onChange={(e) => setCosto(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <select
          value={unidad}
          onChange={(e) => setUnidad(e.target.value)}
          className="border p-2 rounded w-full"
        >

          <option value="">Seleccione unidad de medida</option>
          <option value="kilo">Kilo</option>
          <option value="litro">Litro</option>
          <option value="gramo">Gramo</option>
          <option value="mililitro">Mililitro</option>
          <option value="unidad">Unidad</option>

        </select>

        <button
          onClick={guardarInsumo}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded w-full"
        >
          {id ? 'Actualizar insumo' : 'Guardar insumo'}
        </button>

        {id && (

          <button
            onClick={limpiarFormulario}
            className="border p-2 rounded w-full"
          >
            Cancelar edición
          </button>

        )}

      </div>

      {/* TABLA */}

      <h2 className="text-lg font-semibold mb-3">
        Lista de insumos
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead>

            <tr className="border-b text-gray-500">

              <th className="text-left py-2">Código</th>
              <th className="text-left">Nombre</th>
              <th className="text-left">Costo</th>
              <th className="text-left">Unidad</th>
              <th className="text-left">Acciones</th>

            </tr>

          </thead>

          <tbody>

            {insumos.map(i => (

              <tr
                key={i.id}
                className="border-b hover:bg-gray-50"
              >

                <td className="py-2">
                  {i.codigo}
                </td>

                <td className="font-medium">
                  {i.nombre}
                </td>

                <td>
                  ${i.costo}
                </td>

                <td>
                  {i.unidad}
                </td>

                <td className="flex gap-3 py-2">

                  <button
                    onClick={() => editarInsumo(i)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => eliminarInsumo(i.id)}
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

    </div>

  )
}