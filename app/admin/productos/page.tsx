"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash2 } from "lucide-react"

type Producto = { id: string; nombre: string; descripcion: string; precio: number; costo: number; categoria: string }

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [precio, setPrecio] = useState("")
  const [costo, setCosto] = useState("")
  const [categoria, setCategoria] = useState("")
  const [mensaje, setMensaje] = useState("")

  async function cargar() {
    const { data, error } = await supabase.from("productos").select("*").order("nombre")
    console.log("cargar:", data, error)
    setProductos(data || [])
  }

useEffect(() => {
  async function init() { await cargar() }
  init()
}, [])

  async function agregar() {
    if (!nombre || !precio) {
      setMensaje("⚠️ Nombre y precio son obligatorios")
      return
    }
    const { data, error } = await supabase.from("productos").insert({
      nombre,
      descripcion,
      precio: Number(precio),
      costo: Number(costo) || 0,
      categoria
    }).select()
    
    console.log("insert data:", data)
    console.log("insert error:", error)

    if (error) {
      setMensaje("❌ Error: " + error.message)
      return
    }

    setMensaje("✅ Producto agregado")
    setNombre(""); setDescripcion(""); setPrecio(""); setCosto(""); setCategoria("")
    await cargar()
    setTimeout(() => setMensaje(""), 3000)
  }

  async function eliminar(id: string) {
    await supabase.from("productos").delete().eq("id", id)
    await cargar()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Productos</h1>

      {mensaje && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-pink-50 text-pink-700 text-sm font-medium">
          {mensaje}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Agregar producto</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Nombre *" value={nombre} onChange={e => setNombre(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Categoría (tortas, cupcakes...)" value={categoria} onChange={e => setCategoria(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Descripción" value={descripcion} onChange={e => setDescripcion(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Precio de venta *" type="number" value={precio} onChange={e => setPrecio(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Costo de producción" type="number" value={costo} onChange={e => setCosto(e.target.value)} />
        </div>
        <button onClick={agregar} className="mt-4 bg-pink-600 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-pink-700">
          <Plus size={16} /> Agregar
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Producto</th>
              <th className="px-4 py-3 text-left">Categoría</th>
              <th className="px-4 py-3 text-left">Precio</th>
              <th className="px-4 py-3 text-left">Costo</th>
              <th className="px-4 py-3 text-left">Utilidad</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {productos.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
                <td className="px-4 py-3 text-gray-500">{p.categoria}</td>
                <td className="px-4 py-3">${p.precio.toLocaleString()}</td>
                <td className="px-4 py-3">${p.costo.toLocaleString()}</td>
                <td className="px-4 py-3 text-green-600 font-medium">${(p.precio - p.costo).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => eliminar(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {productos.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay productos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}