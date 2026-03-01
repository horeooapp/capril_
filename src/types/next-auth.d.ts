import { Role } from "@prisma/client"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: Role
            isCertified?: boolean
        } & DefaultSession["user"]
    }

    interface User {
        role?: Role
        isCertified?: boolean
    }
}

declare module "@auth/core/adapters" {
    interface AdapterUser {
        role?: Role
        isCertified?: boolean
    }
}
