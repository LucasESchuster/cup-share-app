import { z } from 'zod'

// ─── Reference types ─────────────────────────────────────────────────────────

export interface BrewMethod {
  id: number
  name: string
  slug: string
  description: string | null
}

export interface RecipeType {
  id: number
  name: string
  slug: string
}

export interface Ingredient {
  id: number
  name: string
  slug: string
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
  duration_seconds: number | null
}

export interface RecipeIngredient extends Ingredient {
  pivot: {
    quantity: number
    unit: string
  }
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
  likes_count: number
  brew_method: BrewMethod
  recipe_type: RecipeType
  user: User
  steps: RecipeStep[]
  ingredients: RecipeIngredient[]
  equipment: RecipeEquipment[]
  created_at: string
  updated_at: string
}

export interface LikesCount {
  likes_count: number
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
  duration_seconds: z.number().int().positive().nullable(),
})

export const RecipeIngredientSchema = z.object({
  id: z.number().int().positive(),
  quantity: z.number().positive('Quantidade deve ser positiva'),
  unit: z.string().min(1, 'Unidade obrigatória'),
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
    recipe_type_id: z.number().int().positive('Tipo de receita obrigatório'),
    coffee_grams: z.number().positive('Quantidade de café deve ser positiva'),
    water_ml: z.number().int().positive().nullable().optional(),
    yield_ml: z.number().int().positive().nullable().optional(),
    brew_time_seconds: z.number().int().positive('Tempo de preparo obrigatório'),
    visibility: z.enum(['public', 'private']),
    steps: z.array(RecipeStepSchema).min(1, 'Adicione pelo menos um passo'),
    ingredients: z.array(RecipeIngredientSchema).optional().default([]),
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
