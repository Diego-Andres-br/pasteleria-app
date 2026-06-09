"use client"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { ShoppingCart, X, Plus, Minus, Send, ChevronDown } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"

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
  const [productoAnimado, setProductoAnimado] = useState<string | null>(null)

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
    setProductoAnimado(producto.id)
    setTimeout(() => setProductoAnimado(null), 600)
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
  const totalItems = carrito.reduce((a, i) => a + i.cantidad, 0)

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .btn-agregar { transition: all 0.2s ease; }
        .btn-agregar:hover { transform: scale(1.05); opacity: 0.9; }
        .btn-agregar:active { transform: scale(0.95); }
        .producto-card { transition: all 0.3s ease; }
        .producto-card:hover { transform: translateY(-6px); box-shadow: 0 16px 40px rgba(124,63,47,0.15) !important; }
        .cat-btn { transition: all 0.2s ease; }
        .cat-btn:hover { transform: scale(1.05); }
        .animado { animation: pulse 0.6s ease; }
        @keyframes pulse { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
        .carrito-btn { transition: all 0.3s ease; }
        .carrito-btn:hover { transform: scale(1.05); }
        .float-btn { animation: flotar 3s ease-in-out infinite; }
        @keyframes flotar { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        .hero-text { font-family: 'Playfair Display', Georgia, serif; }
        .fade-in { animation: fadeIn 0.5s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* Header */}
      <header style={{ backgroundColor: C.marron, position: "sticky", top: 0, zIndex: 40, boxShadow: "0 2px 20px rgba(0,0,0,0.3)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "14px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 className="hero-text" 
  style={{ color: "#fef3c7", fontSize: 22, fontWeight: 900, letterSpacing: 1, cursor: "default" }}
  onDoubleClick={() => window.location.href = "/admin/login"}>
  🎂 Repostería Claudia Patricia
</h1>
            <p style={{ color: "#fcd34d", fontSize: 11, letterSpacing: 2, textTransform: "uppercase" }}>Hecho con amor · Cartagena</p>
          </div>
          <button className="carrito-btn" onClick={() => setCarritoOpen(true)}
            style={{ backgroundColor: C.marronClaro, color: "white", border: "none", padding: "10px 22px", borderRadius: 999, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 14, position: "relative", fontFamily: "Georgia, serif" }}>
            <ShoppingCart size={18} />
            <span style={{ fontWeight: 700 }}>Carrito</span>
            {totalItems > 0 && (
              <span className="animado" style={{ position: "absolute", top: -8, right: -8, backgroundColor: "#ef4444", color: "white", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.marron} 0%, ${C.marronClaro} 100%)`, padding: "100px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 20, left: "10%", fontSize: 40, opacity: 0.15 }}>🎂</div>
        <div style={{ position: "absolute", bottom: 20, right: "10%", fontSize: 60, opacity: 0.15 }}>🍰</div>
        <div style={{ position: "absolute", top: "40%", right: "5%", fontSize: 30, opacity: 0.1 }}>🧁</div>
        <p style={{ color: "#fcd34d", fontSize: 12, letterSpacing: 5, textTransform: "uppercase", marginBottom: 16 }}>Bienvenido a nuestra tienda</p>
        <h2 className="hero-text" style={{ color: "white", fontSize: 52, fontWeight: 900, marginBottom: 20, lineHeight: 1.1, textShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          Pasteles para cada<br />momento especial
        </h2>
        <p style={{ color: "#fef3c7", fontSize: 18, maxWidth: 520, margin: "0 auto 40px", lineHeight: 1.7, fontFamily: "Lato, sans-serif", fontWeight: 300 }}>
          Tortas, cupcakes y delicias artesanales hechas con los mejores ingredientes y mucho amor 🍰
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="float-btn" onClick={() => document.getElementById("productos")?.scrollIntoView({ behavior: "smooth" })}
            style={{ backgroundColor: "white", color: C.marron, border: "none", padding: "14px 36px", borderRadius: 999, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: 8 }}>
            Ver productos <ChevronDown size={18} />
          </button>
          <a href="https://wa.me/573045732744" target="_blank"
            style={{ backgroundColor: "#25D366", color: "white", border: "none", padding: "14px 36px", borderRadius: 999, cursor: "pointer", fontSize: 15, fontWeight: 700, fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            WhatsApp
          </a>
        </div>
      </div>

      {/* Galería */}
<div style={{ backgroundColor: "white", padding: "70px 24px", textAlign: "center" }}>
  <div style={{ maxWidth: 1100, margin: "0 auto" }}>
    <p style={{ color: C.marronClaro, fontSize: 12, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Nuestros trabajos</p>
    <h3 className="hero-text" style={{ color: C.marron, fontSize: 40, fontWeight: 900, marginBottom: 12 }}>Galería de creaciones</h3>
    <p style={{ color: "#9ca3af", fontSize: 16, marginBottom: 48, fontFamily: "Lato, sans-serif" }}>Cada torta es una obra de arte hecha con amor</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 16 }}>
      {[
        { emoji: "🎂", label: "Torta de bodas", desc: "Elegancia y amor" },
        { emoji: "🧁", label: "Cupcakes florales", desc: "Para ocasiones especiales" },
        { emoji: "🍰", label: "Torta de cumpleaños", desc: "Personalizada con tu tema" },
        { emoji: "🎀", label: "Baby shower", desc: "Dulce bienvenida" },
        { emoji: "👑", label: "Quinceañera", desc: "El día más especial" },
        { emoji: "💝", label: "Aniversario", desc: "Celebra el amor" },
      ].map((item, i) => (
        <div key={i} className="producto-card"
          style={{ borderRadius: 20, overflow: "hidden", border: `1px solid ${C.cremaOscura}`, cursor: "pointer" }}>
          <div style={{ height: 200, background: `linear-gradient(135deg, #fdf0e8, ${C.cremaOscura})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80 }}>
            {item.emoji}
          </div>
          <div style={{ padding: "16px 20px", backgroundColor: "white", textAlign: "left" }}>
            <p style={{ color: C.marron, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{item.label}</p>
            <p style={{ color: "#9ca3af", fontSize: 13, fontFamily: "Lato, sans-serif" }}>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
    <p style={{ marginTop: 32, color: C.texto, fontSize: 15, fontFamily: "Lato, sans-serif" }}>
      ¿Quieres algo personalizado?{" "}
      <a href="https://wa.me/573045732744" target="_blank" style={{ color: C.marron, fontWeight: 700 }}>
        Escríbenos por WhatsApp
      </a>
    </p>
  </div>
</div>

      {/* Productos */}
      <div id="productos" style={{ maxWidth: 1200, margin: "0 auto", padding: "50px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <p style={{ color: C.marronClaro, fontSize: 12, letterSpacing: 4, textTransform: "uppercase", marginBottom: 8 }}>Nuestro menú</p>
          <h3 className="hero-text" style={{ color: C.marron, fontSize: 36, fontWeight: 700 }}>Elige tu favorito</h3>
        </div>

        {/* Categorías */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
          {categorias.map(cat => (
            <button key={cat} className="cat-btn" onClick={() => setCategoriaActiva(cat)}
              style={{ padding: "10px 24px", borderRadius: 999, border: `2px solid ${C.marronClaro}`, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif", fontWeight: 600,
                backgroundColor: categoriaActiva === cat ? C.marron : "white",
                color: categoriaActiva === cat ? "white" : C.marron,
                boxShadow: categoriaActiva === cat ? `0 4px 16px rgba(124,63,47,0.3)` : "none" }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 32, paddingBottom: 80 }}>
          {productosFiltrados.map(p => (
            <div key={p.id} className="producto-card" style={{ backgroundColor: "white", borderRadius: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden", border: `1px solid ${C.cremaOscura}` }}>
              <div style={{ height: 220, background: `linear-gradient(135deg, #fdf0e8, ${C.cremaOscura})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 80, position: "relative" }}>
                🎂
                <div style={{ position: "absolute", top: 12, right: 12, backgroundColor: C.marron, color: "white", fontSize: 11, padding: "4px 12px", borderRadius: 999, fontWeight: 700, letterSpacing: 1 }}>
                  {p.categoria?.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: "20px 24px 24px" }}>
                <h3 className="hero-text" style={{ color: C.texto, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>{p.nombre}</h3>
                <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 20, lineHeight: 1.6, fontFamily: "Lato, sans-serif" }}>{p.descripcion}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="hero-text" style={{ color: C.marron, fontSize: 28, fontWeight: 900 }}>${p.precio.toLocaleString()}</span>
                  <button className={`btn-agregar ${productoAnimado === p.id ? "animado" : ""}`}
                    onClick={() => agregarAlCarrito(p)}
                    style={{ backgroundColor: C.marron, color: "white", border: "none", padding: "12px 24px", borderRadius: 999, cursor: "pointer", fontSize: 14, fontWeight: 700, fontFamily: "Georgia, serif" }}>
                    Agregar 🛒
                  </button>
                </div>
              </div>
            </div>
          ))}
          {productosFiltrados.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
              <p style={{ fontSize: 64, marginBottom: 16 }}>🎂</p>
              <p className="hero-text" style={{ fontSize: 22 }}>Pronto habrá productos deliciosos aquí</p>
            </div>
          )}
        </div>
      </div>

{/* Botón flotante WhatsApp */}
<a href="https://wa.me/573045732744" target="_blank"
  style={{ position: "fixed", bottom: 24, right: 24, backgroundColor: "#25D366", color: "white", width: 60, height: 60, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, boxShadow: "0 4px 20px rgba(37,211,102,0.5)", zIndex: 40, textDecoration: "none", transition: "transform 0.3s" }}
  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.1)")}
  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}>
  <FaWhatsapp />
</a>

{/* Sobre nosotros */}
<div style={{ background: `linear-gradient(135deg, #fdf0e8, ${C.cremaOscura})`, padding: "80px 24px", textAlign: "center" }}>
  <div style={{ maxWidth: 800, margin: "0 auto" }}>
    <p style={{ color: C.marronClaro, fontSize: 12, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Nuestra historia</p>
    <h3 className="hero-text" style={{ color: C.marron, fontSize: 40, fontWeight: 900, marginBottom: 24, lineHeight: 1.2 }}>
      Hechos con amor desde Cartagena
    </h3>
    <p style={{ color: C.texto, fontSize: 17, lineHeight: 1.9, marginBottom: 20, fontFamily: "Lato, sans-serif", fontWeight: 300 }}>
      Somos <strong>Repostería Claudia Patricia</strong>, una pastelería artesanal nacida en el corazón de Cartagena. 
      Cada torta, cada cupcake y cada detalle dulce que preparamos lleva ingredientes de calidad y el cariño 
      de quien sabe que un buen postre puede hacer un momento inolvidable.
    </p>
    <p style={{ color: C.texto, fontSize: 17, lineHeight: 1.9, marginBottom: 40, fontFamily: "Lato, sans-serif", fontWeight: 300 }}>
      Trabajamos con pedidos personalizados para que tu celebración sea exactamente como la soñaste. 
      🎂 Bodas, quinceañeros, cumpleaños, baby showers — estamos aquí para endulzar tu vida.
    </p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 24, maxWidth: 700, margin: "0 auto" }}>
      {[
        { emoji: "🎂", label: "Tortas personalizadas" },
        { emoji: "🧁", label: "Cupcakes artesanales" },
        { emoji: "🍰", label: "Postres especiales" },
        { emoji: "💝", label: "Hechos con amor" },
      ].map(item => (
        <div key={item.label} style={{ backgroundColor: "white", borderRadius: 20, padding: "24px 16px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", border: `1px solid ${C.cremaOscura}` }}>
          <p style={{ fontSize: 40, marginBottom: 10 }}>{item.emoji}</p>
          <p style={{ color: C.marron, fontSize: 14, fontWeight: 700, fontFamily: "Lato, sans-serif" }}>{item.label}</p>
        </div>
      ))}
    </div>
  </div>
</div>

{/* Testimonios */}
<div style={{ backgroundColor: "white", padding: "80px 24px", textAlign: "center" }}>
  <div style={{ maxWidth: 1100, margin: "0 auto" }}>
    <p style={{ color: C.marronClaro, fontSize: 12, letterSpacing: 4, textTransform: "uppercase", marginBottom: 12 }}>Lo que dicen nuestros clientes</p>
    <h3 className="hero-text" style={{ color: C.marron, fontSize: 40, fontWeight: 900, marginBottom: 48 }}>
      Reseñas y testimonios 💬
    </h3>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
      {[
        { nombre: "María Fernanda", ciudad: "Cartagena", texto: "¡La torta de mi boda fue absolutamente perfecta! Claudia Patricia superó todas mis expectativas. El sabor, la decoración, todo impecable. 100% recomendada.", estrellas: 5 },
        { nombre: "Carlos Andrés", ciudad: "Barranquilla", texto: "Pedí los cupcakes para el cumpleaños de mi hija y quedaron hermosos. Los niños los amaron y los adultos también. Definitivamente volveré a pedir.", estrellas: 5 },
        { nombre: "Valentina Gómez", ciudad: "Cartagena", texto: "Atención personalizada y productos de primera calidad. La torta de quinceaños de mi sobrina quedó exactamente como la queríamos. ¡Gracias!", estrellas: 5 },
        { nombre: "Andrés Felipe", ciudad: "Bogotá", texto: "Encargué una torta especial para aniversario y llegó a tiempo, perfectamente decorada. El sabor es increíble, nunca había probado algo tan delicioso.", estrellas: 5 },
        { nombre: "Laura Paola", ciudad: "Cartagena", texto: "Los mejores postres de Cartagena sin duda. Claudia Patricia tiene un talento único y lo pone en cada detalle. Mi familia queda encantada siempre.", estrellas: 5 },
        { nombre: "Roberto Silva", ciudad: "Sincelejo", texto: "Pedí una torta de baby shower y fue el centro de atención de la fiesta. Todos preguntaban dónde la habían hecho. Excelente trabajo.", estrellas: 5 },
      ].map((t, i) => (
        <div key={i} style={{ backgroundColor: C.crema, borderRadius: 20, padding: 28, textAlign: "left", border: `1px solid ${C.cremaOscura}`, transition: "transform 0.3s, box-shadow 0.3s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(124,63,47,0.12)" }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
            {Array.from({ length: t.estrellas }).map((_, j) => (
              <span key={j} style={{ color: "#f59e0b", fontSize: 18 }}>★</span>
            ))}
          </div>
          <p style={{ color: C.texto, fontSize: 14, lineHeight: 1.8, marginBottom: 16, fontFamily: "Lato, sans-serif", fontStyle: "italic" }}>&#34;{t.texto}&#34;</p>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 42, height: 42, borderRadius: "50%", backgroundColor: C.marron, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 18, fontWeight: 700 }}>
              {t.nombre[0]}
            </div>
            <div>
              <p style={{ color: C.marron, fontSize: 14, fontWeight: 700, margin: 0 }}>{t.nombre}</p>
              <p style={{ color: C.marronClaro, fontSize: 12, margin: 0 }}>{t.ciudad}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>

{/* footer */}
<footer style={{ backgroundColor: C.marron, textAlign: "center", padding: "50px 24px", color: "#fcd34d" }}>
  <p style={{ fontSize: 40, marginBottom: 12 }}>🎂</p>
  <h4 className="hero-text" style={{ color: "#fef3c7", fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Repostería Claudia Patricia</h4>
  <p style={{ fontSize: 14, marginBottom: 6, color: "#fcd34d" }}>Cartagena, Colombia</p>
  <p style={{ fontSize: 13, marginBottom: 24, color: C.cremaOscura }}>Hecho con amor desde el corazón de la ciudad</p>
  <a href="https://wa.me/573045732744" target="_blank"
    style={{ display: "inline-flex", alignItems: "center", gap: 8, backgroundColor: "#25D366", color: "white", padding: "12px 28px", borderRadius: 999, textDecoration: "none", fontSize: 15, fontWeight: 700 }}>
    <FaWhatsapp size={20} /> Contáctanos por WhatsApp
  </a>
  <p style={{ marginTop: 32, fontSize: 12, color: C.cremaOscura, opacity: 0.6 }}>© 2026 Repostería Claudia Patricia · Todos los derechos reservados</p>
  
  {/* Botón escondido admin */}
<a href="/admin/login" onClick={(e) => { e.preventDefault(); window.location.href = window.location.origin + "/admin/login" }} style={{ display: "inline-block", marginTop: 24, color: "transparent", fontSize: 10, cursor: "default", userSelect: "none", opacity: 0.15 }}
    onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
    onMouseLeave={e => (e.currentTarget.style.opacity = "0.15")}>
    ⚙️ Admin
  </a>
</footer>



{/* Carrito */}
{carritoOpen && (
  <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex" }}>
    <div style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} onClick={() => setCarritoOpen(false)} />
    <div className="fade-in" style={{ width: "100%", maxWidth: 440, backgroundColor: "white", height: "100%", overflowY: "auto", display: "flex", flexDirection: "column" }}>
      
      {/* Header carrito */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", background: `linear-gradient(135deg, ${C.marron}, ${C.marronClaro})` }}>
        <h2 className="hero-text" style={{ color: "white", fontSize: 20, fontWeight: 700 }}>🛒 Tu pedido</h2>
        <button onClick={() => setCarritoOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}><X size={24} /></button>
      </div>

      {carrito.length === 0 ? (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
          <p style={{ fontSize: 64, marginBottom: 16 }}>🛒</p>
          <p className="hero-text" style={{ fontSize: 18 }}>Tu carrito está vacío</p>
          <p style={{ fontSize: 14, marginTop: 8, fontFamily: "Lato, sans-serif" }}>Agrega algo delicioso</p>
          <button onClick={() => setCarritoOpen(false)}
            style={{ marginTop: 24, backgroundColor: C.marron, color: "white", border: "none", padding: "12px 28px", borderRadius: 999, cursor: "pointer", fontSize: 14, fontFamily: "Georgia, serif", fontWeight: 700 }}>
            Ver productos
          </button>
        </div>
      ) : (
        <>
          <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            
            {/* Pasos */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              {["🛒 Productos", "📋 Datos", "✅ Confirmar"].map((paso, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 11, padding: "4px 10px", borderRadius: 999, backgroundColor: i === 0 ? C.marron : i === 1 ? C.marronClaro : C.cremaOscura, color: i < 2 ? "white" : C.texto, fontWeight: 700 }}>
                    {paso}
                  </div>
                  {i < 2 && <span style={{ color: C.marronClaro, fontSize: 12 }}>→</span>}
                </div>
              ))}
            </div>

            {/* Items */}
            {carrito.map(item => (
              <div key={item.producto.id} style={{ display: "flex", alignItems: "center", gap: 12, backgroundColor: C.crema, borderRadius: 16, padding: "12px 14px", border: `1px solid ${C.cremaOscura}` }}>
                <span style={{ fontSize: 36 }}>🎂</span>
                <div style={{ flex: 1 }}>
                  <p style={{ color: C.texto, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.producto.nombre}</p>
                  <p style={{ color: "#9ca3af", fontSize: 12, marginBottom: 4, fontFamily: "Lato, sans-serif" }}>${item.producto.precio.toLocaleString()} c/u</p>
                  <p style={{ color: C.marron, fontSize: 15, fontWeight: 900 }}>${(item.producto.precio * item.cantidad).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <button onClick={() => cambiarCantidad(item.producto.id, -1)} style={{ backgroundColor: C.cremaOscura, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Minus size={14} /></button>
                  <span style={{ fontSize: 16, fontWeight: 700, width: 20, textAlign: "center" }}>{item.cantidad}</span>
                  <button onClick={() => cambiarCantidad(item.producto.id, 1)} style={{ backgroundColor: C.marron, border: "none", borderRadius: "50%", width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}><Plus size={14} /></button>
                </div>
                <button onClick={() => eliminarDelCarrito(item.producto.id)} style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}><X size={16} /></button>
              </div>
            ))}

            {/* Resumen */}
            <div style={{ backgroundColor: C.crema, borderRadius: 16, padding: 16, border: `1px solid ${C.cremaOscura}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8, color: C.texto, fontFamily: "Lato, sans-serif" }}>
                <span>Subtotal ({totalItems} {totalItems === 1 ? "producto" : "productos"})</span>
                <span>${total.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 12, color: C.texto, fontFamily: "Lato, sans-serif" }}>
                <span>Envío</span>
                <span style={{ color: "#10b981", fontWeight: 700 }}>A convenir</span>
              </div>
              <div style={{ borderTop: `2px solid ${C.cremaOscura}`, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
                <span className="hero-text" style={{ color: C.texto, fontSize: 18, fontWeight: 700 }}>Total</span>
                <span className="hero-text" style={{ color: C.marron, fontSize: 22, fontWeight: 900 }}>${total.toLocaleString()}</span>
              </div>
            </div>

            {/* Formulario */}
            <div style={{ borderTop: `2px solid ${C.cremaOscura}`, paddingTop: 16 }}>
              <p className="hero-text" style={{ color: C.marron, fontSize: 16, fontWeight: 700, marginBottom: 12 }}>📋 Tus datos</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <input placeholder="Tu nombre completo *" value={nombre} onChange={e => setNombre(e.target.value)}
                  style={{ border: `1px solid ${C.cremaOscura}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }} />
                <input placeholder="Tu teléfono *" value={telefono} onChange={e => setTelefono(e.target.value)}
                  style={{ border: `1px solid ${C.cremaOscura}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }} />
      <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}
  style={{ border: `1px solid ${C.cremaOscura}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "Georgia, serif" }}>
  <option value="efectivo">💵 Efectivo</option>
  <option value="bold">💳 Pagar con Bold (tarjeta/transferencia)</option>
  <option value="contraentrega">📦 Contra entrega</option>
</select>

{metodoPago === "bold" && (
  <a href="https://checkout.bold.co/payment/LNK_EMZU6WEN6T" target="_blank"
    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#6c3fc5", color: "white", padding: "12px 16px", borderRadius: 12, textDecoration: "none", fontSize: 14, fontWeight: 700, fontFamily: "Georgia, serif" }}>
    💳 Ir a pagar con Bold →
  </a>
)}
                <textarea placeholder="Notas: sabor, decoración, fecha de entrega, dirección..." value={notas} onChange={e => setNotas(e.target.value)} rows={3}
                  style={{ border: `1px solid ${C.cremaOscura}`, borderRadius: 12, padding: "12px 16px", fontSize: 14, outline: "none", fontFamily: "Georgia, serif", resize: "none" }} />
              </div>
            </div>
          </div>

          {/* Botón enviar */}
          <div style={{ padding: 16, borderTop: `1px solid ${C.cremaOscura}`, backgroundColor: "white" }}>
            {(!nombre || !telefono) && (
              <p style={{ textAlign: "center", fontSize: 12, color: "#f87171", marginBottom: 8, fontFamily: "Lato, sans-serif" }}>
                ⚠️ Por favor completa tu nombre y teléfono
              </p>
            )}
            <button onClick={enviarPedido}
              style={{ width: "100%", backgroundColor: nombre && telefono ? "#25D366" : "#9ca3af", color: "white", border: "none", padding: "16px", borderRadius: 16, fontSize: 16, fontWeight: 700, cursor: nombre && telefono ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "Georgia, serif", boxShadow: nombre && telefono ? "0 4px 16px rgba(37,211,102,0.4)" : "none", transition: "all 0.3s" }}>
              <Send size={20} /> Enviar pedido por WhatsApp
            </button>
            <p style={{ textAlign: "center", fontSize: 12, color: "#9ca3af", marginTop: 10, fontFamily: "Lato, sans-serif" }}>
              Te contactaremos para confirmar tu pedido 🎂
            </p>
          </div>
        </>
      )}
    </div>
  </div>
)}

      {pedidoEnviado && (
        <div className="fade-in" style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", backgroundColor: C.marron, color: "white", padding: "14px 28px", borderRadius: 999, boxShadow: "0 8px 24px rgba(0,0,0,0.2)", zIndex: 60, fontWeight: 700, fontSize: 15 }}>
          ✅ ¡Pedido enviado exitosamente!
        </div>
      )}
    </div>
  )
}