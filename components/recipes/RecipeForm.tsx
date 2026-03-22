'use client'

import { useState, useTransition, useCallback } from 'react'
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipes'
import type { BrewMethod, RecipeType, Ingredient, Equipment, Recipe } from '@/lib/types'

interface RecipeFormProps {
  brewMethods: BrewMethod[]
  recipeTypes: RecipeType[]
  ingredients: Ingredient[]
  equipment: Equipment[]
  recipe?: Recipe
}

interface StepField {
  id: string
  description: string
  duration_seconds: string
}

interface IngredientField {
  id: string
  ingredientId: string
  quantity: string
  unit: string
}

interface EquipmentField {
  id: string
  equipmentId: string
  grinder_clicks: string
}

export function RecipeForm({ brewMethods, recipeTypes, ingredients, equipment, recipe }: RecipeFormProps) {
  const isEditing = !!recipe
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string>()

  const [steps, setSteps] = useState<StepField[]>(
    recipe?.steps.map((s, i) => ({
      id: `step-${i}`,
      description: s.description,
      duration_seconds: s.duration_seconds?.toString() ?? '',
    })) ?? [{ id: 'step-0', description: '', duration_seconds: '' }]
  )

  const [recipeIngredients, setRecipeIngredients] = useState<IngredientField[]>(
    recipe?.ingredients.map((ing, i) => ({
      id: `ing-${i}`,
      ingredientId: ing.id.toString(),
      quantity: ing.pivot.quantity.toString(),
      unit: ing.pivot.unit,
    })) ?? []
  )

  const [recipeEquipment, setRecipeEquipment] = useState<EquipmentField[]>(
    recipe?.equipment.map((eq, i) => ({
      id: `eq-${i}`,
      equipmentId: eq.id.toString(),
      grinder_clicks: eq.pivot.grinder_clicks?.toString() ?? '',
    })) ?? []
  )

  const [useYield, setUseYield] = useState(recipe ? recipe.yield_ml != null : false)

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { id: `step-${Date.now()}`, description: '', duration_seconds: '' },
    ])
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }

  function updateStep(id: string, field: keyof Omit<StepField, 'id'>, value: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  function addIngredient() {
    setRecipeIngredients((prev) => [
      ...prev,
      { id: `ing-${Date.now()}`, ingredientId: '', quantity: '', unit: 'ml' },
    ])
  }

  function removeIngredient(id: string) {
    setRecipeIngredients((prev) => prev.filter((i) => i.id !== id))
  }

  function updateIngredient(
    id: string,
    field: keyof Omit<IngredientField, 'id'>,
    value: string
  ) {
    setRecipeIngredients((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    )
  }

  function addEquipment() {
    setRecipeEquipment((prev) => [
      ...prev,
      { id: `eq-${Date.now()}`, equipmentId: '', grinder_clicks: '' },
    ])
  }

  function removeEquipment(id: string) {
    setRecipeEquipment((prev) => prev.filter((e) => e.id !== id))
  }

  function updateEquipment(id: string, field: keyof Omit<EquipmentField, 'id'>, value: string) {
    setRecipeEquipment((prev) => prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)))
  }

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setErrors({})
      setGeneralError(undefined)

      const formData = new FormData(e.currentTarget)

      const stepsData = steps.map((s, idx) => ({
        order: idx + 1,
        description: s.description,
        duration_seconds: s.duration_seconds ? parseInt(s.duration_seconds) : null,
      }))

      const ingredientsData = recipeIngredients.map((i) => ({
        id: parseInt(i.ingredientId),
        quantity: parseFloat(i.quantity),
        unit: i.unit,
      }))

      const equipmentData = recipeEquipment.map((e) => ({
        id: parseInt(e.equipmentId),
        grinder_clicks: e.grinder_clicks ? parseInt(e.grinder_clicks) : null,
      }))

      formData.set('steps', JSON.stringify(stepsData))
      formData.set('ingredients', JSON.stringify(ingredientsData))
      formData.set('equipment', JSON.stringify(equipmentData))

      if (useYield) {
        formData.delete('water_ml')
      } else {
        formData.delete('yield_ml')
      }

      startTransition(async () => {
        const boundAction = isEditing
          ? updateRecipeAction.bind(null, recipe!.id)
          : createRecipeAction

        const result = await boundAction(undefined, formData)

        if (result?.errors) setErrors(result.errors)
        if (result?.error) setGeneralError(result.error)
      })
    },
    [steps, recipeIngredients, recipeEquipment, useYield, isEditing, recipe]
  )

  function fieldError(field: string) {
    return errors[field]?.[0]
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {generalError && (
        <p className="text-sm text-destructive rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
          {generalError}
        </p>
      )}

      {/* Basic info */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Informações básicas
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            defaultValue={recipe?.title}
            placeholder="V60 Leve de manhã"
            required
          />
          {fieldError('title') && <p className="text-xs text-destructive">{fieldError('title')}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Descrição <span className="text-muted-foreground">(opcional)</span></Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={recipe?.description ?? ''}
            placeholder="Uma breve descrição da receita..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Método de preparo</Label>
            <Select name="brew_method_id" defaultValue={recipe?.brew_method.id.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                {brewMethods.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('brew_method_id') && (
              <p className="text-xs text-destructive">{fieldError('brew_method_id')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de receita</Label>
            <Select name="recipe_type_id" defaultValue={recipe?.recipe_type.id.toString()}>
              <SelectTrigger>
                <SelectValue placeholder="Selecionar..." />
              </SelectTrigger>
              <SelectContent>
                {recipeTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id.toString()}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldError('recipe_type_id') && (
              <p className="text-xs text-destructive">{fieldError('recipe_type_id')}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Visibilidade</Label>
          <Select name="visibility" defaultValue={recipe?.visibility ?? 'public'}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Pública</SelectItem>
              <SelectItem value="private">Privada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Measurements */}
      <section className="space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Medidas
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="coffee_grams">Café (g)</Label>
            <Input
              id="coffee_grams"
              name="coffee_grams"
              type="number"
              step="0.1"
              min="0"
              defaultValue={recipe?.coffee_grams}
              placeholder="15"
              required
            />
            {fieldError('coffee_grams') && (
              <p className="text-xs text-destructive">{fieldError('coffee_grams')}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brew_time_seconds">Tempo (segundos)</Label>
            <Input
              id="brew_time_seconds"
              name="brew_time_seconds"
              type="number"
              min="1"
              defaultValue={recipe?.brew_time_seconds}
              placeholder="180"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label>Tipo de volume</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseYield(false)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  !useYield
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background'
                }`}
              >
                Água
              </button>
              <button
                type="button"
                onClick={() => setUseYield(true)}
                className={`flex-1 rounded-md border px-3 py-2 text-sm transition-colors ${
                  useYield
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-background'
                }`}
              >
                Extração
              </button>
            </div>
          </div>
        </div>

        {!useYield ? (
          <div className="space-y-1.5">
            <Label htmlFor="water_ml">Água (ml)</Label>
            <Input
              id="water_ml"
              name="water_ml"
              type="number"
              min="1"
              defaultValue={recipe?.water_ml ?? ''}
              placeholder="250"
            />
          </div>
        ) : (
          <div className="space-y-1.5">
            <Label htmlFor="yield_ml">Volume extraído (ml)</Label>
            <Input
              id="yield_ml"
              name="yield_ml"
              type="number"
              min="1"
              defaultValue={recipe?.yield_ml ?? ''}
              placeholder="36"
            />
          </div>
        )}
      </section>

      {/* Ingredients */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Ingredientes <span className="normal-case font-normal text-muted-foreground">(opcional)</span>
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
          </Button>
        </div>

        {recipeIngredients.map((ing, idx) => (
          <div key={ing.id} className="flex gap-2 items-start">
            <GripVertical className="h-4 w-4 mt-2.5 shrink-0 text-muted-foreground/50" />
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <Select
                  value={ing.ingredientId}
                  onValueChange={(v) => updateIngredient(ing.id, 'ingredientId', v ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ingrediente" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredients.map((i) => (
                      <SelectItem key={i.id} value={i.id.toString()}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="Qtd."
                value={ing.quantity}
                onChange={(e) => updateIngredient(ing.id, 'quantity', e.target.value)}
              />
              <Input
                placeholder="ml, g..."
                value={ing.unit}
                onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 mt-0.5 text-muted-foreground"
              onClick={() => removeIngredient(ing.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}

        {fieldError('ingredients') && (
          <p className="text-xs text-destructive">{fieldError('ingredients')}</p>
        )}
      </section>

      {/* Equipment */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Equipamentos <span className="normal-case font-normal text-muted-foreground">(opcional)</span>
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={addEquipment}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
          </Button>
        </div>

        {recipeEquipment.map((eq) => (
          <div key={eq.id} className="flex gap-2 items-start">
            <GripVertical className="h-4 w-4 mt-2.5 shrink-0 text-muted-foreground/50" />
            <div className="flex-1 grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <Select
                  value={eq.equipmentId}
                  onValueChange={(v) => updateEquipment(eq.id, 'equipmentId', v ?? '')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Equipamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((e) => (
                      <SelectItem key={e.id} value={e.id.toString()}>
                        {e.name}{e.brand ? ` · ${e.brand}` : ''}{e.model ? ` ${e.model}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min="1"
                placeholder="Cliques (moedor)"
                value={eq.grinder_clicks}
                onChange={(e) => updateEquipment(eq.id, 'grinder_clicks', e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 mt-0.5 text-muted-foreground"
              onClick={() => removeEquipment(eq.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </section>

      {/* Steps */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Passo a passo
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={addStep}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
          </Button>
        </div>

        {steps.map((step, idx) => (
          <div key={step.id} className="flex gap-2 items-start">
            <span className="flex h-6 w-6 shrink-0 mt-2 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs">
              {idx + 1}
            </span>
            <div className="flex-1 grid grid-cols-3 gap-2">
              <Input
                className="col-span-2"
                placeholder="Descrição do passo"
                value={step.description}
                onChange={(e) => updateStep(step.id, 'description', e.target.value)}
              />
              <Input
                type="number"
                min="0"
                placeholder="Duração (s)"
                value={step.duration_seconds}
                onChange={(e) => updateStep(step.id, 'duration_seconds', e.target.value)}
              />
            </div>
            {idx > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 mt-0.5 text-muted-foreground"
                onClick={() => removeStep(step.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        ))}

        {fieldError('steps') && (
          <p className="text-xs text-destructive">{fieldError('steps')}</p>
        )}
      </section>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Salvar alterações' : 'Publicar receita'}
        </Button>
      </div>
    </form>
  )
}
