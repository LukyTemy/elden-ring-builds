'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(buildId: string) {
  const supabase = await createClient()

  // 1. Získání aktuálního uživatele
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('Pro lajkování musíš být přihlášen.')
  }

  const userId = user.id

  // 2. Kontrola, zda lajk už existuje
  const { data: existingLike, error: fetchError } = await supabase
    .from('likes')
    .select('id')
    .eq('build_id', buildId)
    .eq('user_id', userId)
    .single()

  if (existingLike) {
    // 3. Pokud existuje, smažeme ho (Unlike)
    const { error: deleteError } = await supabase
      .from('likes')
      .delete()
      .eq('id', existingLike.id)

    if (deleteError) throw new Error('Chyba při odebírání lajku.')
  } else {
    // 4. Pokud neexistuje, vytvoříme ho (Like)
    const { error: insertError } = await supabase
      .from('likes')
      .insert([{ build_id: buildId, user_id: userId }])

    if (insertError) throw new Error('Chyba při přidávání lajku.')
  }

  // 5. Refresh dat na stránkách, kde se lajky zobrazují
  revalidatePath('/builds')
  revalidatePath(`/build/${buildId}`)
  revalidatePath('/saved') // Pokud máš stránku s uloženými buildy

  return { success: true, isLiked: !existingLike }
}