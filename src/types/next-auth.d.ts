import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            phone?: string
            role: Role
            status?: string
            kycLevel: number
            kycStatus: string
            fullName?: string | null
            onboardingComplete?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        phone?: string | null
        role?: Role
        status?: string | null
        kycLevel?: number
        kycStatus?: string
        fullName?: string | null
        onboardingComplete?: boolean
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        phone?: string
        role?: Role
        status?: string
        kycLevel?: number
        kycStatus?: string
        fullName?: string | null
        onboardingComplete?: boolean
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        phone?: string | null
        role?: Role
        status?: string | null
        kycLevel?: number
        kycStatus?: string
        fullName?: string | null
        onboardingComplete?: boolean
    }
}
