import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRecords, computeStats, computeMonthlyData } from '../hooks/useRecords'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Banknote, TrendingUp, Users, CalendarDays, Video, Zap } from 'lucide-react'

const COLORS = ['#ffffff', '#a855f7', '#3b82f6', '#22c55e']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs space-y-1.5">
        <div className="text-zinc-400 font-mono">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-zinc-300">{p.name}: </span>
            <span className="text-white font-medium">
              {p.name === 'Payment' ? `৳${p.value.toLocaleString()}` : p.value}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function PaymentPage() {
  const { records, loading } = useRecords()
  const stats = computeStats(records)
  const monthly = computeMonthlyData(records)

  // Today's payment
  const today = new Date().toISOString().split('T')[0]
  const todayRecords = records.filter(r => r.date === today)
  const todayPayment = todayRecords.reduce((s, r) =>
    s + (r.editCreativeCount || 0) * 30 + (r.hookEditCount || 0) * 10, 0)

  // This month's payment
  const thisMonth = new Date().toISOString().substring(0, 7)
  const monthlyRecords = records.filter(r => r.date?.startsWith(thisMonth))
  const monthPayment = monthlyRecords.reduce((s, r) =>
    s + (r.editCreativeCount || 0) * 30 + (r.hookEditCount || 0) * 10, 0)

  const pieData = stats.editors.map(e => ({
    name: e.name.split(' ')[0],
    value: e.payment,
  }))

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Payment System</h1>
        <p className="text-zinc-500 text-sm mt-1">Edit Creative = ৳30 · Hook Edit = ৳10</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Banknote, label: 'Total Payments', value: `৳${stats.totalPayments.toLocaleString()}`, color: 'green', sub: 'All time' },
          { icon: CalendarDays, label: "This Month", value: `৳${monthPayment.toLocaleString()}`, color: 'blue', sub: thisMonth },
          { icon: TrendingUp, label: "Today", value: `৳${todayPayment.toLocaleString()}`, color: 'white', sub: today },
          { icon: Users, label: "Editors", value: stats.editors.length, color: 'purple', sub: 'Active' },
        ].map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="stat-card noise-bg"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
              c.color === 'green' ? 'bg-green-400/10' :
              c.color === 'blue' ? 'bg-blue-400/10' :
              c.color === 'purple' ? 'bg-purple-400/10' : 'bg-white/10'
            }`}>
              <c.icon className={`w-5 h-5 ${
                c.color === 'green' ? 'text-green-400' :
                c.color === 'blue' ? 'text-blue-400' :
                c.color === 'purple' ? 'text-purple-400' : 'text-white'
              }`} strokeWidth={1.5} />
            </div>
            <div className="font-display text-2xl font-bold text-white mb-1">{c.value}</div>
            <div className="text-zinc-500 text-sm">{c.label}</div>
            <div className="text-zinc-700 text-xs mt-0.5">{c.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Editor breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats.editors.map((editor, i) => {
          const editPay = editor.editCount * 30
          const hookPay = editor.hookCount * 10
          return (
            <motion.div
              key={editor.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display font-bold text-sm ${
                    i === 0 ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'
                  }`}>
                    {editor.name.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="font-display font-semibold text-white">{editor.name}</div>
                    <div className="text-zinc-600 text-xs mt-0.5">{editor.records} products processed</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-2xl font-bold text-white">৳{editor.payment.toLocaleString()}</div>
                  <div className="text-zinc-600 text-xs">Total earned</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-3 border-b border-white/5">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Video className="w-4 h-4" strokeWidth={1.5} />
                    Edit Creatives
                    <span className="badge bg-white/5 text-zinc-500">×৳30</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 text-sm">{editor.editCount} edits</span>
                    <span className="text-white font-display font-semibold ml-3">৳{editPay.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Zap className="w-4 h-4" strokeWidth={1.5} />
                    Hook Edits
                    <span className="badge bg-white/5 text-zinc-500">×৳10</span>
                  </div>
                  <div className="text-right">
                    <span className="text-zinc-400 text-sm">{editor.hookCount} hooks</span>
                    <span className="text-white font-display font-semibold ml-3">৳{hookPay.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Mini bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-zinc-600 mb-1.5">
                  <span>Edit pay share</span>
                  <span>{((editPay / editor.payment) * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${i === 0 ? 'bg-blue-400' : 'bg-purple-400'}`}
                    style={{ width: `${(editPay / editor.payment) * 100}%` }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <h3 className="font-display font-semibold text-white mb-1">Monthly Earnings</h3>
          <p className="text-zinc-600 text-xs mb-6">Total payment per month</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthly} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="payment" name="Payment" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]}>
                {monthly.map((_, i) => (
                  <Cell key={i} fill={i === monthly.length - 1 ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.12)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl p-6 flex flex-col"
        >
          <h3 className="font-display font-semibold text-white mb-1">Payment Split</h3>
          <p className="text-zinc-600 text-xs mb-4">By editor</p>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.8} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `৳${v.toLocaleString()}`} contentStyle={{ background: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }} />
                <Legend
                  formatter={(v) => <span style={{ color: '#a1a1aa', fontSize: 12 }}>{v}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Rate card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass rounded-2xl p-6"
      >
        <h3 className="font-display font-semibold text-white mb-4">Payment Rate Card</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <Video className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-zinc-500 text-sm">Edit Creative</div>
              <div className="font-display text-xl font-bold text-white">৳30 <span className="text-zinc-600 text-sm font-normal">/ video</span></div>
            </div>
          </div>
          <div className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-purple-400/10 rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-400" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-zinc-500 text-sm">Hook Edit</div>
              <div className="font-display text-xl font-bold text-white">৳10 <span className="text-zinc-600 text-sm font-normal">/ hook</span></div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
