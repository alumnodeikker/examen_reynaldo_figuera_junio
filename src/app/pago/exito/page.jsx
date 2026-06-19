import { supabaseAdmin } from '@/lib/supabase'
import Link from 'next/link'

function formatCurrency(amountInCents) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountInCents / 100)
}

export default async function ExitoPage({ searchParams }) {
  const { session_id: sessionId } = await searchParams

  if (!sessionId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <section className="w-full max-w-md rounded-lg border border-red-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900">Pago no localizado</h1>
          <p className="mt-2 text-sm text-gray-600">
            No se recibio el identificador de la sesion de pago.
          </p>
          <Link className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white" href="/">
            Volver al inicio
          </Link>
        </section>
      </main>
    )
  }

  const { data: pedido } = await supabaseAdmin
    .from('pedidos')
    .select('estado, importe, created_at, stripe_session_id')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (!pedido) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-yellow-50 p-6">
        <section className="w-full max-w-md rounded-lg border border-yellow-100 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-yellow-700">
            Procesando tu pago...
          </p>
          <h1 className="mt-3 text-2xl font-bold text-gray-900">Estamos confirmando el pedido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Cuando Stripe confirme el pago, el webhook actualizara el estado del pedido.
          </p>
        </section>
      </main>
    )
  }

  const isCompleted = pedido.estado === 'completado'
  const statusClasses = isCompleted
    ? 'bg-green-100 text-green-700'
    : 'bg-yellow-100 text-yellow-700'

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <section className="w-full max-w-md rounded-lg border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
          Estado del pedido
        </p>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          {isCompleted ? 'Pago completado' : 'Procesando tu pago...'}
        </h1>
        <dl className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Estado</dt>
            <dd className={`rounded-full px-3 py-1 font-medium ${statusClasses}`}>
              {pedido.estado}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Importe</dt>
            <dd className="font-semibold text-gray-900">{formatCurrency(pedido.importe)}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-gray-500">Fecha</dt>
            <dd className="text-right text-gray-700">
              {new Date(pedido.created_at).toLocaleString('es-ES')}
            </dd>
          </div>
        </dl>
        <Link className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white" href="/mis-pedidos">
          Ver mis pedidos
        </Link>
      </section>
    </main>
  )
}