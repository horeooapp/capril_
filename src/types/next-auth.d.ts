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
        } & DefaultSession["user"]
    }

    interface User {
        phone?: string | null
        role?: Role
        status?: string | null
        kycLevel?: number
        kycStatus?: string
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
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        phone?: string | null
        role?: Role
        status?: string | null
        kycLevel?: number
        kycStatus?: string
    }
}
