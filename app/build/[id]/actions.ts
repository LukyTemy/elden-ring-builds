'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(buildId: string) {
  const supabase = await createClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Pro lajkování musíš být přihlášen.')
  }

  const userId = user.id

  const { data: existingLike, error: fetchError } = await supabase
    .from('likes')
    .select('id')
    .eq('build_id', buildId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)

    if (deleteError) throw new Error('Chyba při odebírání lajku.')
  } else {
    const { error: insertError } = await supabase
      .from('likes')
      .insert([{ build_id: buildId, user_id: userId }])

    if (insertError) throw new Error('Chyba při přidávání lajku.')
  }

  revalidatePath('/builds')
  revalidatePath(`/build/${buildId}`)
  revalidatePath('/saved')

  return { success: true, isLiked: !existingLike }
}