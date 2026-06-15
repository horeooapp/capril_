import { Prisma } from "@prisma/client"
import { normalizePhone } from "./phone"

export function withPhoneNormalization() {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: 'phone-normalization',
      query: {
        user: {
          async create({ args, query }) {
            if (args.data.phone) {
              args.data.phone = normalizePhone(args.data.phone);
            }
            return query(args);
          },
          async update({ args, query }) {
            if (args.data.phone && typeof args.data.phone === 'string') {
              args.data.phone = normalizePhone(args.data.phone);
            }
            return query(args);
          },
          async upsert({ args, query }) {
            if (args.create.phone) {
              args.create.phone = normalizePhone(args.create.phone);
            }
            if (args.update.phone && typeof args.update.phone === 'string') {
              args.update.phone = normalizePhone(args.update.phone);
            }
            return query(args);
          },
          async findUnique({ args, query }) {
            if (args.where.phone) {
              args.where.phone = normalizePhone(args.where.phone);
            }
            return query(args);
          },
          async findFirst({ args, query }) {
            if (args.where?.phone && typeof args.where.phone === 'string') {
              args.where.phone = normalizePhone(args.where.phone);
            }
            return query(args);
          },
        },
        bailDeclaratif: {
          async create({ args, query }) {
            if (args.data.telephoneLocataire) {
              args.data.telephoneLocataire = normalizePhone(args.data.telephoneLocataire);
            }
            return query(args);
          },
          async update({ args, query }) {
            if (args.data.telephoneLocataire && typeof args.data.telephoneLocataire === 'string') {
              args.data.telephoneLocataire = normalizePhone(args.data.telephoneLocataire);
            }
            return query(args);
          },
          async upsert({ args, query }) {
            if (args.create.telephoneLocataire) {
              args.create.telephoneLocataire = normalizePhone(args.create.telephoneLocataire);
            }
            if (args.update.telephoneLocataire && typeof args.update.telephoneLocataire === 'string') {
              args.update.telephoneLocataire = normalizePhone(args.update.telephoneLocataire);
            }
            return query(args);
          },
        }
      }
    })
  })
}
