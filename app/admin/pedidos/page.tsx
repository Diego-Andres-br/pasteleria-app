"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Trash2 } from "lucide-react"

type Pedido = { id: string; total: number; estado: string; notas: string; fecha_entrega: string; created_at: string; clientes: { nombre: string; telefono: string } }

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from("pedidos").select("*, clientes(nombre, telefono)").order("created_at", { ascending: false })
      setPedidos(data || [])
    }
    cargar()
  }, [])

  async function cambiarEstado(id: string, estado: string) {
    await supabase.from("pedidos").update({ estado }).eq("id", id)
    const { data } = await supabase.from("pedidos").select("*, clientes(nombre, telefono)").order("created_at", { ascending: false })
    setPedidos(data || [])
  }

  async function eliminar(id: string) {
    await supabase.from("pedidos").delete().eq("id", id)
    const { data } = await supabase.from("pedidos").select("*, clientes(nombre, telefono)").order("created_at", { ascending: false })
    setPedidos(data || [])
  }

  const colorEstado: Record<string, string> = {
    pendiente: "bg-yellow-100 text-yellow-700",
    en_proceso: "bg-blue-100 text-blue-700",
    listo: "bg-green-100 text-green-700",
    entregado: "bg-gray-100 text-gray-700",
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pedidos</h1>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Cliente</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Notas</th>
              <th className="px-4 py-3 text-left">Fecha</th>
              <th className="px-4 py-3 text-left">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.clientes?.nombre}</td>
                <td className="px-4 py-3 text-gray-500">{p.clientes?.telefono}</td>
                <td className="px-4 py-3 text-pink-600 font-medium">${p.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{p.notas}</td>
                <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <select className={`text-xs px-2 py-1 rounded-full font-medium ${colorEstado[p.estado]}`} value={p.estado} onChange={e => cambiarEstado(p.id, e.target.value)}>
                    <option value="pendiente">Pendiente</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="listo">Listo</option>
                    <option value="entregado">Entregado</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => eliminar(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {pedidos.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No hay pedidos</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}