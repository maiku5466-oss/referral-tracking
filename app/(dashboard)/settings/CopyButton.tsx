'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      onClick={handleCopy}
      variant={copied ? 'default' : 'outline'}
      size="sm"
      className="shrink-0"
    >
      {copied ? 'コピー済み ✓' : 'URLをコピー'}
    </Button>
  )
}
