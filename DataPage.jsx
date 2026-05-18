import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRecords } from '../hooks/useRecords'
import toast from 'react-hot-toast'
import Papa from 'papaparse'
import {
  Plus, Search, Filter, Edit2, Trash2, Download,
  Check, X, ChevronDown, Calendar, SlidersHorizontal
} from 'lucide-react'

const EDITORS = ['Hamim Hossain', 'Abdullahil Kafi']

const emptyForm = {
  date: new Date().toISOString().split('T')[0],
  productId: '',
  photoshootCompleted: false,
  rawCreativeCount: 0,
  editCreativeCount: 0,
  hookEditCount: 0,
  editorName: EDITORS[0],
}

function RecordModal({ record, onClose, onSave, title }) {
  const [form, setForm] = useState(record || emptyForm)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = async () => {
    if (!form.productId.trim()) { toast.error('Product ID required'); return }
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const payment = (form.editCreativeCount || 0) * 30 + (form.hookEditCount || 0) * 10

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="glass rounded-3xl p-6 w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 glass rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 font-display uppercase tracking-wider">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5 font-display uppercase tracking-wider">Product ID</label>
              <input type="text" value={form.productId} onChange={e => set('productId', e.target.value)} placeholder="PRD-001" className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 mb-1.5 font-display uppercase tracking-wider">Editor</label>
            <select value={form.editorName} onChange={e => set('editorName', e.target.value)} className="input-field appearance-none bg-zinc-900">
              {EDITORS.map(e => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { k: 'rawCreativeCount', label: 'Raw Creatives' },
              { k: 'editCreativeCount', label: 'Edit Creatives' },
              { k: 'hookEditCount', label: 'Hook Edits' },
            ].map(({ k, label }) => (
              <div key={k}>
                <label className="block text-xs text-zinc-500 mb-1.5 font-display uppercase tracking-wider">{label}</label>
                <input
                  type="number"
                  min="0"
                  value={form[k]}
                  onChange={e => set(k, parseInt(e.target.value) || 0)}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set('photoshootCompleted', !form.photoshootCompleted)}
              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                form.photoshootCompleted ? 'bg-white border-white' : 'border-white/20 bg-transparent'
              }`}
            >
              {form.photoshootCompleted && <Check className="w-3 h-3 text-black" strokeWidth={3} />}
            </button>
            <span className="text-zinc-300 text-sm">Photoshoot Completed</span>
          </div>

          {/* Payment preview */}
          <div className="glass rounded-xl p-4 flex items-center justify-between">
            <div className="text-zinc-500 text-sm">Calculated Payment</div>
            <div className="font-display text-xl font-bold text-white">৳{payment.toLocaleString()}</div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : 'Save Record'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function DataPage() {
  const { records, loading, addRecord, updateRecord, deleteRecord } = useRecords()
  const [search, setSearch] = useState('')
  const [filterEditor, setFilterEditor] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [modalMode, setModalMode] = useState(null) // 'add' | 'edit'
  const [editingRecord, setEditingRecord] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const filtered = useMemo(() => {
    return records
      .filter(r => {
        const q = search.toLowerCase()
        if (q && !r.productId?.toLowerCase().includes(q) && !r.editorName?.toLowerCase().includes(q)) return false
        if (filterEditor !== 'all' && r.editorName !== filterEditor) return false
        if (filterStatus === 'completed' && !r.photoshootCompleted) return false
        if (filterStatus === 'pending' && r.photoshootCompleted) return false
        return true
      })
      .sort((a, b) => {
        let va = a[sortField], vb = b[sortField]
        if (typeof va === 'string') va = va.toLowerCase(), vb = vb.toLowerCase()
        if (va < vb) return sortDir === 'asc' ? -1 : 1
        if (va > vb) return sortDir === 'asc' ? 1 : -1
        return 0
      })
  }, [records, search, filterEditor, filterStatus, sortField, sortDir])

  const handleExport = () => {
    const csv = Papa.unparse(filtered.map(r => ({
      Date: r.date,
      'Product ID': r.productId,
      'Photoshoot Completed': r.photoshootCompleted ? 'Yes' : 'No',
      'Raw Creative Count': r.rawCreativeCount,
      'Edit Creative Count': r.editCreativeCount,
      'Hook Edit Count': r.hookEditCount,
      'Editor Name': r.editorName,
      'Payment (TK)': (r.editCreativeCount || 0) * 30 + (r.hookEditCount || 0) * 10,
    })))
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `zargon-data-${Date.now()}.csv`; a.click()
    toast.success('CSV exported!')
  }

  const handleAdd = async (form) => {
    await addRecord(form)
    toast.success('Record added!')
  }

  const handleEdit = async (form) => {
    await updateRecord(editingRecord.id, form)
    toast.success('Record updated!')
  }

  const handleDelete = async () => {
    await deleteRecord(deleteId)
    setDeleteId(null)
    toast.success('Record deleted')
  }

  const sort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const SortIcon = ({ field }) => (
    <ChevronDown className={`w-3 h-3 inline ml-1 transition-transform ${sortField === field && sortDir === 'asc' ? 'rotate-180' : ''} ${sortField !== field ? 'opacity-30' : 'opacity-100'}`} />
  )

  if (loading) return (
    <div className="flex items-center justify-center min-h-64">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Data Manager</h1>
          <p className="text-zinc-500 text-sm mt-1">{records.length} total records</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} className="btn-ghost flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button onClick={() => { setEditingRecord(null); setModalMode('add') }} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Record
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass rounded-2xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
          <input
            type="text"
            placeholder="Search by product ID or editor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <select value={filterEditor} onChange={e => setFilterEditor(e.target.value)} className="input-field w-auto min-w-36 bg-zinc-900">
          <option value="all">All Editors</option>
          {EDITORS.map(e => <option key={e} value={e}>{e.split(' ')[0]}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field w-auto min-w-32 bg-zinc-900">
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
        <div className="flex items-center gap-2 text-zinc-500 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          {filtered.length} results
        </div>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  { field: 'date', label: 'Date' },
                  { field: 'productId', label: 'Product ID' },
                  { field: 'editorName', label: 'Editor' },
                ].map(({ field, label }) => (
                  <th key={field}
                    className="text-left text-zinc-500 text-xs font-display uppercase tracking-wider px-5 py-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => sort(field)}
                  >
                    {label} <SortIcon field={field} />
                  </th>
                ))}
                <th className="text-center text-zinc-500 text-xs font-display uppercase tracking-wider px-3 py-4">Photo</th>
                <th className="text-right text-zinc-500 text-xs font-display uppercase tracking-wider px-3 py-4">Raw</th>
                <th className="text-right text-zinc-500 text-xs font-display uppercase tracking-wider px-3 py-4">Edits</th>
                <th className="text-right text-zinc-500 text-xs font-display uppercase tracking-wider px-3 py-4">Hooks</th>
                <th className="text-right text-zinc-500 text-xs font-display uppercase tracking-wider px-3 py-4">Payment</th>
                <th className="text-right text-zinc-500 text-xs font-display uppercase tracking-wider px-5 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((r, i) => (
                  <motion.tr
                    key={r.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="table-row"
                  >
                    <td className="px-5 py-3.5 text-zinc-400 font-mono text-xs">{r.date}</td>
                    <td className="px-5 py-3.5 text-white font-medium">{r.productId}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${r.editorName === 'Hamim Hossain' ? 'bg-blue-400/10 text-blue-400' : 'bg-purple-400/10 text-purple-400'}`}>
                        {r.editorName.split(' ').map(w => w[0]).join('')}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      {r.photoshootCompleted
                        ? <span className="badge bg-green-400/10 text-green-400"><Check className="w-3 h-3" /></span>
                        : <span className="badge bg-zinc-400/10 text-zinc-500"><X className="w-3 h-3" /></span>}
                    </td>
                    <td className="px-3 py-3.5 text-right text-zinc-400">{r.rawCreativeCount}</td>
                    <td className="px-3 py-3.5 text-right text-zinc-300">{r.editCreativeCount}</td>
                    <td className="px-3 py-3.5 text-right text-zinc-300">{r.hookEditCount}</td>
                    <td className="px-3 py-3.5 text-right text-white font-display font-semibold text-xs">
                      ৳{((r.editCreativeCount || 0) * 30 + (r.hookEditCount || 0) * 10).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setEditingRecord(r); setModalMode('edit') }}
                          className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-white/15 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-zinc-400" />
                        </button>
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="w-8 h-8 glass rounded-lg flex items-center justify-center hover:bg-red-400/15 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-16 text-zinc-600">
              <div className="text-4xl mb-3">◎</div>
              <p className="font-display">No records found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modalMode === 'add' && (
          <RecordModal title="Add New Record" onClose={() => setModalMode(null)} onSave={handleAdd} />
        )}
        {modalMode === 'edit' && editingRecord && (
          <RecordModal title="Edit Record" record={editingRecord} onClose={() => { setModalMode(null); setEditingRecord(null) }} onSave={handleEdit} />
        )}
        {deleteId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-3xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 bg-red-400/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="font-display text-lg font-bold text-white mb-2">Delete Record?</h3>
              <p className="text-zinc-500 text-sm mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">Cancel</button>
                <button onClick={handleDelete} className="flex-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-2.5 text-sm hover:bg-red-500/30 transition-colors">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
