import { Prisma } from "@prisma/client";
import { TwentySyncService } from "./sync-service";

/**
 * Prisma client extension to capture data mutations in real-time
 * and trigger background synchronizations to Twenty CRM.
 */
export function withTwentySync() {
  return Prisma.defineExtension({
    name: "twenty-sync",
    query: {
      user: {
        async create({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncUser(res.id, 'create');
          return res;
        },
        async update({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncUser(res.id, 'update');
          return res;
        },
        async upsert({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncUser(res.id, 'update');
          return res;
        },
        async delete({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncUser(res.id, 'delete');
          return res;
        },
      },
      property: {
        async create({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncProperty(res.id, 'create');
          return res;
        },
        async update({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncProperty(res.id, 'update');
          return res;
        },
        async upsert({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncProperty(res.id, 'update');
          return res;
        },
        async delete({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncProperty(res.id, 'delete');
          return res;
        },
      },
      lease: {
        async create({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncLease(res.id, 'create');
          return res;
        },
        async update({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncLease(res.id, 'update');
          return res;
        },
        async upsert({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncLease(res.id, 'update');
          return res;
        },
        async delete({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncLease(res.id, 'delete');
          return res;
        },
      },
      receipt: {
        async create({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncReceipt(res.id, 'create');
          return res;
        },
        async update({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncReceipt(res.id, 'update');
          return res;
        },
        async upsert({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncReceipt(res.id, 'update');
          return res;
        },
        async delete({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncReceipt(res.id, 'delete');
          return res;
        },
      },
      paymentPgw: {
        async create({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncPaymentPgw(res.id, 'create');
          return res;
        },
        async update({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncPaymentPgw(res.id, 'update');
          return res;
        },
        async upsert({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncPaymentPgw(res.id, 'update');
          return res;
        },
        async delete({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncPaymentPgw(res.id, 'delete');
          return res;
        },
      },
      dispute: {
        async create({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncDispute(res.id, 'create');
          return res;
        },
        async update({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncDispute(res.id, 'update');
          return res;
        },
        async upsert({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncDispute(res.id, 'update');
          return res;
        },
        async delete({ args, query }) {
          const res = await query(args);
          if (res?.id) TwentySyncService.syncDispute(res.id, 'delete');
          return res;
        },
      },
    },
  });
}
