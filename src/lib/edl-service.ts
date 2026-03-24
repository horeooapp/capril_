import { prisma } from "@/lib/prisma";
import * as crypto from "crypto";

/**
 * EDL SERVICE - M-EDL (ADD-15)
 * Digital Inventory (État des lieux) management.
 */
export class EdlService {
  /**
   * Start a new inspection (Entry or Exit).
   */
  static async startInspection(leaseId: string, type: "ENTRY" | "EXIT", date: Date) {
    return await prisma.inspection.create({
      data: {
        leaseId,
        type,
        date,
        status: "PLANIFIEE",
      },
    });
  }

  /**
   * Add room details to an inspection.
   */
  static async addRoomDetails(inspectionId: string, roomData: {
    name: string;
    status: any; // RoomStatus enum
    comments?: string;
    photos?: string[]; // URLs
  }) {
    const room = await prisma.inspectionRoom.create({
      data: {
        inspectionId,
        name: roomData.name,
        status: roomData.status,
        comments: roomData.comments,
      },
    });

    if (roomData.photos && roomData.photos.length > 0) {
      await (prisma as any).inspectionPhoto.createMany({
        data: roomData.photos.map(url => ({
          inspectionRoomId: room.id,
          url,
        })),
      });
    }

    return room;
  }

  /**
   * Complete inspection and generate SHA-256 hash for certification.
   */
  static async completeInspection(inspectionId: string, score: number, comments?: string) {
    const inspection = await prisma.inspection.findUnique({
      where: { id: inspectionId },
      include: { rooms: { include: { photos: true } } },
    });

    if (!inspection) throw new Error("Inspection not found");

    // Generate hash of the entire inspection content
    const payload = JSON.stringify({
      id: inspection.id,
      leaseId: inspection.leaseId,
      type: inspection.type,
      rooms: inspection.rooms,
      score,
      timestamp: new Date().toISOString(),
    });

    const hash = crypto.createHash("sha256").update(payload).digest("hex");

    return await prisma.inspection.update({
      where: { id: inspectionId },
      data: {
        status: "TERMINEE",
        generalScore: score,
        comments,
        // We could store the hash in a new field if added to schema, 
        // or just include it in the final PDF metadata.
      },
    });
  }
}
