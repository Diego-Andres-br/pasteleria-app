"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingCart, X, Plus, Minus, Send } from "lucide-react"

type Producto = { id: string; nombre: string; descripcion: string; precio: number; categoria: string; imagen_url: string }
type CartItem = { producto: Producto; cantidad: number }

export default function Tienda() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [carrito, setCarrito] = useState<CartItem[]>([])
  const [carritoOpen, setCarritoOpen] = useState(false)
  const [categoriaActiva, setCategoriaActiva] = useState("Todos")
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [notas, setNotas] = useState("")
  const [metodoPago, setMetodoPago] = useState("efectivo")
  const [pedidoEnviado, setPedidoEnviado] = useState(false)

  useEffect(() => {
    async function cargar() {
      const { data } = await supabase.from("productos").select("*").order("categoria")
      setProductos(data || [])
    }
    cargar()
  }, [])

  const categorias = ["Todos", ...Array.from(new Set(productos.map(p => p.categoria).filter(Boolean)))]

  const productosFiltrados = categoriaActiva === "Todos"
    ? productos
    : productos.filter(p => p.categoria === categoriaActiva)

  function agregarAlCarrito(producto: Producto) {
    setCarrito(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, delta: number) {
    setCarrito(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i).filter(i => i.cantidad > 0))
  }

  function eliminarDelCarrito(id: string) {
    setCarrito(prev => prev.filter(i => i.producto.id !== id))
  }

  const total = carrito.reduce((a, i) => a + i.producto.precio * i.cantidad, 0)

  async function enviarPedido() {
    if (!nombre || !telefono || carrito.length === 0) return

    // Guardar o crear cliente
    let clienteId = ""
    const { data: clienteExiste } = await supabase.from("clientes").select("id").eq("telefono", telefono).single()
    if (clienteExiste) {
      clienteId = clienteExiste.id
    } else {
      const { data: nuevoCliente } = await supabase.from("clientes").insert({ nombre, telefono }).select().single()
      clienteId = nuevoCliente?.id || ""
    }

    // Crear pedido
    const { data: pedido } = await supabase.from("pedidos").insert({
      cliente_id: clienteId,
      total,
      notas: `${notas}\nMétodo de pago: ${metodoPago}`,
      estado: "pendiente"
    }).select().single()

    // Crear items del pedido
    if (pedido) {
      await supabase.from("pedido_items").insert(
        carrito.map(i => ({
          pedido_id: pedido.id,
          producto_id: i.producto.id,
          cantidad: i.cantidad,
          precio_unitario: i.producto.precio
        }))
      )
    }

    // Mensaje WhatsApp
    const msg = encodeURIComponent(
      `🎂 *Nuevo pedido de ${nombre}*\n\n` +
      carrito.map(i => `• ${i.producto.nombre} x${i.cantidad} — $${(i.producto.precio * i.cantidad).toLocaleString()}`).join("\n") +
      `\n\n*Total: $${total.toLocaleString()}*\n` +
      `Pago: ${metodoPago}\n` +
      (notas ? `Notas: ${notas}` : "")
    )
    window.open(`https://wa.me/573007433603?text=${msg}`, "_blank")

    setCarrito([])
    setNombre("")
    setTelefono("")
    setNotas("")
    setPedidoEnviado(true)
    setTimeout(() => setPedidoEnviado(false), 4000)
    setCarritoOpen(false)
  }

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-pink-600">🎂 Pastelería</h1>
            <p className="text-xs text-gray-400">Hecho con amor</p>
          </div>
          <button onClick={() => setCarritoOpen(true)} className="relative bg-pink-600 text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-pink-700">
            <ShoppingCart size={18} />
            <span className="text-sm font-medium">Carrito</span>
            {carrito.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {carrito.reduce((a, i) => a + i.cantidad, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-400 text-white py-14 px-4 text-center">
        <h2 className="text-4xl font-bold mb-2">Pasteles para cada momento</h2>
        <p className="text-pink-100 text-lg">Tortas, cupcakes y más — hechos con amor para ti</p>
      </div>

      {/* Categorías */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex gap-2 flex-wrap mb-6">
          {categorias.map(cat => (
            <button key={cat} onClick={() => setCategoriaActiva(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${categoriaActiva === cat ? "bg-pink-600 text-white" : "bg-white text-gray-600 hover:bg-pink-50"}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Productos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
          {productosFiltrados.map(p => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-pink-100 h-48 flex items-center justify-center text-6xl">
                🎂
              </div>
              <div className="p-4">
                <span className="text-xs text-pink-500 font-medium uppercase tracking-wide">{p.categoria}</span>
                <h3 className="text-lg font-bold text-gray-800 mt-1">{p.nombre}</h3>
                <p className="text-gray-500 text-sm mt-1">{p.descripcion}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xl font-bold text-pink-600">${p.precio.toLocaleString()}</span>
                  <button onClick={() => agregarAlCarrito(p)} className="bg-pink-600 text-white px-4 py-2 rounded-full text-sm hover:bg-pink-700">
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          ))}
          {productosFiltrados.length === 0 && (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <p className="text-5xl mb-4">🎂</p>
              <p>No hay productos aún</p>
            </div>
          )}
        </div>
      </div>

      {/* Carrito */}
      {carritoOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => setCarritoOpen(false)} />
          <div className="w-full max-w-md bg-white h-full overflow-y-auto flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold text-gray-800">Tu pedido</h2>
              <button onClick={() => setCarritoOpen(false)}><X size={22} /></button>
            </div>

            {carrito.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <ShoppingCart size={48} className="mb-3" />
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div className="flex-1 p-4 flex flex-col gap-3">
                  {carrito.map(item => (
                    <div key={item.producto.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="text-3xl">🎂</div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.producto.nombre}</p>
                        <p className="text-pink-600 text-sm">${(item.producto.precio * item.cantidad).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => cambiarCantidad(item.producto.id, -1)} className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center"><Minus size={12} /></button>
                        <span className="text-sm font-medium w-4 text-center">{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.producto.id, 1)} className="bg-pink-100 text-pink-600 rounded-full w-6 h-6 flex items-center justify-center"><Plus size={12} /></button>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.producto.id)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
                    </div>
                  ))}

                  <div className="border-t pt-3 mt-2">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span className="text-pink-600">${total.toLocaleString()}</span>
                    </div>

                    <div className="flex flex-col gap-3">
                      <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
                      <input className="border rounded-lg px-3 py-2 text-sm" placeholder="Tu teléfono" value={telefono} onChange={e => setTelefono(e.target.value)} />
                      <select className="border rounded-lg px-3 py-2 text-sm" value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="tarjeta">Tarjeta</option>
                      </select>
                      <textarea className="border rounded-lg px-3 py-2 text-sm" placeholder="Notas del pedido (sabor, decoración...)" rows={3} value={notas} onChange={e => setNotas(e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t">
                  <button onClick={enviarPedido} className="w-full bg-pink-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-pink-700">
                    <Send size={18} /> Enviar pedido por WhatsApp
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Confirmación */}
      {pedidoEnviado && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg z-50">
          ✅ ¡Pedido enviado exitosamente!
        </div>
      )}
    </div>
  )
}