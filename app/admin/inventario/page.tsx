"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash2, AlertTriangle } from "lucide-react"

type Ingrediente = { id: string; nombre: string; cantidad: number; unidad: string; stock_minimo: number }

export default function Inventario() {
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([])
  const [nombre, setNombre] = useState("")
  const [cantidad, setCantidad] = useState("")
  const [unidad, setUnidad] = useState("")
  const [stockMinimo, setStockMinimo] = useState("")

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from("ingredientes").select("*").order("nombre")
      setIngredientes(data || [])
    }
    cargar()
  }, [])

  async function agregar() {
    if (!nombre || !cantidad || !unidad) return
    await supabase.from("ingredientes").insert({ nombre, cantidad: Number(cantidad), unidad, stock_minimo: Number(stockMinimo) || 0 })
    const { data } = await supabase.from("ingredientes").select("*").order("nombre")
    setIngredientes(data || [])
    setNombre(""); setCantidad(""); setUnidad(""); setStockMinimo("")
  }

  async function eliminar(id: string) {
    await supabase.from("ingredientes").delete().eq("id", id)
    const { data } = await supabase.from("ingredientes").select("*").order("nombre")
    setIngredientes(data || [])
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Inventario</h1>
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Agregar ingrediente</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Cantidad" type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Unidad (kg, lt...)" value={unidad} onChange={e => setUnidad(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Stock mínimo" type="number" value={stockMinimo} onChange={e => setStockMinimo(e.target.value)} />
        </div>
        <button onClick={agregar} className="mt-4 bg-pink-600 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-pink-700">
          <Plus size={16} /> Agregar
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Ingrediente</th>
              <th className="px-4 py-3 text-left">Cantidad</th>
              <th className="px-4 py-3 text-left">Unidad</th>
              <th className="px-4 py-3 text-left">Stock mínimo</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ingredientes.map(i => (
              <tr key={i.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{i.nombre}</td>
                <td className="px-4 py-3">{i.cantidad}</td>
                <td className="px-4 py-3">{i.unidad}</td>
                <td className="px-4 py-3">{i.stock_minimo}</td>
                <td className="px-4 py-3">
                  {i.cantidad <= i.stock_minimo ? (
                    <span className="flex items-center gap-1 text-red-500 text-xs font-medium"><AlertTriangle size={14} /> Stock bajo</span>
                  ) : (
                    <span className="text-green-500 text-xs font-medium">✓ OK</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => eliminar(i.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {ingredientes.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hay ingredientes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}