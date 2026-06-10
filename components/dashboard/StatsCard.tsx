import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  sub?: string
  icon: React.ReactNode
  highlight?: boolean
}

export default function StatsCard({ title, value, sub, icon, highlight }: StatsCardProps) {
  return (
    <Card className={highlight ? 'bg-[#E8F9EF] shadow-none border border-green-100' : ''}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-medium text-[#666666]">{title}</CardTitle>
        <span className="text-xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold tracking-tight ${highlight ? 'text-[#06C755]' : 'text-[#111111]'}`}>
          {value}
        </div>
        {sub && <p className="text-xs text-[#666666] mt-1 leading-snug">{sub}</p>}
      </CardContent>
    </Card>
  )
}
