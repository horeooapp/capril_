import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

// Augment next-auth module
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
            diasporaAbonnement?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id?: string
        phone?: string | null
        role?: Role
        status?: string | null
        kycLevel?: number
        kycStatus?: string
        fullName?: string | null
        onboardingComplete?: boolean
        diasporaAbonnement?: boolean
    }
}

// Augment next-auth/jwt module
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
        diasporaAbonnement?: boolean
    }
}

// Augment @auth/core/types (very important for NextAuth v5)
declare module "@auth/core/types" {
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
            diasporaAbonnement?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        id?: string
        phone?: string | null
        role?: Role
        status?: string | null
        kycLevel?: number
        kycStatus?: string
        fullName?: string | null
        onboardingComplete?: boolean
        diasporaAbonnement?: boolean
    }
}

// Augment @auth/core (sometimes used directly in config)
declare module "@auth/core" {
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
            diasporaAbonnement?: boolean
        } & DefaultSession["user"]
    }
}

// Augment @auth/core/adapters
declare module "@auth/core/adapters" {
    interface AdapterUser {
        phone?: string | null
        role?: Role
        status?: string | null
        kycLevel?: number
        kycStatus?: string
        fullName?: string | null
        onboardingComplete?: boolean
        diasporaAbonnement?: boolean
    }
}
