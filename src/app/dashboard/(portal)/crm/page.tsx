import { getCrmContacts } from "@/actions/crm-actions"
import { auth } from "@/auth"
import CRMDashboardClient from "./crm-client"

export default async function CRMDashboardPage() {
    const session = await auth()
    
    let contacts: any[] = []
    
    if (session?.user?.id) {
        contacts = await getCrmContacts(session.user.id)
    }

    return <CRMDashboardClient initialContacts={contacts} />
}
