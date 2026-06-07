"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingBag, ClipboardList, Users, TrendingUp } from "lucide-react"

type PedidoPendiente = {
  id: string
  total: number
  created_at: string
  clientes: { nombre: string }
}

export default function Dashboard() {
  const [productos, setProductos] = useState(0)
  const [pedidos, setPedidos] = useState(0)
  const [clientes, setClientes] = useState(0)
  const [ventas, setVentas] = useState(0)
  const [pedidosPendientes, setPedidosPendientes] = useState<PedidoPendiente[]>([])

  useEffect(() => {
    async function cargar() {
      const { data: p } = await supabase.from("productos").select("id")
      const { data: pe } = await supabase.from("pedidos").select("id")
      const { data: c } = await supabase.from("clientes").select("id")
      const { data: v } = await supabase.from("ventas").select("total")
      const { data: pp } = await supabase.from("pedidos").select("*, clientes(nombre)").eq("estado", "pendiente").order("created_at", { ascending: false }).limit(5)
      setProductos(p?.length || 0)
      setPedidos(pe?.length || 0)
      setClientes(c?.length || 0)
      setVentas(v?.reduce((a, b) => a + b.total, 0) || 0)
      setPedidosPendientes((pp as PedidoPendiente[]) || [])
    }
    cargar()
  }, [])

  const cards = [
    { label: "Productos", value: productos, icon: ShoppingBag, color: "bg-pink-500" },
    { label: "Pedidos", value: pedidos, icon: ClipboardList, color: "bg-purple-500" },
    { label: "Clientes", value: clientes, icon: Users, color: "bg-blue-500" },
    { label: "Total Ventas", value: `$${ventas.toLocaleString()}`, icon: TrendingUp, color: "bg-green-500" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
            <div className={`${color} text-white p-3 rounded-lg`}>
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-800">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Pedidos pendientes</h2>
        {pedidosPendientes.length === 0 ? (
          <p className="text-gray-400 text-sm">No hay pedidos pendientes</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Cliente</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {pedidosPendientes.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{p.clientes?.nombre}</td>
                  <td className="px-4 py-3 text-pink-600">${p.total.toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400">{new Date(p.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
