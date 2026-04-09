import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    redirect('/login')
  }

  return <div>{children}</div>
}
