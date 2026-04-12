import AntiFraudSentinelClient from "./moderation-client"
import { getAuditLogs } from "@/actions/audit"

export default async function AntiFraudSentinelPage() {
    const logs = await getAuditLogs({})
    return <AntiFraudSentinelClient initialLogs={logs} />
}
