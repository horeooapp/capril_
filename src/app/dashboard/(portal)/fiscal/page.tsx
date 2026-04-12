import React from "react"
import { auth } from "@/auth"
import FiscalDashboardClient from "./fiscal-client"
import { getFiscalStats } from "@/actions/fiscal-actions"

export const dynamic = 'force-dynamic'

export default async function FiscalPage() {
    const session = await auth()
    if (!session || !session.user) return null

    const data = await getFiscalStats()
    const initialStats = data.success ? data : {}

    return (
        <FiscalDashboardClient initialStats={initialStats} />
    )
}
