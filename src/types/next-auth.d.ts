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
            profileType?: string | null
            diasporaAbonnement?: boolean
            capaciteActive?: string | null
            capacites?: string[]
            eligibleRoles?: string[]
            chosenRole?: string | null
            requiresRoleSelection?: boolean
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
        profileType?: string | null
        diasporaAbonnement?: boolean
        capaciteActive?: string | null
        capacites?: string[]
        eligibleRoles?: string[]
        chosenRole?: string | null
        requiresRoleSelection?: boolean
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
        profileType?: string | null
        diasporaAbonnement?: boolean
        capaciteActive?: string | null
        capacites?: string[]
        eligibleRoles?: string[]
        chosenRole?: string | null
        requiresRoleSelection?: boolean
    }
}

// Augment @auth/core/types
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
            profileType?: string | null
            diasporaAbonnement?: boolean
            capaciteActive?: string | null
            capacites?: string[]
            eligibleRoles?: string[]
            chosenRole?: string | null
            requiresRoleSelection?: boolean
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
        profileType?: string | null
        diasporaAbonnement?: boolean
        capaciteActive?: string | null
        capacites?: string[]
        eligibleRoles?: string[]
        chosenRole?: string | null
        requiresRoleSelection?: boolean
    }
}

// Augment @auth/core
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
            profileType?: string | null
            diasporaAbonnement?: boolean
            capaciteActive?: string | null
            capacites?: string[]
            eligibleRoles?: string[]
            chosenRole?: string | null
            requiresRoleSelection?: boolean
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
        profileType?: string | null
        diasporaAbonnement?: boolean
        capaciteActive?: string | null
        capacites?: string[]
        eligibleRoles?: string[]
        chosenRole?: string | null
        requiresRoleSelection?: boolean
    }
}
