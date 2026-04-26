"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { qaprilSEOInit, qaprilUpdateSEO } from "@/lib/qapril-seo";

export default function SEOInit() {
  const pathname = usePathname();

  useEffect(() => {
    // Initialisation au montage
    qaprilSEOInit({ verbose: true });
  }, []);

  useEffect(() => {
    // Mise à jour lors du changement de route
    if (pathname) {
      qaprilUpdateSEO(pathname);
    }
  }, [pathname]);

  return null; // Composant invisible
}
