import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Commission, CommissionStatus } from '@/types/database'

const STATUS_CONFIG: Record<CommissionStatus, { label: string; className: string }> = {
  pending:   { label: '承認待ち', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: '承認済み', className: 'bg-sky-50 text-sky-600 border-sky-100' },
  paid:      { label: '支払済み', className: 'bg-[#E8F9EF] text-[#06C755] border-green-200' },
}

interface Props {
  commissions: (Commission & { prospect?: { company_name: string | null; name: string | null } | null })[]
}

function formatAmount(amount: number) {
  return `¥${Math.round(amount).toLocaleString('ja-JP')}`
}

function formatDate(isoString: string | null) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

export default function CommissionTable({ commissions }: Props) {
  if (commissions.length === 0) {
    return (
      <div className="bg-white rounded-2xl py-14 text-center text-[#666666] text-sm shadow-sm">
        まだ報酬履歴がありません
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="border-[#EEEEEE]">
            <TableHead className="text-[#666666] font-medium py-3.5 px-5">会社名</TableHead>
            <TableHead className="text-[#666666] font-medium">成約金額</TableHead>
            <TableHead className="text-[#666666] font-medium">報酬率</TableHead>
            <TableHead className="text-[#666666] font-medium">報酬額</TableHead>
            <TableHead className="text-[#666666] font-medium">ステータス</TableHead>
            <TableHead className="text-[#666666] font-medium">発生日</TableHead>
            <TableHead className="text-[#666666] font-medium">支払日</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {commissions.map((c) => {
            const config = STATUS_CONFIG[c.status]
            return (
              <TableRow key={c.id} className="border-[#EEEEEE] hover:bg-[#F5F5F5] transition-colors">
                <TableCell className="font-medium text-[#111111] px-5 py-3.5">
                  {c.prospect?.company_name ?? '—'}
                  {c.prospect?.name && (
                    <span className="block text-xs text-[#666666] font-normal mt-0.5">{c.prospect.name}</span>
                  )}
                </TableCell>
                <TableCell className="text-[#666666]">{formatAmount(c.contract_amount)}</TableCell>
                <TableCell className="text-[#666666]">{c.commission_rate_snapshot}%</TableCell>
                <TableCell className="font-semibold text-[#06C755]">{formatAmount(c.amount)}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={config.className}>
                    {config.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-[#666666]">{formatDate(c.created_at)}</TableCell>
                <TableCell className="text-[#666666]">{formatDate(c.paid_at)}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
