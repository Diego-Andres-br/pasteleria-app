"use client"
import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (pathname === "/admin/login") {
      setOk(true)
      return
    }
    if (localStorage.getItem("admin_auth") === "true") {
      setOk(true)
    } else {
      router.push("/admin/login")
    }
  }, [pathname, router])

  if (!ok) return null

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: 24, backgroundColor: "#f3f4f6", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  )
}