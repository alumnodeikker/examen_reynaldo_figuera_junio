import { auth } from '@/auth'
import { getOrCreateSupabaseUserId } from '@/lib/supabase-auth-user'
import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'
import { redirect } from 'next/navigation'

function formatCurrency(amountInCents: number) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountInCents / 100)
}

export default async function MisPedidosPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  const userId = await getOrCreateSupabaseUserId(session.user)

  if (!userId) {
    redirect('/api/auth/signin')
  }

  const { data: pedidos, error } = await supabaseAdmin
    .from('pedidos')
    .select('id, estado, importe, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <section className="w-full max-w-md rounded-lg border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Error al cargar pedidos</h1>
          <p className="mt-2 text-sm text-gray-600">{error.message}</p>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Mis pedidos</h1>
          <Link className="text-sm font-medium text-blue-700" href="/">
            Volver al inicio
          </Link>
        </div>

        {pedidos.length === 0 ? (
          <div className="rounded-lg border border-gray-100 bg-white p-8 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">No tienes pedidos todavia</h2>
            <p className="mt-2 text-sm text-gray-500">
              Cuando completes una compra aparecera en esta lista.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => {
              const isCompleted = pedido.estado === 'completado'
              const statusClasses = isCompleted
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'

              return (
                <article
                  className="flex items-center justify-between gap-4 rounded-lg border border-gray-100 bg-white p-5 shadow-sm"
                  key={pedido.id}
                >
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(pedido.importe)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {new Date(pedido.created_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusClasses}`}>
                    {pedido.estado}
                  </span>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
