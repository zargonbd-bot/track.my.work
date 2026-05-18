import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRecords, computeStats, computeMonthlyData, computeDailyData } from '../hooks/useRecords'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell, PieChart, Pie, Legend
} from 'recharts'
import { BarChart3, TrendingUp, Award, Target } from 'lucide-react'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs space-y-1.5 min-w-32">
        <div className="text-zinc-400 font-mono border-b border-white/5 pb-1.5 mb-1.5">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-zinc-400">{p.name}</span>
            </div>
            <span className="text-white font-medium">{typeof p.value === 'number' && p.name?.includes('Payment') ? `৳${p.value.toLocaleString()}` : p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function AnalyticsPage() {
  const { records, loading } = useRecords()
  const stats = computeStats(records)
  const monthly = computeMonthlyData(records)
  const daily = computeDailyData(records)

  // Editor performance radar
  const radarData = useMemo(() => {
    return stats.editors.map(e => ({
      editor: e.name.split(' ')[0],
      'Edits': e.editCount,
      'Hooks': e.hookCount,
      'Products': e.records,
    }))
  }, [stats.editors])

  // Completion rate
  const completionRate = stats.totalProducts > 0
    ? ((stats.completedWorks / stats.totalProducts) * 100).toFixed(1)
    : 0

  // Best day
  const bestDay = daily.reduce((best, d) => d.payment > (best?.payment || 0) ? d : best, null)

  // Avg per product
  const avgEditPerProduct = stats.totalProducts > 0 ? (stats.totalEditedVideos / stats.totalProducts).toFixed(1) : 0

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">Production performance & trends</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Target, label: 'Completion Rate', value: `${completionRate}%`, sub: 'Photoshoot done', color: 'green' },
          { icon: TrendingUp, label: 'Avg Edits/Product', value: avgEditPerProduct, sub: 'Edit creatives avg', color: 'blue' },
          { icon: Award, label: 'Best Day Earnings', value: bestDay ? `৳${bestDay.payment.toLocaleString()}` : '—', sub: bestDay?.day || 'N/A', color: 'amber' },
          { icon: BarChart3, label: 'Total Output', value: stats.totalEditedVideos + stats.totalHookEdits, sub: 'Edits + hooks', color: 'purple' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className="stat-card noise-bg"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
              c.color === 'green' ? 'bg-green-400/10' :
              c.color === 'blue' ? 'bg-blue-400/10' :
              c.color === 'amber' ? 'bg-amber-400/10' :
              'bg-purple-400/10'
            }`}>
              <c.icon className={`w-5 h-5 ${
                c.color === 'green' ? 'text-green-400' :
                c.color === 'blue' ? 'text-blue-400' :
                c.color === 'amber' ? 'text-amber-400' :
                'text-purple-400'
              }`} strokeWidth={1.5} />
            </div>
            <div className="font-display text-2xl font-bold text-white mb-1">{c.value}</div>
            <div className="text-zinc-500 text-sm">{c.label}</div>
            <div className="text-zinc-700 text-xs mt-0.5">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly trends */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-semibold text-white">Monthly Trends</h3>
            <p className="text-zinc-600 text-xs mt-0.5">Production volume over time</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="editGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="hookGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="editVideos" name="Edit Creatives" stroke="#3b82f6" strokeWidth={2} fill="url(#editGrad2)" />
            <Area type="monotone" dataKey="hookEdits" name="Hook Edits" stroke="#a855f7" strokeWidth={2} fill="url(#hookGrad2)" />
            <Area type="monotone" dataKey="products" name="Products" stroke="#22c55e" strokeWidth={2} fill="url(#payGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Bottom charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily payment bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-white mb-1">Daily Payments</h3>
          <p className="text-zinc-600 text-xs mb-6">Last 30 days earnings</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={daily} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#52525b' }} tickLine={false} axisLine={false}
                tickFormatter={v => v.split('-').slice(1).join('/')} />
              <YAxis tick={{ fontSize: 9, fill: '#52525b' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="payment" name="Payment" fill="rgba(255,255,255,0.15)" radius={[3, 3, 0, 0]}>
                {daily.map((d, i) => (
                  <Cell key={i}
                    fill={d.day === bestDay?.day ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.12)'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Editor comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-white mb-1">Editor Performance</h3>
          <p className="text-zinc-600 text-xs mb-4">Comparative output metrics</p>
          <div className="space-y-5">
            {stats.editors.map((editor, i) => (
              <div key={editor.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-display font-bold ${
                      i === 0 ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'
                    }`}>
                      {editor.name.split(' ').map(w => w[0]).join('')}
                    </div>
                    <div>
                      <div className="text-white text-sm">{editor.name.split(' ')[0]}</div>
                      <div className="text-zinc-600 text-xs">{editor.records} products</div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-zinc-500">
                    <div>{editor.editCount} edits · {editor.hookCount} hooks</div>
                    <div className="text-white font-display font-semibold text-sm mt-0.5">৳{editor.payment.toLocaleString()}</div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-700 mb-1">
                      <span>Edits</span>
                      <span>{editor.editCount}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-blue-400' : 'bg-purple-400'}`}
                        style={{ width: `${Math.min((editor.editCount / (stats.totalEditedVideos || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-700 mb-1">
                      <span>Hooks</span>
                      <span>{editor.hookCount}</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full opacity-60 ${i === 0 ? 'bg-blue-400' : 'bg-purple-400'}`}
                        style={{ width: `${Math.min((editor.hookCount / (stats.totalHookEdits || 1)) * 100, 100)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Production summary table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5">
          <h3 className="font-display font-semibold text-white">Monthly Production Summary</h3>
          <p className="text-zinc-600 text-xs mt-0.5">Breakdown by month</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {['Month', 'Products', 'Edit Creatives', 'Hook Edits', 'Total Payment'].map(h => (
                  <th key={h} className="text-left text-zinc-500 text-xs font-display uppercase tracking-wider px-6 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthly.map((m, i) => (
                <tr key={m.month} className="table-row">
                  <td className="px-6 py-3.5 text-white font-mono text-xs">{m.month}</td>
                  <td className="px-6 py-3.5 text-zinc-300">{m.products}</td>
                  <td className="px-6 py-3.5 text-zinc-300">{m.editVideos}</td>
                  <td className="px-6 py-3.5 text-zinc-300">{m.hookEdits}</td>
                  <td className="px-6 py-3.5 text-white font-display font-semibold">৳{m.payment.toLocaleString()}</td>
                </tr>
              ))}
              {monthly.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-600">No monthly data yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
