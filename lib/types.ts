import { z } from 'zod'

// ─── Reference types ─────────────────────────────────────────────────────────

export type BrewMethodCategory = 'filter' | 'espresso' | 'pressure' | 'cold_brew'

export const categoryLabels: Record<BrewMethodCategory, string> = {
  filter: 'Filtrado',
  espresso: 'Espresso',
  pressure: 'Pressão',
  cold_brew: 'Cold Brew',
}

export interface BrewMethod {
  id: number
  name: string
  slug: string
  category: BrewMethodCategory
  description: string | null
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
}

// ─── Equipment ────────────────────────────────────────────────────────────────

export type EquipmentType = 'grinder' | 'espresso_machine' | 'scale' | 'dripper' | 'kettle' | 'other'

export interface Equipment {
  id: number
  name: string
  brand: string | null
  model: string | null
  type: EquipmentType
  is_global: boolean
}

export interface RecipeEquipment extends Equipment {
  pivot: {
    grinder_clicks: number | null
    parameters: Record<string, unknown> | null
  }
}

// ─── Recipe ───────────────────────────────────────────────────────────────────

export interface RecipeStep {
  order: number
  description: string
}

export type RecipeVisibility = 'public' | 'private'

export interface Recipe {
  id: number
  title: string
  slug: string
  description: string | null
  visibility: RecipeVisibility
  coffee_grams: string
  water_ml: number | null
  yield_ml: number | null
  ratio: string
  brew_time_seconds: number
  water_temperature_celsius: number | null
  coffee_description: string | null
  likes_count: number
  liked_by_me: boolean
  video_url: string | null
  brew_method: BrewMethod
  user: User
  steps: RecipeStep[]
  equipment: RecipeEquipment[]
  created_at: string
  updated_at: string
}

export interface LikesCount {
  likes_count: number
  liked_by_me: boolean
}

// ─── Paginated response (Laravel) ────────────────────────────────────────────

export interface Paginated<T> {
  data: T[]
  links?: Record<string, string | null>
  meta?: Record<string, unknown>
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiValidationError {
  message: string
  errors: Record<string, string[]>
}

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const RecipeStepSchema = z.object({
  order: z.number().int().positive(),
  description: z.string().min(1, 'Descrição obrigatória'),
})

export const RecipeEquipmentSchema = z.object({
  id: z.number().int().positive(),
  grinder_clicks: z.number().int().positive().nullable().optional(),
})

export const RecipeFormSchema = z
  .object({
    title: z.string().min(1, 'Título obrigatório').max(255),
    description: z.string().nullable().optional(),
    brew_method_id: z.number().int().positive('Método de preparo obrigatório'),
    coffee_grams: z.number().positive('Quantidade de café deve ser positiva'),
    water_ml: z.number().int().positive().nullable().optional(),
    yield_ml: z.number().int().positive().nullable().optional(),
    brew_time_seconds: z.number().int().positive('Tempo de preparo obrigatório'),
    water_temperature_celsius: z.number().int().min(0).max(100).nullable().optional(),
    coffee_description: z.string().max(1000).nullable().optional(),
    visibility: z.enum(['public', 'private']),
    video_url: z.union([z.string().url('URL de vídeo inválida'), z.literal(''), z.null()]).optional(),
    steps: z.array(RecipeStepSchema).min(1, 'Adicione pelo menos um passo'),
    equipment: z.array(RecipeEquipmentSchema).optional().default([]),
  })
  .refine(
    (data) => {
      const hasWater = data.water_ml != null
      const hasYield = data.yield_ml != null
      return hasWater !== hasYield
    },
    { message: 'Informe water_ml OU yield_ml — nunca os dois, nunca nenhum' }
  )

export type RecipeFormValues = z.infer<typeof RecipeFormSchema>

export const EquipmentFormSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório').max(255),
  brand: z.string().nullable().optional(),
  model: z.string().nullable().optional(),
  type: z.enum(['grinder', 'espresso_machine', 'scale', 'dripper', 'kettle', 'other']),
})

export type EquipmentFormValues = z.infer<typeof EquipmentFormSchema>
