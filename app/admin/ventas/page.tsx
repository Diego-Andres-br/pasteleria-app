"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trash2 } from "lucide-react"

type Venta = { id: string; total: number; metodo_pago: string; fecha: string }

export default function Ventas() {
  const [ventas, setVentas] = useState<Venta[]>([])

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from("ventas").select("*").order("fecha", { ascending: false })
      setVentas(data || [])
    }
    cargar()
  }, [])

  async function eliminar(id: string) {
    await supabase.from("ventas").delete().eq("id", id)
    const { data } = await supabase.from("ventas").select("*").order("fecha", { ascending: false })
    setVentas(data || [])
  }

  const total = ventas.reduce((a, v) => a + v.total, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ventas</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="px-4 py-3 bg-green-50 border-b flex justify-between items-center">
          <span className="text-sm text-gray-600 font-medium">Total ingresos</span>
          <span className="text-green-600 font-bold text-lg">${total.toLocaleString()}</span>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">ID Venta</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Método de pago</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {ventas.map(v => (
              <tr key={v.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-400 text-xs">#{v.id.slice(0,8)}</td>
                <td className="px-4 py-3 text-green-600 font-medium">${v.total.toLocaleString()}</td>
                <td className="px-4 py-3 capitalize">{v.metodo_pago}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(v.fecha).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => eliminar(v.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {ventas.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No hay ventas registradas</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}