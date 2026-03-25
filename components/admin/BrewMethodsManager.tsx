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
import { createBrewMethodAction, updateBrewMethodAction, deleteBrewMethodAction } from '@/app/actions/admin'
import { categoryLabels } from '@/lib/types'
import type { BrewMethod, BrewMethodCategory } from '@/lib/types'

const CATEGORIES: BrewMethodCategory[] = ['filter', 'espresso', 'pressure', 'cold_brew']

// ─── Create Dialog ────────────────────────────────────────────────────────────

function CreateDialog() {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<BrewMethodCategory>('filter')
  const [state, action, isPending] = useActionState(createBrewMethodAction, undefined)
  const wasPending = useRef(false)

  useEffect(() => {
    if (isPending) {
      wasPending.current = true
    } else if (wasPending.current) {
      wasPending.current = false
      if (state === undefined) {
        setOpen(false)
        toast.success('Método de preparo criado.')
      }
    }
  }, [isPending, state])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Novo método
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo método de preparo</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-3 mt-2">
          <FieldGroup label="Nome" error={state?.errors?.name?.[0]}>
            <Input name="name" placeholder="ex: V60" autoFocus />
          </FieldGroup>
          <FieldGroup label="Categoria" error={state?.errors?.category?.[0]}>
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={(v) => setCategory(v as BrewMethodCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue>{categoryLabels[category]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Descrição (opcional)" error={state?.errors?.description?.[0]}>
            <Input name="description" placeholder="Breve descrição..." />
          </FieldGroup>
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

function EditDialog({ brewMethod }: { brewMethod: BrewMethod }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState<BrewMethodCategory>(brewMethod.category)
  const boundAction = updateBrewMethodAction.bind(null, brewMethod.id)
  const [state, action, isPending] = useActionState(boundAction, undefined)
  const wasPending = useRef(false)

  useEffect(() => {
    if (isPending) {
      wasPending.current = true
    } else if (wasPending.current) {
      wasPending.current = false
      if (state === undefined) {
        setOpen(false)
        toast.success('Método de preparo atualizado.')
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
          <DialogTitle>Editar método de preparo</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-3 mt-2">
          <FieldGroup label="Nome" error={state?.errors?.name?.[0]}>
            <Input name="name" defaultValue={brewMethod.name} autoFocus />
          </FieldGroup>
          <FieldGroup label="Categoria" error={state?.errors?.category?.[0]}>
            <input type="hidden" name="category" value={category} />
            <Select value={category} onValueChange={(v) => setCategory(v as BrewMethodCategory)}>
              <SelectTrigger className="w-full">
                <SelectValue>{categoryLabels[category]}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{categoryLabels[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldGroup>
          <FieldGroup label="Descrição (opcional)" error={state?.errors?.description?.[0]}>
            <Input name="description" defaultValue={brewMethod.description ?? ''} />
          </FieldGroup>
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
            await deleteBrewMethodAction(id)
            toast.success('Método excluído.')
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

// ─── Main Manager ─────────────────────────────────────────────────────────────

export function BrewMethodsManager({ initialBrewMethods }: { initialBrewMethods: BrewMethod[] }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <CreateDialog />
      </div>

      {initialBrewMethods.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Nenhum método cadastrado.</p>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Nome</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground">Categoria</th>
                <th className="text-left font-medium px-4 py-2.5 text-muted-foreground hidden sm:table-cell">Descrição</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialBrewMethods.map((bm) => (
                <tr key={bm.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-medium">{bm.name}</td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {categoryLabels[bm.category]}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground hidden sm:table-cell max-w-xs truncate">
                    {bm.description ?? <span className="italic">—</span>}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-end gap-1">
                      <EditDialog brewMethod={bm} />
                      <DeleteButton id={bm.id} name={bm.name} />
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
