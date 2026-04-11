import { getAutomationSettings } from "@/actions/automations-actions"
import AutomationsDashboardClient from "./automations-client"

export default async function AutomationsDashboardPage() {
    const settings = await getAutomationSettings()

    // Pass default settings if none returned
    const initialSettings = settings || {
        autoRelance: true,
        autoQuittance: true,
        autoAssurance: false
    }

    return <AutomationsDashboardClient initialSettings={initialSettings} />
}
