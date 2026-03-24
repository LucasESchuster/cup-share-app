'use client'

import { useState, useTransition, useCallback, useEffect } from 'react'
import { Plus, Trash2, Loader2, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
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
import { Combobox } from '@/components/ui/combobox'
import { createRecipeAction, updateRecipeAction } from '@/app/actions/recipes'
import type { BrewMethod, Equipment, Recipe } from '@/lib/types'

const DRAFT_KEY = 'cup-share:recipe-draft'

interface RecipeFormProps {
  brewMethods: BrewMethod[]
  equipment: Equipment[]
  recipe?: Recipe
}

interface StepField {
  id: string
  description: string
}

interface EquipmentField {
  id: string
  mode: 'list' | 'custom'
  equipmentId: string
  customName: string
  customIsGrinder: boolean
  grinder_clicks: string
}

interface RecipeDraft {
  title: string
  description: string
  brewMethodId: string
  visibility: 'public' | 'private'
  coffeeGrams: string
  brewTimeSeconds: string
  waterMl: string
  yieldMl: string
  useYield: boolean
  videoUrl: string
  waterTemperatureCelsius: string
  coffeeDescription: string
  steps: StepField[]
  recipeEquipment: EquipmentField[]
}

export function RecipeForm({ brewMethods, equipment, recipe }: RecipeFormProps) {
  const isEditing = !!recipe
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string>()

  // Basic fields — controlled for draft persistence
  const [title, setTitle] = useState(recipe?.title ?? '')
  const [description, setDescription] = useState(recipe?.description ?? '')
  const [coffeeGrams, setCoffeeGrams] = useState(recipe?.coffee_grams?.toString() ?? '')
  const [brewTimeSeconds, setBrewTimeSeconds] = useState(recipe?.brew_time_seconds?.toString() ?? '')
  const [waterMl, setWaterMl] = useState(recipe?.water_ml?.toString() ?? '')
  const [yieldMl, setYieldMl] = useState(recipe?.yield_ml?.toString() ?? '')

  const [brewMethodId, setBrewMethodId] = useState(recipe?.brew_method.id.toString() ?? '')
  const [visibility, setVisibility] = useState(recipe?.visibility ?? 'public')

  const [dragIndex, setDragIndex]       = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const [steps, setSteps] = useState<StepField[]>(
    recipe?.steps.map((s, i) => ({
      id: `step-${i}`,
      description: s.description,
    })) ?? [{ id: 'step-0', description: '' }]
  )

  const [recipeEquipment, setRecipeEquipment] = useState<EquipmentField[]>(
    recipe?.equipment.map((eq, i) => ({
      id: `eq-${i}`,
      mode: eq.equipment !== null ? 'list' : 'custom',
      equipmentId: eq.equipment?.id.toString() ?? '',
      customName: eq.custom_name ?? '',
      customIsGrinder: eq.equipment === null && eq.grinder_clicks !== null,
      grinder_clicks: eq.grinder_clicks?.toString() ?? '',
    })) ?? []
  )

  const [videoUrl, setVideoUrl] = useState(recipe?.video_url ?? '')
  const [waterTemperatureCelsius, setWaterTemperatureCelsius] = useState(
    recipe?.water_temperature_celsius?.toString() ?? ''
  )
  const [coffeeDescription, setCoffeeDescription] = useState(recipe?.coffee_description ?? '')

  const [useYield, setUseYield] = useState(recipe ? recipe.yield_ml != null : false)
  // Prevents auto-save from overwriting the draft before the user resolves the restore toast
  const [draftResolved, setDraftResolved] = useState(isEditing)

  // Check for saved draft on mount (create mode only)
  useEffect(() => {
    if (isEditing) return
    try {
      const raw = localStorage.getItem(DRAFT_KEY)
      if (!raw) { setDraftResolved(true); return }
      const draft: RecipeDraft = JSON.parse(raw)
      const hasMeaningful = draft.title.trim() || draft.steps.some((s) => s.description.trim())
      if (!hasMeaningful) { setDraftResolved(true); return }
      toast.warning('Você tem um rascunho salvo', {
        id: 'recipe-draft',
        description: draft.title ? `"${draft.title}"` : 'Deseja continuar de onde parou?',
        duration: Infinity,
        action: {
          label: 'Restaurar',
          onClick: () => {
            setTitle(draft.title)
            setDescription(draft.description)
            setBrewMethodId(draft.brewMethodId)
            setVisibility(draft.visibility)
            setCoffeeGrams(draft.coffeeGrams)
            setBrewTimeSeconds(draft.brewTimeSeconds)
            setWaterMl(draft.waterMl)
            setYieldMl(draft.yieldMl)
            setUseYield(draft.useYield)
            setVideoUrl(draft.videoUrl ?? '')
            setWaterTemperatureCelsius(draft.waterTemperatureCelsius ?? '')
            setCoffeeDescription(draft.coffeeDescription ?? '')
            setSteps(draft.steps)
            setRecipeEquipment(draft.recipeEquipment)
            setDraftResolved(true)
          },
        },
        cancel: {
          label: 'Descartar',
          onClick: () => {
            localStorage.removeItem(DRAFT_KEY)
            setDraftResolved(true)
          },
        },
        onDismiss: () => setDraftResolved(true),
      })
    } catch {
      localStorage.removeItem(DRAFT_KEY)
      setDraftResolved(true)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft with debounce (create mode only, after draft is resolved)
  useEffect(() => {
    if (isEditing || !draftResolved) return
    const timer = setTimeout(() => {
      const draft: RecipeDraft = {
        title, description, brewMethodId, visibility,
        coffeeGrams, brewTimeSeconds, waterMl, yieldMl, useYield, videoUrl,
        waterTemperatureCelsius, coffeeDescription,
        steps, recipeEquipment,
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }, 800)
    return () => clearTimeout(timer)
  }, [
    title, description, brewMethodId, visibility,
    coffeeGrams, brewTimeSeconds, waterMl, yieldMl, useYield, videoUrl,
    waterTemperatureCelsius, coffeeDescription,
    steps, recipeEquipment, isEditing, draftResolved,
  ])

  function handleStepDragStart(e: React.DragEvent, i: number) {
    setDragIndex(i)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleStepDragOver(e: React.DragEvent, i: number) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragOverIndex !== i) setDragOverIndex(i)
  }

  function handleStepDrop(e: React.DragEvent, i: number) {
    e.preventDefault()
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    setSteps((prev) => {
      const next = [...prev]
      const [removed] = next.splice(dragIndex, 1)
      next.splice(i, 0, removed)
      return next
    })
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function handleStepDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function addStep() {
    setSteps((prev) => [
      ...prev,
      { id: `step-${Date.now()}`, description: '' },
    ])
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id))
  }

  function updateStep(id: string, field: keyof Omit<StepField, 'id'>, value: string) {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)))
  }

  function addEquipment() {
    setRecipeEquipment((prev) => [
      ...prev,
      { id: `eq-${Date.now()}`, mode: 'list', equipmentId: '', customName: '', customIsGrinder: false, grinder_clicks: '' },
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
      }))

      const equipmentData = recipeEquipment.map((e) => {
        const clicks = e.grinder_clicks ? parseInt(e.grinder_clicks) : null
        if (e.mode === 'list') {
          return { equipment_id: parseInt(e.equipmentId), grinder_clicks: clicks }
        }
        return { custom_name: e.customName, grinder_clicks: clicks }
      })

      formData.set('steps', JSON.stringify(stepsData))
      formData.set('equipment', JSON.stringify(equipmentData))

      if (useYield) {
        formData.delete('water_ml')
      } else {
        formData.delete('yield_ml')
      }

      startTransition(async () => {
        localStorage.removeItem(DRAFT_KEY)

        const boundAction = isEditing
          ? updateRecipeAction.bind(null, recipe!.id)
          : createRecipeAction

        const result = await boundAction(undefined, formData)

        if (result?.errors) setErrors(result.errors)
        if (result?.error) setGeneralError(result.error)
      })
    },
    [steps, recipeEquipment, useYield, isEditing, recipe]
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
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Informações básicas
        </h2>

        <div className="space-y-1.5">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Uma breve descrição da receita..."
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="coffee_description">
            Descrição do café <span className="text-muted-foreground">(opcional)</span>
          </Label>
          <Textarea
            id="coffee_description"
            name="coffee_description"
            value={coffeeDescription}
            onChange={(e) => setCoffeeDescription(e.target.value)}
            placeholder="Something darker roasted. An espresso blend would be great."
            rows={2}
            maxLength={1000}
          />
          {fieldError('coffee_description') && (
            <p className="text-xs text-destructive">{fieldError('coffee_description')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Método de preparo</Label>
          <Combobox
            name="brew_method_id"
            value={brewMethodId}
            onValueChange={setBrewMethodId}
            options={brewMethods.map((m) => ({ value: m.id.toString(), label: m.name }))}
            placeholder="Selecionar método..."
            searchPlaceholder="Buscar método..."
          />
          {fieldError('brew_method_id') && (
            <p className="text-xs text-destructive">{fieldError('brew_method_id')}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Visibilidade</Label>
          <Select name="visibility" value={visibility} onValueChange={(v) => v && setVisibility(v as 'public' | 'private')}>
            <SelectTrigger className="w-full">
              <SelectValue>
                {visibility === 'public' ? 'Pública' : 'Privada'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="public">Pública</SelectItem>
              <SelectItem value="private">Privada</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Measurements */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
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
              value={coffeeGrams}
              onChange={(e) => setCoffeeGrams(e.target.value)}
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
              value={brewTimeSeconds}
              onChange={(e) => setBrewTimeSeconds(e.target.value)}
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!useYield ? (
            <div className="space-y-1.5">
              <Label htmlFor="water_ml">Água (ml)</Label>
              <Input
                id="water_ml"
                name="water_ml"
                type="number"
                min="1"
                value={waterMl}
                onChange={(e) => setWaterMl(e.target.value)}
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
                value={yieldMl}
                onChange={(e) => setYieldMl(e.target.value)}
                placeholder="36"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="water_temperature_celsius">
              Temperatura da água (°C) <span className="text-muted-foreground">(opcional)</span>
            </Label>
            <Input
              id="water_temperature_celsius"
              name="water_temperature_celsius"
              type="number"
              min="0"
              max="100"
              value={waterTemperatureCelsius}
              onChange={(e) => setWaterTemperatureCelsius(e.target.value)}
              placeholder="93"
            />
            {fieldError('water_temperature_celsius') && (
              <p className="text-xs text-destructive">{fieldError('water_temperature_celsius')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Equipment */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Equipamentos <span className="normal-case font-normal text-muted-foreground">(opcional)</span>
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={addEquipment}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
          </Button>
        </div>

        {recipeEquipment.map((eq) => {
          const selectedEquip = equipment.find((e) => e.id.toString() === eq.equipmentId)
          const isGrinder = eq.mode === 'list' ? selectedEquip?.type === 'grinder' : eq.customIsGrinder
          const displayLabel = selectedEquip
            ? [selectedEquip.name, selectedEquip.brand, selectedEquip.model].filter(Boolean).join(' · ')
            : null

          return (
            <div key={eq.id} className="flex gap-2 items-start">
              <GripVertical className="h-4 w-4 mt-2.5 shrink-0 text-muted-foreground/50" />
              <div className="flex-1 space-y-2">
                {/* Mode toggle */}
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => updateEquipment(eq.id, 'mode', 'list')}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${eq.mode === 'list' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}
                  >
                    Lista global
                  </button>
                  <button
                    type="button"
                    onClick={() => updateEquipment(eq.id, 'mode', 'custom')}
                    className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${eq.mode === 'custom' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background'}`}
                  >
                    Personalizado
                  </button>
                </div>

                <div className="flex gap-2">
                  {eq.mode === 'list' ? (
                    <Combobox
                      className="flex-1 min-w-0"
                      value={eq.equipmentId}
                      onValueChange={(v) => {
                        const newEquip = equipment.find((e) => e.id.toString() === v)
                        setRecipeEquipment((prev) =>
                          prev.map((e) =>
                            e.id === eq.id
                              ? { ...e, equipmentId: v ?? '', grinder_clicks: newEquip?.type !== 'grinder' ? '' : e.grinder_clicks }
                              : e
                          )
                        )
                      }}
                      options={equipment.map((e) => ({
                        value: e.id.toString(),
                        label: [e.name, e.brand, e.model].filter(Boolean).join(' · '),
                      }))}
                      placeholder="Selecionar equipamento..."
                      searchPlaceholder="Buscar equipamento..."
                    />
                  ) : (
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Nome do equipamento"
                        value={eq.customName}
                        onChange={(e) => updateEquipment(eq.id, 'customName', e.target.value)}
                      />
                      <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none w-fit">
                        <input
                          type="checkbox"
                          checked={eq.customIsGrinder}
                          onChange={(e) => {
                            setRecipeEquipment((prev) =>
                              prev.map((item) =>
                                item.id === eq.id
                                  ? { ...item, customIsGrinder: e.target.checked, grinder_clicks: e.target.checked ? item.grinder_clicks : '' }
                                  : item
                              )
                            )
                          }}
                          className="h-4 w-4 rounded border-input accent-primary cursor-pointer"
                        />
                        Moedor
                      </label>
                    </div>
                  )}
                  {isGrinder && (
                    <Input
                      type="number"
                      min="1"
                      placeholder="Cliques"
                      value={eq.grinder_clicks}
                      onChange={(e) => updateEquipment(eq.id, 'grinder_clicks', e.target.value)}
                      className="w-28 shrink-0"
                    />
                  )}
                </div>
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
          )
        })}
      </section>

      {/* Video */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
          Vídeo <span className="normal-case font-normal text-muted-foreground">(opcional)</span>
        </h2>
        <div className="space-y-1.5">
          <Label htmlFor="video_url">URL do YouTube</Label>
          <Input
            id="video_url"
            name="video_url"
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
          />
          {fieldError('video_url') && (
            <p className="text-xs text-destructive">{fieldError('video_url')}</p>
          )}
        </div>
      </section>

      {/* Steps */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
            Passo a passo
          </h2>
          <Button type="button" variant="ghost" size="sm" onClick={addStep}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
          </Button>
        </div>

        {steps.map((step, idx) => (
          <div
            key={step.id}
            draggable
            onDragStart={(e) => handleStepDragStart(e, idx)}
            onDragOver={(e) => handleStepDragOver(e, idx)}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(e) => handleStepDrop(e, idx)}
            onDragEnd={handleStepDragEnd}
            className={cn(
              'flex gap-2 items-start rounded-lg transition-all duration-150',
              dragIndex === idx && 'opacity-30',
              dragOverIndex === idx && dragIndex !== idx && 'ring-2 ring-amber/50 ring-offset-2'
            )}
          >
            <GripVertical className="h-4 w-4 mt-2.5 shrink-0 text-muted-foreground/40 cursor-grab active:cursor-grabbing" />
            <span className="flex h-6 w-6 shrink-0 mt-2 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs select-none">
              {idx + 1}
            </span>
            <Input
              className="flex-1"
              placeholder="Descrição do passo"
              value={step.description}
              onChange={(e) => updateStep(step.id, 'description', e.target.value)}
            />
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

      {Object.keys(errors).length > 0 && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 space-y-1">
          <p className="text-sm font-medium text-destructive">Ops, parece que temos alguns problemas:</p>
          <ul className="list-disc list-inside space-y-0.5">
            {Object.entries(errors).map(([, messages]) =>
              messages.map((msg, i) => (
                <li key={`${msg}-${i}`} className="text-xs text-destructive">{msg}</li>
              ))
            )}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isPending} className="flex-1 sm:flex-none">
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Salvar alterações' : 'Publicar receita'}
        </Button>
      </div>
    </form>
  )
}
