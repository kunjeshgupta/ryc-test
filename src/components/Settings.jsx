import { useState, useRef } from 'react'
import { getLogo, saveLogo, removeLogo } from '../utils/storage'
import bundledLogo from '../assets/ryc-logo.png'
import { COMPANY, BANK } from '../config'

export default function Settings() {
  const [logo, setLogo]     = useState(() => getLogo() || bundledLogo)
  const [saved, setSaved]   = useState(false)
  const fileRef             = useRef()

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

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-xl font-bold text-gray-900">Settings</h1>

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
          ['Name',    COMPANY.name],
          ['GSTIN',   COMPANY.gstin],
          ['Address', COMPANY.address],
          ['City',    COMPANY.city],
          ['Mobile',  COMPANY.phone],
          ['Email',   COMPANY.email],
          ['Bank',    `${BANK.branch} – ${BANK.accountNo}`],
          ['IFSC',    BANK.ifsc],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-400 w-20 shrink-0">{k}</span>
            <span className="text-gray-800 text-right">{v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
