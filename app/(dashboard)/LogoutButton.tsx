'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full text-xs text-[#666666] py-2 px-3 rounded-xl hover:bg-gray-50 hover:text-[#111111] transition-colors text-left"
    >
      ログアウト
    </button>
  )
}
