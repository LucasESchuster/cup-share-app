'use client'

import { useActionState, useState } from 'react'
import { Plus, Trash2, Pencil, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  createEquipmentAction,
  updateEquipmentAction,
  deleteEquipmentAction,
} from '@/app/actions/equipment'
import type { Equipment } from '@/lib/types'

const EQUIPMENT_TYPES: Record<string, string> = {
  grinder: 'Moedor',
  espresso_machine: 'Máquina espresso',
  scale: 'Balança',
  dripper: 'Dripper',
  kettle: 'Chaleira',
  other: 'Outro',
}

function EquipmentForm({
  equipment,
  onClose,
}: {
  equipment?: Equipment
  onClose: () => void
}) {
  const isEditing = !!equipment
  const boundAction = isEditing
    ? updateEquipmentAction.bind(null, equipment!.id)
    : createEquipmentAction

  const [state, formAction, pending] = useActionState(boundAction, undefined)

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eq-name">Nome</Label>
        <Input id="eq-name" name="name" defaultValue={equipment?.name} required />
        {state?.errors?.name && <p className="text-xs text-destructive">{state.errors.name[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="eq-brand">Marca</Label>
          <Input id="eq-brand" name="brand" defaultValue={equipment?.brand ?? ''} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="eq-model">Modelo</Label>
          <Input id="eq-model" name="model" defaultValue={equipment?.model ?? ''} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Tipo</Label>
        <Select name="type" defaultValue={equipment?.type ?? 'other'}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(EQUIPMENT_TYPES).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={pending}>
          {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Salvar' : 'Adicionar'}
        </Button>
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function EquipmentList({ equipment }: { equipment: Equipment[] }) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)

  const personalEquipment = equipment.filter((eq) => !eq.is_global)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Meus equipamentos</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={<Button size="sm" variant="outline" />}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Adicionar
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo equipamento</DialogTitle>
            </DialogHeader>
            <EquipmentForm onClose={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {personalEquipment.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Você ainda não adicionou equipamentos.
        </p>
      ) : (
        <ul className="space-y-2">
          {personalEquipment.map((eq) => (
            <li
              key={eq.id}
              className="flex items-center justify-between rounded-md border border-border/60 bg-card px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-medium">{eq.name}</p>
                {(eq.brand || eq.model) && (
                  <p className="text-xs text-muted-foreground">
                    {[eq.brand, eq.model].filter(Boolean).join(' ')}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{EQUIPMENT_TYPES[eq.type]}</p>
              </div>

              <div className="flex gap-1">
                <Dialog
                  open={editingId === eq.id}
                  onOpenChange={(open) => setEditingId(open ? eq.id : null)}
                >
                  <DialogTrigger
                    render={<Button variant="ghost" size="icon" className="h-8 w-8" />}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Editar equipamento</DialogTitle>
                    </DialogHeader>
                    <EquipmentForm
                      equipment={eq}
                      onClose={() => setEditingId(null)}
                    />
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      />
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover equipamento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => deleteEquipmentAction(eq.id)}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
