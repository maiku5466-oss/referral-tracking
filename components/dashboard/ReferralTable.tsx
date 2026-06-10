import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Prospect, ProspectStatus } from '@/types/database'

const STATUS_CONFIG: Record<ProspectStatus, { label: string; className: string }> = {
  registered: { label: 'LINE登録済み',      className: 'bg-gray-100 text-gray-500 border-gray-200' },
  surveyed:   { label: 'アンケート回答済み', className: 'bg-sky-50 text-sky-600 border-sky-100' },
  booked:     { label: 'Zoom予約済み',       className: 'bg-amber-50 text-amber-700 border-amber-200' },
  met:        { label: '商談済み',           className: 'bg-purple-50 text-purple-700 border-purple-200' },
  contracted: { label: '成約',              className: 'bg-[#E8F9EF] text-[#06C755] border-green-200' },
  lost:       { label: '失注',              className: 'bg-red-50 text-red-500 border-red-100' },
}

function formatDate(isoString: string | null) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

function formatAmount(amount: number | null) {
  if (!amount) return '—'
  return `¥${amount.toLocaleString('ja-JP')}`
}

interface Props {
  prospects: Prospect[]
  compact?: boolean
}

export default function ReferralTable({ prospects, compact }: Props) {
  if (prospects.length === 0) {
    return (
      <div className="bg-white rounded-2xl py-14 text-center text-[#666666] text-sm shadow-sm">
        まだ紹介実績がありません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-[#EEEEEE]">
            <TableHead className="text-[#666666] font-medium py-3.5 px-5">会社名</TableHead>
            <TableHead className="text-[#666666] font-medium">担当者名</TableHead>
            <TableHead className="text-[#666666] font-medium">ステータス</TableHead>
            {!compact && <TableHead className="text-[#666666] font-medium">Zoom予約日</TableHead>}
            {!compact && <TableHead className="text-[#666666] font-medium">成約金額</TableHead>}
            <TableHead className="text-[#666666] font-medium">登録日</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prospects.map((p) => {
            const config = STATUS_CONFIG[p.status]
            return (
              <TableRow key={p.id} className="border-[#EEEEEE] hover:bg-[#F5F5F5] transition-colors">
                <TableCell className="font-medium text-[#111111] px-5 py-3.5">
                  {p.company_name ?? '—'}
                </TableCell>
                <TableCell className="text-[#666666]">{p.name ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={config.className}>
                    {config.label}
                  </Badge>
                </TableCell>
                {!compact && <TableCell className="text-[#666666]">{formatDate(p.zoom_booked_at)}</TableCell>}
                {!compact && (
                  <TableCell className={p.contract_amount ? 'font-semibold text-[#111111]' : 'text-[#666666]'}>
                    {formatAmount(p.contract_amount)}
                  </TableCell>
                )}
                <TableCell className="text-[#666666]">{formatDate(p.created_at)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
