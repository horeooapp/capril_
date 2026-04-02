"use server";
// src/actions/auth.actions.ts

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type TypeConnexion = "BAILLEUR" | "LOCATAIRE" | "ADMIN";

// Appele au clic sur Bailleur / Locataire / Admin
export async function choisirTypeConnexion(type: TypeConnexion) {
  const cookieStore = await cookies();

  // Cookie temporaire 10 minutes - supprime apres signIn
  cookieStore.set("qapril_type", type, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    maxAge:   600, // 10 minutes
    path:     "/",
    sameSite: "lax"
  });

  // Pour les locataires et admins, rediriger directement vers la bonne page de login si elle existe
  if (type === "LOCATAIRE") {
      redirect("/locataire/login");
  } else if (type === "ADMIN") {
      redirect("/admin/login");
  } else {
      // Pour les bailleurs, rediriger vers la page generique 
      redirect("/dashboard/login");
  }
}
