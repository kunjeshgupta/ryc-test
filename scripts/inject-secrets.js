import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

let config = {}

if (process.env.APP_CONFIG_JSON) {
  try {
    const parsed = JSON.parse(process.env.APP_CONFIG_JSON)
    config = { ...config, ...parsed }
  } catch (e) {
    console.warn('⚠️  Could not parse APP_CONFIG_JSON:', e.message)
  }
}

// Support individual environment variables
const envKeys = [
  'COMPANY_NAME', 'COMPANY_TAGLINE', 'COMPANY_ADDRESS', 'COMPANY_CITY',
  'COMPANY_GSTIN', 'COMPANY_PHONE', 'COMPANY_EMAIL', 'COMPANY_STATE_CODE',
  'BANK_ACCOUNT_NAME', 'BANK_ACCOUNT_NO', 'BANK_IFSC', 'BANK_BRANCH'
]

for (const key of envKeys) {
  const val = process.env[key] || process.env[`VITE_${key}`]
  if (val && !config[key]) {
    config[key] = val
  }
}

// Handle custom logo if provided in config or env
const logoB64 = config.CUSTOM_LOGO_BASE64 || process.env.CUSTOM_LOGO_BASE64
if (logoB64) {
  try {
    const cleanB64 = logoB64.replace(/^data:image\/[a-z]+;base64,/, '').trim()
    const buffer = Buffer.from(cleanB64, 'base64')
    if (buffer.length > 0) {
      fs.writeFileSync(path.join(rootDir, 'src/assets/ryc-logo.png'), buffer)
      fs.writeFileSync(path.join(rootDir, 'public/ryc-logo.png'), buffer)
      console.log(`✓ Custom logo injected successfully (${buffer.length} bytes)`)
    }
  } catch (e) {
    console.warn('⚠️  Failed to inject custom logo:', e.message)
  }
}

// Generate .env.production.local with VITE_ prefixed keys
const envLines = []
for (const [key, value] of Object.entries(config)) {
  if (key === 'CUSTOM_LOGO_BASE64') continue
  if (value !== undefined && value !== null && value !== '') {
    const envKey = key.startsWith('VITE_') ? key : `VITE_${key}`
    envLines.push(`${envKey}=${JSON.stringify(String(value))}`)
  }
}

if (envLines.length > 0) {
  fs.writeFileSync(path.join(rootDir, '.env.production.local'), envLines.join('\n') + '\n')
  console.log(`✓ Injected ${envLines.length} configuration values into .env.production.local`)
} else {
  console.log('ℹ No secrets provided; using placeholder template defaults')
}
