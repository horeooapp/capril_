import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/', '/mon-espace-locataire/'],
    },
    sitemap: 'https://www.qapril.ci/sitemap.xml',
  }
}
