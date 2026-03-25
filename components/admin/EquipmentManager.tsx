'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createEquipmentAction, updateEquipmentAction, deleteEquipmentAction } from '@/app/actions/admin'
import type { Equipment, EquipmentType } from '@/lib/types'

const EQUIPMENT_TYPE_LABELS: Record<EquipmentType, string> = {
  grinder: 'Moedor',
  espresso_machine: 'Máquina espresso',
  scale: 'Balança',
  dripper: 'Coador',
  kettle: 'Chaleira',
  other: 'Outro',
}

const EQUIPMENT_TYPES: EquipmentType[] = ['grinder', 'espresso_machine', 'scale', 'dripper', 'kettle', 'other']

// ─── Field Group helper ───────────────────────────────────────────────────────

function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}

// ─── Equipment Form Fields ────────────────────────────────────────────────────

function EquipmentFormFields({
  defaultValues,
  type,
  setType,
  errors,
}: {
  defaultValues?: Partial<Equipment>
  type: EquipmentType
  setType: (t: EquipmentType) => void
  errors?: Record<string, string[]>
}) {
  return (
    <>
      <FieldGroup label="Nome" error={errors?.name?.[0]}>
        <Input name="name" defaultValue={defaultValues?.name ?? ''} autoFocus />
      </FieldGroup>
      <FieldGroup label="Tipo" error={errors?.type?.[0]}>
        <input type="hidden" name="type" value={type} />
        <Select value={type} onValueChange={(v) => setType(v as EquipmentType)}>
          <SelectTrigger className="w-full">
            <SelectValue>{EQUIPMENT_TYPE_LABELS[type]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EQUIPMENT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{EQUIPMENT_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>
      <FieldGroup label="Marca (opcional)" error={errors?.brand?.[0]}>
        <Input name="brand" defaultValue={defaultValues?.brand ?? ''} />
      </FieldGroup>
      <FieldGroup label="Modelo (opcional)" error={errors?.model?.[0]}>
        <Input name="model" defaultValue={defaultValues?.model ?? ''} />
      </FieldGroup>
    </>
  )
}

// ─── Create Dialog ────────────────────────────────────────────────────────────

function CreateDialog() {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<EquipmentType>('grinder')
  const [state, action, isPending] = useActionState(createEquipmentAction, undefined)
  const wasPending = useRef(false)

  useEffect(() => {
    if (isPending) {
      wasPending.current = true
    } else if (wasPending.current) {
      wasPending.current = false
      if (state === undefined) {
        setOpen(false)
        toast.success('Equipamento criado.')
      }
    }
  }, [isPending, state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Novo equipamento
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo equipamento</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-3 mt-2">
          <EquipmentFormFields type={type} setType={setType} errors={state?.errors} />
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

function EditDialog({ equipment }: { equipment: Equipment }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<EquipmentType>(equipment.type)
  const boundAction = updateEquipmentAction.bind(null, equipment.id)
  const [state, action, isPending] = useActionState(boundAction, undefined)
  const wasPending = useRef(false)

  useEffect(() => {
    if (isPending) {
      wasPending.current = true
    } else if (wasPending.current) {
      wasPending.current = false
      if (state === undefined) {
        setOpen(false)
        toast.success('Equipamento atualizado.')
      }
    }
  }, [isPending, state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon-sm" onClick={() => setOpen(true)}>
        <Pencil className="h-3.5 w-3.5" />
        <span className="sr-only">Editar</span>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar equipamento</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-3 mt-2">
          <EquipmentFormFields defaultValues={equipment} type={type} setType={setType} errors={state?.errors} />
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Delete Button ────────────────────────────────────────────────────────────

function DeleteButton({ id, name }: { id: number; name: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    toast(`Excluir "${name}"?`, {
      description: 'Esta ação não pode ser desfeita.',
      action: {
        label: 'Excluir',
        onClick: () =>
          startTransition(async () => {
            await deleteEquipmentAction(id)
            toast.success('Equipamento excluído.')
          }),
      },
      cancel: { label: 'Cancelar', onClick: () => {} },
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="text-muted-foreground hover:text-destructive"
      onClick={handleDelete}
      disabled={isPending}
    >
      <Trash2 className="h-3.5 w-3.5" />
      <span className="sr-only">Excluir</span>
    </Button>
  )
}

// ─── Main Manager ─────────────────────────────────────────────────────────────

export function EquipmentManager({ initialEquipment }: { initialEquipment: Equipment[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateDialog />
      </div>

      {initialEquipment.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum equipamento cadastrado.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Nome</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Tipo</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground hidden md:table-cell">Marca / Modelo</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialEquipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{eq.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {EQUIPMENT_TYPE_LABELS[eq.type]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden md:table-cell">
                    {[eq.brand, eq.model].filter(Boolean).join(' · ') || <span className="italic">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <EditDialog equipment={eq} />
                      <DeleteButton id={eq.id} name={eq.name} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
