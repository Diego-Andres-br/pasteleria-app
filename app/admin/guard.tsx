"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Guard({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (localStorage.getItem("admin_auth") === "true") {
      setOk(true)
    } else {
      router.push("/admin/login")
    }
  }, [router])

  if (!ok) return null
  return <>{children}</>
}