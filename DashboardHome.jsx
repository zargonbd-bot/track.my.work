import { motion } from 'framer-motion'
import { useRecords, computeStats, computeDailyData } from '../hooks/useRecords'
import {
  Package, Video, Zap, Clock, CheckCircle2, Banknote,
  TrendingUp, Users, ArrowUpRight
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar
} from 'recharts'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
}

function StatCard({ icon: Icon, label, value, sub, color = 'white', delay = 0 }) {
  return (
    <motion.div variants={item} className="stat-card noise-bg">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
          color === 'white' ? 'bg-white/10' :
          color === 'green' ? 'bg-green-400/10' :
          color === 'blue' ? 'bg-blue-400/10' :
          color === 'amber' ? 'bg-amber-400/10' :
          color === 'red' ? 'bg-red-400/10' :
          color === 'purple' ? 'bg-purple-400/10' : 'bg-white/10'
        }`}>
          <Icon className={`w-5 h-5 ${
            color === 'white' ? 'text-white' :
            color === 'green' ? 'text-green-400' :
            color === 'blue' ? 'text-blue-400' :
            color === 'amber' ? 'text-amber-400' :
            color === 'red' ? 'text-red-400' :
            color === 'purple' ? 'text-purple-400' : 'text-white'
          }`} strokeWidth={1.5} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-zinc-700" />
      </div>
      <div className="font-display text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-zinc-500 text-sm">{label}</div>
      {sub && <div className="text-zinc-600 text-xs mt-1">{sub}</div>}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-xl p-3 text-xs space-y-1.5">
        <div className="text-zinc-400 font-mono">{label}</div>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-zinc-300">{p.name}: </span>
            <span className="text-white font-medium">{p.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardHome() {
  const { records, loading } = useRecords()
  const stats = computeStats(records)
  const dailyData = computeDailyData(records)

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 text-sm mt-1">Production overview & performance summary</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        <StatCard icon={Package} label="Total Products" value={stats.totalProducts} color="white" />
        <StatCard icon={Video} label="Edited Videos" value={stats.totalEditedVideos} color="blue" />
        <StatCard icon={Zap} label="Hook Edits" value={stats.totalHookEdits} color="purple" />
        <StatCard icon={Clock} label="Pending Works" value={stats.pendingWorks} color="amber" />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.completedWorks} color="green" />
        <StatCard icon={Banknote} label="Total Payments" value={`৳${stats.totalPayments.toLocaleString()}`} color="green" sub="BDT" />
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily area chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-white">Daily Production</h3>
              <p className="text-zinc-600 text-xs mt-0.5">Edit creatives & hook edits per day</p>
            </div>
            <TrendingUp className="w-4 h-4 text-zinc-600" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dailyData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="editGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="hookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#52525b' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="editVideos" name="Edit Creatives" stroke="#ffffff" strokeWidth={2} fill="url(#editGrad)" />
              <Area type="monotone" dataKey="hookEdits" name="Hook Edits" stroke="#a855f7" strokeWidth={2} fill="url(#hookGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Editor summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-semibold text-white">Editor Summary</h3>
              <p className="text-zinc-600 text-xs mt-0.5">Performance per editor</p>
            </div>
            <Users className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="space-y-4">
            {stats.editors.map((editor, i) => (
              <div key={editor.name}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-white text-sm font-medium">
                      {editor.name.split(' ').map(w => w[0]).join('')}. {editor.name.split(' ').slice(-1)[0]}
                    </div>
                    <div className="text-zinc-600 text-xs">{editor.editCount} edits · {editor.hookCount} hooks</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-display font-semibold">৳{editor.payment.toLocaleString()}</div>
                    <div className="text-zinc-600 text-xs">{editor.records} products</div>
                  </div>
                </div>
                <div className="w-full bg-white/5 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-white/60 to-white/20 transition-all duration-500"
                    style={{ width: `${Math.min((editor.payment / stats.totalPayments) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent records */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-display font-semibold text-white">Recent Records</h3>
          <span className="text-zinc-600 text-xs">{records.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-zinc-600 text-xs font-display uppercase tracking-wider px-6 py-3">Date</th>
                <th className="text-left text-zinc-600 text-xs font-display uppercase tracking-wider px-3 py-3">Product</th>
                <th className="text-left text-zinc-600 text-xs font-display uppercase tracking-wider px-3 py-3">Editor</th>
                <th className="text-right text-zinc-600 text-xs font-display uppercase tracking-wider px-3 py-3">Edits</th>
                <th className="text-right text-zinc-600 text-xs font-display uppercase tracking-wider px-3 py-3">Hooks</th>
                <th className="text-right text-zinc-600 text-xs font-display uppercase tracking-wider px-6 py-3">Payment</th>
              </tr>
            </thead>
            <tbody>
              {records.slice(0, 8).map(r => (
                <tr key={r.id} className="table-row">
                  <td className="px-6 py-3 text-zinc-400 font-mono text-xs">{r.date}</td>
                  <td className="px-3 py-3 text-white font-medium">{r.productId}</td>
                  <td className="px-3 py-3">
                    <span className={`badge ${r.editorName === 'Hamim Hossain' ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'}`}>
                      {r.editorName.split(' ')[0]}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-zinc-300">{r.editCreativeCount}</td>
                  <td className="px-3 py-3 text-right text-zinc-300">{r.hookEditCount}</td>
                  <td className="px-6 py-3 text-right text-white font-display font-semibold">
                    ৳{((r.editCreativeCount || 0) * 30 + (r.hookEditCount || 0) * 10).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
