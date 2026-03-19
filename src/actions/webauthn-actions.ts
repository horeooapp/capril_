"use server"

import { prisma } from "@/lib/prisma";
import { 
  generateRegistrationOptions, 
  verifyRegistrationResponse, 
  generateAuthenticationOptions, 
  verifyAuthenticationResponse 
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost";
const RP_NAME = "QAPRIL Secure";
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000";

// --- ENRÔLEMENT (Registration) ---

export async function getRegistrationOptions(userId: string) {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    include: { authenticators: true }
  });

  if (!user) throw new Error("User not found");

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: user.id,
    userName: user.phone,
    attestationType: "none",
    excludeCredentials: user.authenticators.map((auth: any) => ({
      id: auth.credentialID,
      type: "public-key",
      transports: auth.transports?.split(",") as any,
    })),
    authenticatorSelection: {
      residentKey: "preferred",
      userVerification: "preferred",
      authenticatorAttachment: "platform", // Force FaceID/TouchID (Platform)
    },
  });

  // Stocker le challenge en session (ou temporairement en DB)
  // Ici, on le retourne directement pour la démo, mais en prod il faut le sécuriser
  return options;
}

export async function verifyRegistration(userId: string, body: any, expectedChallenge: string) {
  const verification = await verifyRegistrationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  });

  if (verification.verified && verification.registrationInfo) {
    const { credentialPublicKey, credentialID, counter } = verification.registrationInfo;

    await (prisma as any).authenticator.create({
      data: {
        userId,
        credentialID: isoBase64URL.fromBuffer(credentialID),
        credentialPublicKey: isoBase64URL.fromBuffer(credentialPublicKey),
        counter,
        credentialDeviceType: verification.registrationInfo.credentialDeviceType,
        credentialBackedUp: verification.registrationInfo.credentialBackedUp,
        providerAccountId: userId,
      }
    });

    return { success: true };
  }

  return { success: false };
}

// --- SIGNATURE (Authentication) ---

export async function getAuthenticationOptions(userId: string) {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    include: { authenticators: true }
  });

  if (!user || user.authenticators.length === 0) {
    throw new Error("No biometrics registered");
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: user.authenticators.map((auth: any) => ({
      id: auth.credentialID,
      type: "public-key",
      transports: auth.transports?.split(",") as any,
    })),
    userVerification: "preferred",
  });

  return options;
}

export async function verifySignature(userId: string, body: any, expectedChallenge: string) {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    include: { authenticators: { where: { credentialID: body.id } } }
  });

  const authenticator = user?.authenticators[0];
  if (!authenticator) throw new Error("Authenticator not found");

  const verification = await verifyAuthenticationResponse({
    response: body,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    authenticator: {
      credentialID: isoBase64URL.toBuffer(authenticator.credentialID),
      credentialPublicKey: isoBase64URL.toBuffer(authenticator.credentialPublicKey),
      counter: authenticator.counter,
    },
  });

  if (verification.verified) {
    // Update counter
    await (prisma as any).authenticator.update({
      where: { credentialID: authenticator.credentialID },
      data: { counter: verification.authenticationInfo.newCounter }
    });

    return { success: true };
  }

  return { success: false };
}
