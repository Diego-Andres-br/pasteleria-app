"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Plus, Trash2 } from "lucide-react"

type Cliente = { id: string; nombre: string; telefono: string; email: string }

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [email, setEmail] = useState("")

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from("clientes").select("*").order("nombre")
      setClientes(data || [])
    }
    cargar()
  }, [])

  async function agregar() {
    if (!nombre) return
    await supabase.from("clientes").insert({ nombre, telefono, email })
    const { data } = await supabase.from("clientes").select("*").order("nombre")
    setClientes(data || [])
    setNombre(""); setTelefono(""); setEmail("")
  }

  async function eliminar(id: string) {
    await supabase.from("clientes").delete().eq("id", id)
    const { data } = await supabase.from("clientes").select("*").order("nombre")
    setClientes(data || [])
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h1>
      <div className="bg-white rounded-xl shadow p-5 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Agregar cliente</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Nombre completo" value={nombre} onChange={e => setNombre(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
          <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <button onClick={agregar} className="mt-4 bg-pink-600 text-white px-5 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-pink-700">
          <Plus size={16} /> Agregar
        </button>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Nombre</th>
              <th className="px-4 py-3 text-left">Teléfono</th>
              <th className="px-4 py-3 text-left">Email</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.nombre}</td>
                <td className="px-4 py-3">{c.telefono}</td>
                <td className="px-4 py-3">{c.email}</td>
                <td className="px-4 py-3">
                  <button onClick={() => eliminar(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {clientes.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No hay clientes</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}