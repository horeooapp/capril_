"use client"

import Link from "next/link"
import AdminLoginForm from "@/components/auth/AdminLoginForm"
import { ShieldAlert, Server, Fingerprint, Activity } from "lucide-react"
import { motion } from "framer-motion"
import UnifiedLoginPage from "@/components/auth/UnifiedLoginPage"

export default function AdminLoginPage() {
    return (
        <main className="w-full min-h-screen bg-[#020617]">
            <UnifiedLoginPage initialTab="admin" />
        </main>
    )
}
