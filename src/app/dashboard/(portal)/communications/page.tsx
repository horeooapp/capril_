import React from "react"
import { getAllNews } from "@/actions/news-actions"
import CommunicationsClient from "./CommunicationsClient"

export default async function CommunicationsDashboardPage() {
    const news = await getAllNews()
    
    return <CommunicationsClient initialNews={news} />
}
