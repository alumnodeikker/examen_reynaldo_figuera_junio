import { auth } from '@/auth'
import stripe from '@/lib/stripe'
import { getOrCreateSupabaseUserId } from '@/lib/supabase-auth-user'
import {
  createSupabaseWithAccessToken,
  supabaseAdmin,
} from '@/lib/supabase'
import { NextResponse } from 'next/server'

const PRODUCT_NAME = 'Curso Premium'
const PRODUCT_DESCRIPTION = 'Acceso completo al curso premium'
const PRODUCT_AMOUNT = 2500

async function getAuthenticatedUserId(request) {
  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.startsWith('Bearer ')
    ? authHeader.slice('Bearer '.length)
    : null

  if (accessToken) {
    const supabase = createSupabaseWithAccessToken(accessToken)
    const { data, error } = await supabase.auth.getUser()

    if (!error && data.user?.id) {
      return data.user.id
    }
  }

  const session = await auth()

  if (!session?.user) {
    return null
  }

  return getOrCreateSupabaseUserId(session.user)
}

export async function POST(request) {
  try {
    const userId = await getAuthenticatedUserId(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Debes iniciar sesion primero' },
        { status: 401 }
      )
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL ?? new URL(request.url).origin
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: PRODUCT_NAME,
              description: PRODUCT_DESCRIPTION,
            },
            unit_amount: PRODUCT_AMOUNT,
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/pago/exito?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/`,
      metadata: {
        user_id: userId,
      },
    })

    const { error: insertError } = await supabaseAdmin.from('pedidos').insert({
      user_id: userId,
      stripe_session_id: checkoutSession.id,
      estado: 'pendiente',
      importe: PRODUCT_AMOUNT,
    })

    if (insertError) {
      console.error('Error al insertar pedido:', insertError)
      return NextResponse.json(
        {
          error: 'Error al registrar el pedido',
          detail:
            process.env.NODE_ENV === 'development'
              ? insertError.message
              : undefined,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error) {
    console.error('Error en checkout:', error)
    return NextResponse.json(
      { error: 'Error al procesar el pago' },
      { status: 500 }
    )
  }
}