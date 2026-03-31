import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/entrar',
          '/suspenso',
          '/auth/',
          '/receitas/nova',
          '/perfil/',
          '/admin/',
        ],
      },
    ],
    sitemap: 'https://cup-share.lucaseduardoschuster.com/sitemap.xml',
  }
}
