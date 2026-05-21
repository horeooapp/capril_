/**
 * ============================================================
 *  QAPRIL — Script de Référencement SEO (TypeScript)
 *  Version : 1.0.0
 *  Domaine  : https://www.qapril.net
 * ============================================================
 */

export const QAPRIL_SEO_CONFIG = {
  site: {
    name:        "QAPRIL",
    domain:      "https://www.qapril.net",
    locale:      "fr_CI",
    localeAlt:   ["fr_FR", "fr_BF", "fr_SN"],
    themeColor:  "#FCB10F",
    twitterHandle: "@qapril_ci",
    fbAppId:     "",
    logo:        "https://www.qapril.net/logo.png",
    ogImage:     "https://www.qapril.net/images/og-main.png",
  },

  pages: {
    home: {
      title:       "QAPRIL — Gestion Immobilière Intelligente",
      description: "QAPRIL simplifie la gestion immobilière : locataires, propriétaires, agences et diaspora. Administration, suivi des loyers et contrats en un seul endroit.",
      keywords:    "gestion immobilière, logiciel immobilier, gestion locative, propriétaire, locataire, diaspora, agence immobilière, Côte d'Ivoire, Abidjan, CDC-CI",
      canonical:   "https://www.qapril.net/",
    },
    register: {
      title:       "Créer un compte QAPRIL — Démarrez gratuitement",
      description: "Créez votre compte QAPRIL et commencez à gérer vos propriétés immobilières dès aujourd'hui. Inscription rapide, sans engagement.",
      keywords:    "créer compte, inscription, gestion immobilière gratuite",
      canonical:   "https://www.qapril.net/register",
      noindex:     true,
    },
    login: {
      title:       "Connexion — QAPRIL",
      description: "Accédez à votre tableau de bord QAPRIL pour gérer vos biens immobiliers.",
      canonical:   "https://www.qapril.net/login",
      noindex:     true,
    },
    pricing: {
      title:       "Tarifs QAPRIL — Offres & Facturation",
      description: "Découvrez les offres QAPRIL adaptées à chaque profil : locataire, propriétaire, agence intermédiaire ou diaspora. Facturation par quittance générée.",
      keywords:    "tarifs, prix, abonnement, offre immobilière, quittance, diaspora",
      canonical:   "https://www.qapril.net/pricing",
    },
    features: {
      title:       "Fonctionnalités — QAPRIL Gestion Immobilière",
      description: "Gestion des loyers, contrats de bail, suivi des locataires, état des lieux digital et bien plus. Tout ce dont vous avez besoin.",
      keywords:    "fonctionnalités, loyer, bail, état des lieux, gestion locative",
      canonical:   "https://www.qapril.net/features",
    },
  },
};

export function qaprilInjectMeta(pageKey: string, sanitizedPathname: string = "/") {
  if (typeof document === 'undefined') return;

  const cfg = QAPRIL_SEO_CONFIG;
  const page = (cfg.pages as any)[pageKey] || cfg.pages.home;
  const site = cfg.site;

  const setMeta = (name: string, content: string, attr = "name") => {
    let el = document.querySelector(`meta[${attr}="${name}"]`);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  };

  const setLink = (rel: string, href: string) => {
    let el = document.querySelector(`link[rel="${rel}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", rel);
      document.head.appendChild(el);
    }
    el.setAttribute("href", href);
  };

  document.title = page.title;

  setMeta("description",      page.description);
  setMeta("keywords",         page.keywords || "");
  setMeta("robots",           page.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");
  setMeta("author",           "QAPRIL");
  setMeta("theme-color",      site.themeColor);
  setMeta("application-name", site.name);
  setMeta("generator",        "Antigravity");

  setLink("canonical", page.canonical);

  site.localeAlt.forEach(lang => {
    const code = lang.split("_")[1].toLowerCase();
    let el = document.querySelector(`link[hreflang="${code}"]`);
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "alternate");
      el.setAttribute("hreflang", code);
      document.head.appendChild(el);
    }
    el.setAttribute("href", `${site.domain}/${code}${sanitizedPathname}`);
  });

  setMeta("og:type",        pageKey === "home" ? "website" : "article", "property");
  setMeta("og:url",         page.canonical,                             "property");
  setMeta("og:title",       page.title,                                 "property");
  setMeta("og:description", page.description,                           "property");
  setMeta("og:image",       site.ogImage,                               "property");
  setMeta("og:site_name",   site.name,                                  "property");
  setMeta("og:locale",      site.locale,                                "property");

  setMeta("twitter:card",        "summary_large_image");
  setMeta("twitter:site",        site.twitterHandle);
  setMeta("twitter:title",       page.title);
  setMeta("twitter:description", page.description);
  setMeta("twitter:image",       site.ogImage);

  console.log(`[QAPRIL SEO] ✅ Meta injectés pour : "${pageKey}"`);
}

export function qaprilInjectSchema(pageKey: string) {
  if (typeof document === 'undefined') return;
  const site = QAPRIL_SEO_CONFIG.site;

  const schemas: any = {
    home: [
      {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${site.domain}/#organization`,
        name:  "QAPRIL",
        url:   site.domain,
        logo: {
          "@type": "ImageObject",
          url:    site.logo,
          width:  200,
          height: 60,
        },
        sameAs: [
          "https://www.linkedin.com/company/qapril",
          "https://twitter.com/qapril_ci",
        ],
        contactPoint: {
          "@type":             "ContactPoint",
          contactType:         "customer support",
          availableLanguage:   ["French"],
          areaServed:          ["CI", "SN", "BF", "ML", "CM"],
        },
      },
      {
        "@context": "https://schema.org",
        "@type":    "WebSite",
        "@id":      `${site.domain}/#website`,
        url:        site.domain,
        name:       "QAPRIL",
        description:"Plateforme de gestion immobilière intelligente",
        inLanguage: "fr",
      },
    ],
  };

  document.querySelectorAll('script[data-qapril-schema]').forEach(s => s.remove());

  const list = schemas[pageKey] || schemas.home;
  list.forEach((schema: any, i: number) => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-qapril-schema", i.toString());
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  });

  console.log(`[QAPRIL SEO] ✅ Schema.org injectés pour : "${pageKey}"`);
}

export function qaprilUpdateSEO(pathname: string) {
  const map: any = {
    "/":               "home",
    "/register":       "register",
    "/login":          "login",
    "/pricing":        "pricing",
    "/features":       "features",
  };
  const pageKey = map[pathname] || map[pathname.replace(/\/$/, "")] || "home";
  qaprilInjectMeta(pageKey, pathname);
  qaprilInjectSchema(pageKey);
}

export function qaprilSEOInit(options: { gtmId?: string, verbose?: boolean } = {}) {
  if (typeof window === 'undefined') return;
  
  // Normalisation du chemin pour éviter les doubles slashes (protection client-side)
  const safePathname = window.location.pathname.replace(/\/+/g, "/");
  qaprilUpdateSEO(safePathname);

  if (options.gtmId) {
    console.log(`[QAPRIL SEO] GTM initialization requested: ${options.gtmId}`);
    // GTM logic could be added here if needed
  }
}
