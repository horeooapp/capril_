import { getLandlordMandates } from "@/actions/mandates"
import MandatesClient from "./mandates-client"

export default async function LandlordMandatesPage() {
    const mandates = await getLandlordMandates()

    return (
        <MandatesClient mandates={mandates as any[]} />
    )
}
