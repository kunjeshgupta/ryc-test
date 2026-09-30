import { useState, useRef } from 'react'
import { getLogo, saveLogo, removeLogo, exportAllData, importAllData, getInvoices, getClients } from '../utils/storage'
import bundledLogo from '../assets/ryc-logo.png'

export default function Settings() {
  const [logo, setLogo]           = useState(() => getLogo() || bundledLogo)
  const [saved, setSaved]         = useState(false)
  const fileRef                   = useRef()

  // Backup & Restore states
  const [invoicesCount, setInvoicesCount] = useState(() => getInvoices().length)
  const [clientsCount, setClientsCount]   = useState(() => getClients().length)
  const [copied, setCopied]               = useState(false)
  const [restoreMsg, setRestoreMsg]       = useState(null)
  const restoreFileRef                    = useRef()

  function refreshCounts() {
    setInvoicesCount(getInvoices().length)
    setClientsCount(getClients().length)
  }

  function handleLogoUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      saveLogo(ev.target.result)
      setLogo(ev.target.result)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveLogo() {
    removeLogo()
    setLogo(null)
  }

  // 1. Download Backup as JSON file
  function handleDownloadBackup() {
    const data = exportAllData()
    const jsonStr = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const dateStr = new Date().toISOString().slice(0, 10)
    const a = document.createElement('a')
    a.href = url
    a.download = `ryc-backup-${dateStr}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // 2. Share via WhatsApp / native share (navigator.share)
  async function handleShareBackup() {
    const data = exportAllData()
    const jsonStr = JSON.stringify(data, null, 2)
    const dateStr = new Date().toISOString().slice(0, 10)
    const fileName = `ryc-backup-${dateStr}.json`
    
    try {
      const file = new File([jsonStr], fileName, { type: 'application/json' })
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'RYC Invoices Backup',
          text: `Backup of ${data.invoices.length} invoices from RYC Invoices App (${dateStr})`,
          files: [file],
        })
        return
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      console.log('File sharing fallback to text/clipboard', err)
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'RYC Invoices Backup',
          text: jsonStr,
        })
        return
      } catch (err) {
        if (err.name === 'AbortError') return
      }
    }

    // Fallback: copy to clipboard
    handleCopyBackup()
  }

  // 3. Copy JSON to Clipboard
  async function handleCopyBackup() {
    const data = exportAllData()
    const jsonStr = JSON.stringify(data)
    try {
      await navigator.clipboard.writeText(jsonStr)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = jsonStr
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  // 4. Restore from Backup file
  function handleRestoreFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target.result)
        const count = parsed.invoices ? parsed.invoices.length : 0
        if (!confirm(`This backup contains ${count} invoices and ${(parsed.clients || []).length} clients.\n\nDo you want to restore this data?`)) {
          return
        }
        const res = importAllData(parsed)
        refreshCounts()
        setRestoreMsg({ type: 'success', text: `✓ Successfully restored ${res.invoicesCount} invoices and ${res.clientsCount} clients!` })
        setTimeout(() => setRestoreMsg(null), 5000)
      } catch (err) {
        setRestoreMsg({ type: 'error', text: `Failed to restore: ${err.message}` })
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

      {/* Backup & Data Protection */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-200 p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-blue-900 uppercase tracking-wide">📦 Data Backup & Export</h2>
          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
            {invoicesCount} Invoices
          </span>
        </div>
        <p className="text-xs text-gray-500">
          Save an instant backup of all invoices and clients. You can WhatsApp it, copy it, or download it directly on your iPhone.
        </p>

        <div className="grid grid-cols-1 gap-2 pt-1">
          <button
            onClick={handleShareBackup}
            className="w-full py-2.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            <span>💬</span> Share to WhatsApp / AirDrop
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleCopyBackup}
              className="py-2.5 px-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>📋</span> {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </button>

            <button
              onClick={handleDownloadBackup}
              className="py-2.5 px-3 border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>⬇</span> Download JSON
            </button>
          </div>
        </div>

        {copied && (
          <p className="text-green-700 bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-center font-medium">
            ✓ Full backup copied to clipboard! You can paste it into WhatsApp.
          </p>
        )}

        {/* Restore */}
        <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-600">Restore from Backup:</span>
          <button
            onClick={() => restoreFileRef.current.click()}
            className="w-full py-2 border border-dashed border-gray-300 rounded-xl text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors"
          >
            📂 Select Backup File (.json) to Restore
          </button>
          <input
            ref={restoreFileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleRestoreFile}
          />
          {restoreMsg && (
            <p className={`p-2 rounded-lg text-xs text-center font-medium ${
              restoreMsg.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {restoreMsg.text}
            </p>
          )}
        </div>
      </div>

      {/* Logo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Company Logo</h2>
        <p className="text-xs text-gray-400">Upload the RYC logo (PNG). It will appear in all generated PDFs.</p>

        {logo ? (
          <div className="flex flex-col items-center gap-3">
            <img src={logo} alt="RYC Logo" className="h-20 object-contain" />
            <div className="flex gap-2">
              <button onClick={() => fileRef.current.click()} className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-600">
                Replace
              </button>
              {getLogo() && (
                <button onClick={() => { removeLogo(); setLogo(bundledLogo) }} className="px-4 py-2 text-sm border border-red-200 rounded-lg text-red-500">
                  Reset to Default
                </button>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current.click()}
            className="w-full py-6 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 text-sm"
          >
            Tap to upload logo (PNG / JPG)
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoUpload}
        />

        {saved && <p className="text-green-600 text-xs text-center">✓ Logo saved</p>}
      </div>

      {/* Company info (read-only, from config) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col gap-2">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Firm Details</h2>
        {[
          ['Name',    'Rominder Yadav Cranes'],
          ['GSTIN',   '06BHRPY6139D1ZT'],
          ['Address', 'Yadav Complex NH-48, Near McDonalds, Manesar'],
          ['City',    'GURGAON, HARYANA 122004'],
          ['Mobile',  '9810086156, 8383001261'],
          ['Email',   'raorominder2@gmail.com'],
          ['Bank',    'HDFC – 50200060775879'],
          ['IFSC',    'HDFC0000589'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-400 w-20 shrink-0">{k}</span>
            <span className="text-gray-800 text-right">{v}</span>
          </div>
        ))}
        <p className="text-xs text-gray-400 mt-2">To change firm details, edit <code>src/config.js</code>.</p>
      </div>
    </div>
  )
}
