"use client"
import Link from "next/link"
import { useState } from "react"
import { LayoutDashboard, ShoppingBag, ClipboardList, Users, Package, TrendingUp, Menu } from "lucide-react"

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/productos", label: "Productos", icon: ShoppingBag },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
  { href: "/admin/inventario", label: "Inventario", icon: Package },
  { href: "/admin/ventas", label: "Ventas", icon: TrendingUp },
]

export default function Sidebar() {
  const [open, setOpen] = useState(true)

  return (
    <aside className={`${open ? "w-56" : "w-16"} bg-pink-600 text-white flex flex-col transition-all duration-300 min-h-screen`}>
      <button onClick={() => setOpen(!open)} className="p-4 hover:bg-pink-700 flex justify-center">
        <Menu size={22} />
      </button>
      <div className={`px-4 py-2 ${!open && "hidden"}`}>
        <p className="text-sm font-bold">🎂 Admin Panel</p>
      </div>
      <nav className="flex flex-col mt-2 gap-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-pink-700 transition-colors">
            <Icon size={20} />
            {open && <span className="text-sm font-medium">{label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}