"use server"

import { prisma } from "@/lib/prisma"

/**
 * Aggregates platform data to refresh market statistics.
 * Anonymizes data by grouping by city and commune.
 */
export async function refreshMarketStats() {
    // Group all active leases to calculate averages
    const stats = await prisma.lease.findMany({
        where: { status: "ACTIVE" },
        include: {
            property: {
                select: {
                    city: true,
                    commune: true,
                    propertyType: true
                }
            }
        }
    })

    const marketMap = new Map<string, { totalRent: number, count: number }>()

    stats.forEach((lease) => {
        const city = lease.property.city || 'ABIDJAN'
        const commune = lease.property.commune || 'N/A'
        const type = lease.property.propertyType
        const key = `${city}|${commune}|${type}`
        
        const current = marketMap.get(key) || { totalRent: 0, count: 0 }
        marketMap.set(key, {
            totalRent: current.totalRent + Number(lease.rentAmount),
            count: current.count + 1
        })
    })

    // Update MarketData table
    for (const [key, data] of marketMap.entries()) {
        const [city, commune, propertyType] = key.split('|')
        const averageRent = data.totalRent / data.count

        await prisma.marketData.upsert({
            where: {
                city_commune_propertyType: {
                    city,
                    commune: commune === 'N/A' ? "" : commune,
                    propertyType
                }
            },
            update: {
                averageRent,
                sampleSize: data.count,
                updatedAt: new Date()
            },
            create: {
                city,
                commune: commune === 'N/A' ? "" : commune,
                propertyType,
                averageRent,
                sampleSize: data.count
            }
        })
    }

    return marketMap.size
}

/**
 * Retrieves market trends for the observatory.
 */
export async function getMarketTrends(city?: string) {
    return await prisma.marketData.findMany({
        where: city ? { city } : undefined,
        orderBy: { averageRent: 'desc' }
    })
}
