import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')

    let query = supabase
      .from('subjects')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (search && search.trim().length >= 2) {
      const term = search.trim()
      query = query.or(`name.ilike.%${term}%,category.ilike.%${term}%`)
    }

    const { data: subjects, error } = await query

    if (error) {
      console.error('Error fetching subjects:', error)
      return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 })
    }

    return NextResponse.json(subjects ?? [])
  } catch (err) {
    console.error('Unexpected error in GET /api/subjects:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
