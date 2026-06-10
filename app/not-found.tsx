import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 gap-4">
      <h1 className="text-4xl font-bold text-gray-300">404</h1>
      <p className="text-gray-500">紹介リンクが見つかりません</p>
      <p className="text-sm text-gray-400">URLが正しいか、または有効期限が切れていないかご確認ください。</p>
      <Link href="/login" className="text-sm text-blue-600 hover:underline mt-2">
        代理店ログインはこちら
      </Link>
    </div>
  )
}
