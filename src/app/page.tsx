import Link from "next/link";
import { auth } from "@/auth";
import "../app/landing-v2.css"; // Injecting the new frontend scoped CSS
import QaprilLandingV2 from "@/components/landing-v2/QaprilLandingV2";

export const dynamic = "force-dynamic";

export default async function Home() {
  let session = null;

  try {
    session = await auth();
  } catch (error) {
    console.error("[HOME] Error during initial auth fetch:", error);
  }

  // Pure 100% Mockup Frontend Redesign for ALL users
  return (
    <>
      <QaprilLandingV2 session={session} />
    </>
  );
}

