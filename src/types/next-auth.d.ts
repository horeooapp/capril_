import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
            isCertified?: boolean | null
        } & DefaultSession["user"]
    }

    interface User {
        role?: Role
        isCertified?: boolean | null
        password?: string | null
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        role?: Role
        isCertified?: boolean | null
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role?: Role
        isCertified?: boolean | null
        password?: string | null
    }
}
