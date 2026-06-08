"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  function ingresar() {
    if (password === "pasteleria2024") {
      localStorage.setItem("admin_auth", "true")
      router.push("/admin/dashboard")
    } else {
      setError("Contraseña incorrecta")
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdf6f0", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ backgroundColor: "white", borderRadius: 24, boxShadow: "0 8px 32px rgba(0,0,0,0.1)", padding: 40, width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🎂</div>
        <h1 style={{ color: "#7c3f2f", fontSize: 24, fontWeight: "bold", margin: "0 0 4px" }}>Panel Admin</h1>
        <p style={{ color: "#c8956c", fontSize: 14, marginBottom: 28 }}>Pastelería</p>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ingresar()}
          style={{ width: "100%", border: "1px solid #f5d5b8", borderRadius: 12, padding: "12px 16px", fontSize: 14, marginBottom: 12, outline: "none", fontFamily: "Georgia, serif", boxSizing: "border-box" }}
        />
        {error && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 12 }}>{error}</p>}
        <button onClick={ingresar}
          style={{ width: "100%", backgroundColor: "#7c3f2f", color: "white", border: "none", padding: "14px", borderRadius: 12, fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "Georgia, serif" }}>
          Ingresar
        </button>
      </div>
    </div>
  )
}