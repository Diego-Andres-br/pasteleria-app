"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingCart, X, Plus, Minus, Send } from "lucide-react"

type Producto = { id: string; nombre: string; descripcion: string; precio: number; categoria: string }
type CartItem = { producto: Producto; cantidad: number }

const C = {
  marron: "#7c3f2f",
  marronClaro: "#c8956c",
  crema: "#fdf6f0",
  cremaOscura: "#f5d5b8",
  texto: "#4a2515",
}

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
  const productosFiltrados = categoriaActiva === "Todos" ? productos : productos.filter(p => p.categoria === categoriaActiva)

  function agregarAlCarrito(producto: Producto) {
    setCarrito(prev => {
      const existe = prev.find(i => i.producto.id === producto.id)
      if (existe) return prev.map(i => i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto, cantidad: 1 }]
    })
  }

  function cambiarCantidad(id: string, delta: number) {
    setCarrito(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i))
  }

  function eliminarDelCarrito(id: string) {
    setCarrito(prev => prev.filter(i => i.producto.id !== id))
  }

  const total = carrito.reduce((a, i) => a + i.producto.precio * i.cantidad, 0)

  async function enviarPedido() {
    if (!nombre || !telefono || carrito.length === 0) return
    let clienteId = ""
    const { data: clienteExiste } = await supabase.from("clientes").select("id").eq("telefono", telefono).single()
    if (clienteExiste) {
      clienteId = clienteExiste.id
    } else {
      const { data: nuevoCliente } = await supabase.from("clientes").insert({ nombre, telefono }).select().single()
      clienteId = nuevoCliente?.id || ""
    }
    const { data: pedido } = await supabase.from("pedidos").insert({
      cliente_id: clienteId, total,
      notas: `${notas}\nMétodo de pago: ${metodoPago}`, estado: "pendiente"
    }).select().single()
    if (pedido) {
      await supabase.from("pedido_items").insert(
        carrito.map(i => ({ pedido_id: pedido.id, producto_id: i.producto.id, cantidad: i.cantidad, precio_unitario: i.producto.precio }))
      )
    }
    const msg = encodeURIComponent(
      `🎂 *Nuevo pedido de ${nombre}*\n\n` +
      carrito.map(i => `• ${i.producto.nombre} x${i.cantidad} — $${(i.producto.precio * i.cantidad).toLocaleString()}`).join("\n") +
      `\n\n*Total: $${total.toLocaleString()}*\nPago: ${metodoPago}\n${notas ? `Notas: ${notas}` : ""}`
    )
    window.open(`https://wa.me/573045732744?text=${msg}`, "_blank")
    setCarrito([]); setNombre(""); setTelefono(""); setNotas("")
    setPedidoEnviado(true)
    setTimeout(() => setPedidoEnviado(false), 4000)
    setCarritoOpen(false)
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: C.crema, fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <header style={{ backgroundColor: C.marron, position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ color: "#fef3c7", fontSize: 24, fontWeight: "bold", margin: 0 }}>🎂 La Pastelería</h1>
            <p style={{ color: "#fcd34d", fontSize: 12, margin: 0 }}>Hecho con amor desde Cartagena</p>
          </div>
          <button onClick={() => setCarritoOpen(true)} style={{ backgroundColor: C.marronClaro, color: "white", border: "none", padding: "10px 20px", borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, position: "relative" }}>
            <ShoppingCart size={18} />
            Carrito
            {carrito.length > 0 && (
              <span style={{ position: "absolute", top: -8, right: -8, backgroundColor: "#ef4444", color: "white", borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>
                {carrito.reduce((a, i) => a + i.cantidad, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.marron}, ${C.marronClaro})`, padding: "80px 24px", textAlign: "center" }}>
        <p style={{ color: "#fcd34d", fontSize: 13, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Bienvenido a nuestra tienda</p>
        <h2 style={{ color: "white", fontSize: 42, fontWeight: "bold", marginBottom: 16, lineHeight: 1.2 }}>Pasteles para cada momento especial</h2>
        <p style={{ color: "#fef3c7", fontSize: 18, maxWidth: 500, margin: "0 auto 32px" }}>Tortas, cupcakes y delicias artesanales hechas con los mejores ingredientes y mucho amor 🍰</p>
        <button onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
          style={{ backgroundColor: "transparent", color: "white", border: "2px solid white", padding: "12px 32px", borderRadius: 999, cursor: "pointer", fontSize: 15, fontFamily: "Georgia, serif" }}>
          Ver productos ↓
        </button>
      </div>

      {/* Productos */}
      <div id="productos" style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px" }}>
        {/* Categorías */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          {categorias.map(cat => (
            <button key={cat} onClick={() => setCategoriaActiva(cat)}
              style={{ padding: "8px 20px", borderRadius: 999, border: `2px solid ${C.marronClaro}`, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif",
                backgroundColor: categoriaActiva === cat ? C.marron : "white",
                color: categoriaActiva === cat ? "white" : C.marron }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 32, paddingBottom: 80 }}>
          {productosFiltrados.map(p => (
            <div key={p.id} style={{ backgroundColor: "white", borderRadius: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", overflow: "hidden", border: `1px solid ${C.cremaOscura}` }}>
              <div style={{ height: 200, background: `linear-gradient(135deg, #fdf0e8, ${C.cremaOscura})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>
                🎂
              </div>
              <div style={{ padding: 20 }}>
                <p style={{ color: C.marronClaro, fontSize: 11, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6 }}>{p.categoria}</p>
                <h3 style={{ color: C.texto, fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>{p.nombre}</h3>
                <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>{p.descripcion}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: C.marron, fontSize: 24, fontWeight: "bold" }}>${p.precio.toLocaleString()}</span>
                  <button onClick={() => agregarAlCarrito(p)}
                    style={{ backgroundColor: C.marron, color: "white", border: "none", padding: "10px 20px", borderRadius: 999, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif" }}>
                    Agregar 🛒
                  </button>
                </div>
              </div>
            </div>
          ))}
          {productosFiltrados.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 64, marginBottom: 16 }}>🎂</p>
              <p style={{ fontSize: 18 }}>Pronto habrá productos deliciosos aquí</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: C.marron, textAlign: "center", padding: "40px 24px", color: "#fcd34d" }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>🎂</p>
        <p style={{ color: "#fef3c7", fontSize: 20, fontWeight: "bold", marginBottom: 4 }}>La Pastelería</p>
        <p style={{ fontSize: 14, marginBottom: 16 }}>Cartagena, Colombia — Hecho con amor</p>
        <a href="https://wa.me/573045732744" target="_blank" style={{ display: "inline-block", backgroundColor: "#25D366", color: "white", padding: "10px 24px", borderRadius: 999, textDecoration: "none", fontSize: 14 }}>
          📱 Contáctanos por WhatsApp
        </a>
      </footer>

      {/* Carrito sidebar */}
      {carritoOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
          <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }} onClick={() => setCarritoOpen(false)} />
          <div style={{ width: "100%", maxWidth: 420, backgroundColor: "white", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", backgroundColor: C.marron }}>
              <h2 style={{ color: "white", fontSize: 18, fontWeight: "bold", margin: 0 }}>🛒 Tu pedido</h2>
              <button onClick={() => setCarritoOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><X size={22} /></button>
            </div>

            {carrito.length === 0 ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                <ShoppingCart size={48} style={{ marginBottom: 12 }} />
                <p>Tu carrito está vacío</p>
              </div>
            ) : (
              <>
                <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
                  {carrito.map(item => (
                    <div key={item.producto.id} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: C.crema, borderRadius: 16, padding: 12, border: `1px solid ${C.cremaOscura}` }}>
                      <span style={{ fontSize: 32 }}>🎂</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: C.texto, fontSize: 14, fontWeight: 500, margin: 0 }}>{item.producto.nombre}</p>
                        <p style={{ color: C.marron, fontSize: 14, fontWeight: "bold", margin: 0 }}>${(item.producto.precio * item.cantidad).toLocaleString()}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <button onClick={() => cambiarCantidad(item.producto.id, -1)} style={{ backgroundColor: C.cremaOscura, border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={12} /></button>
                        <span style={{ fontSize: 14, fontWeight: "bold", width: 16, textAlign: "center" }}>{item.cantidad}</span>
                        <button onClick={() => cambiarCantidad(item.producto.id, 1)} style={{ backgroundColor: C.marron, border: "none", borderRadius: "50%", width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Plus size={12} /></button>
                      </div>
                      <button onClick={() => eliminarDelCarrito(item.producto.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><X size={16} /></button>
                    </div>
                  ))}

                  <div style={{ borderTop: `1px solid ${C.cremaOscura}`, paddingTop: 16, marginTop: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
                      <span style={{ color: C.texto }}>Total</span>
                      <span style={{ color: C.marron }}>${total.toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {[
                        { placeholder: "Tu nombre completo", value: nombre, onChange: setNombre, type: "text" },
                        { placeholder: "Tu teléfono", value: telefono, onChange: setTelefono, type: "tel" },
                      ].map((field, i) => (
                        <input key={i} type={field.type} placeholder={field.placeholder} value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          style={{ border: `1px solid ${C.cremaOscura}`, borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }} />
                      ))}
                      <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}
                        style={{ border: `1px solid ${C.cremaOscura}`, borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }}>
                        <option value="efectivo">💵 Efectivo</option>
                        <option value="transferencia">🏦 Transferencia</option>
                        <option value="tarjeta">💳 Tarjeta</option>
                      </select>
                      <textarea placeholder="Notas del pedido (sabor, decoración, fecha...)" value={notas} onChange={e => setNotas(e.target.value)} rows={3}
                        style={{ border: `1px solid ${C.cremaOscura}`, borderRadius: 12, padding: "10px 14px", fontSize: 14, outline: "none", fontFamily: "Georgia, serif", resize: "none" }} />
                    </div>
                  </div>
                </div>

                <div style={{ padding: 16, borderTop: `1px solid ${C.cremaOscura}` }}>
                  <button onClick={enviarPedido}
                    style={{ width: "100%", backgroundColor: "#25D366", color: "white", border: "none", padding: "16px", borderRadius: 16, fontSize: 16, fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "Georgia, serif" }}>
                    <Send size={18} /> Enviar pedido por WhatsApp
                  </button>
                  <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 8 }}>Te contactaremos para confirmar tu pedido</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {pedidoEnviado && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: C.marron, color: "white", padding: "12px 24px", borderRadius: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", zIndex: 50, fontWeight: 500 }}>
          ✅ ¡Pedido enviado exitosamente!
        </div>
      )}
    </div>
  )
}