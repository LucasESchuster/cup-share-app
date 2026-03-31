import type { MetadataRoute } from 'next'
import { getRecipes } from '@/lib/api/recipes'

const BASE_URL = 'https://cup-share.lucaseduardoschuster.com'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]

  try {
    let page = 1
    let lastPage = 1

    do {
      const { data: recipes, meta } = await getRecipes({ page })
      if (meta) lastPage = meta.last_page

      for (const recipe of recipes) {
        entries.push({
          url: `${BASE_URL}/receitas/${recipe.id}`,
          lastModified: new Date(recipe.updated_at),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }

      page++
    } while (page <= lastPage)
  } catch {
    // if API unavailable, return just home page
  }

  return entries
}
