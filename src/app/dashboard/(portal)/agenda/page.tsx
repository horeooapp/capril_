import AgencyCalendar from "@/components/dashboard/agenda/AgencyCalendar"
import { getAgencyEvents } from "@/actions/agenda-actions"
import { ensureAuthenticated } from "@/actions/auth-helpers"

export default async function AgendaPage() {
    const session = await ensureAuthenticated()
    
    // Default load window: previous month to next month
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    
    const end = new Date()
    end.setMonth(end.getMonth() + 2)
    end.setDate(0) // Last day of next month

    const events = await getAgencyEvents(session.user.id, start, end).catch(() => []) as any

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">
                    Agenda & CRM
                </h1>
                <p className="text-sm font-medium text-slate-500">
                    Planifiez vos rendez-vous, visites, états des lieux et relances.
                </p>
            </div>
            
            <AgencyCalendar initialEvents={events || []} />
        </div>
    )
}
