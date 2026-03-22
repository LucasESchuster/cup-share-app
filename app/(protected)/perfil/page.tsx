import Link from 'next/link'
import { getMe, getMyRecipes, getMyEquipment } from '@/lib/api/users'
import { EquipmentList } from '@/components/equipment/EquipmentList'
import { ProfileForm } from '@/components/auth/ProfileForm'
import { RecipeCard } from '@/components/recipes/RecipeCard'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { LinkButton } from '@/components/ui/link-button'
import { Plus } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Meu perfil' }

export default async function PerfilPage() {
  const [user, recipes, equipment] = await Promise.all([
    getMe(),
    getMyRecipes(),
    getMyEquipment(),
  ])

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Meu perfil</h1>
        <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
      </div>

      <Tabs defaultValue="receitas">
        <TabsList className="mb-6">
          <TabsTrigger value="receitas">Receitas ({recipes.length})</TabsTrigger>
          <TabsTrigger value="equipamentos">Equipamentos</TabsTrigger>
          <TabsTrigger value="conta">Conta</TabsTrigger>
        </TabsList>

        <TabsContent value="receitas" className="space-y-4">
          <div className="flex justify-end">
            <LinkButton href="/receitas/nova" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Nova receita
            </LinkButton>
          </div>

          {recipes.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>Você ainda não publicou nenhuma receita.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {recipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="equipamentos">
          <EquipmentList equipment={equipment} />
        </TabsContent>

        <TabsContent value="conta" className="space-y-6">
          <ProfileForm user={user} />

          <Separator />

          <div>
            <h3 className="font-semibold text-destructive mb-1">Zona de perigo</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Excluir sua conta é permanente e não pode ser desfeito.
            </p>
            <DeleteAccountButton />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DeleteAccountButton() {
  return (
    <form
      action={async () => {
        'use server'
        const { deleteAccountAction } = await import('@/app/actions/user')
        await deleteAccountAction()
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        Excluir minha conta
      </Button>
    </form>
  )
}
