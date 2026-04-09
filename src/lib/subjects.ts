import { createServerSupabaseClient } from '@/lib/supabase'

export interface Subject {
  id: string
  name: string
  category_id: string | null
  category_name: string | null
  description: string | null
}

export async function getSubjects(): Promise<Subject[]> {
  const supabase = createServerSupabaseClient()

  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, description, category')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching subjects:', error)
    return []
  }

  // Map the subjects to the expected format
  // Task 1 created subjects with a 'category' text field (not a separate table)
  return (data || []).map((s: { id: string; name: string; description: string | null; category: string | null }) => ({
    id: s.id,
    name: s.name,
    category_id: s.category ?? null,
    category_name: s.category ?? null,
    description: s.description ?? null,
  }))
}
