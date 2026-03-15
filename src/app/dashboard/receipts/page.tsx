import { getMyReceipts } from "@/actions/receipts"
import ReceiptsClient from "./receipts-client"

export default async function ReceiptsPage() {
    const receipts = await getMyReceipts()

    return (
        <ReceiptsClient receipts={receipts as any[]} />
    )
}
