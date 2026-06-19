import { supabaseAdmin } from '@/lib/supabase'

export async function getOrCreateSupabaseUserId(user) {
  if (!user.email) {
    return null
  }

  const { data: users, error: listError } =
    await supabaseAdmin.auth.admin.listUsers()

  if (listError) {
    throw listError
  }

  const existingUser = users.users.find(
    (supabaseUser) => supabaseUser.email === user.email
  )

  if (existingUser) {
    return existingUser.id
  }

  const { data, error: createError } =
    await supabaseAdmin.auth.admin.createUser({
      email: user.email,
      email_confirm: true,
      user_metadata: {
        name: user.name,
      },
    })

  if (createError) {
    throw createError
  }

  return data.user.id
}