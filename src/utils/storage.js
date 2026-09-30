const K = {
  invoices: 'ryc_invoices',
  counter:  'ryc_counter',
  logo:     'ryc_logo',
  clients:  'ryc_clients',
}

// ── Invoices ─────────────────────────────────────────────────
export function getInvoices() {
  try { return JSON.parse(localStorage.getItem(K.invoices) || '[]') }
  catch { return [] }
}
export function saveInvoice(invoice) {
  const list = getInvoices().filter(i => i.id !== invoice.id)
  list.unshift(invoice)
  localStorage.setItem(K.invoices, JSON.stringify(list))
}
export function deleteInvoice(id) {
  localStorage.setItem(K.invoices, JSON.stringify(getInvoices().filter(i => i.id !== id)))
}

// ── Invoice counter ───────────────────────────────────────────
export function getNextInvoiceNo() {
  return parseInt(localStorage.getItem(K.counter) || '3', 10) + 1
}
export function bumpCounter(no) {
  const n = parseInt(no, 10)
  if (n > parseInt(localStorage.getItem(K.counter) || '0', 10))
    localStorage.setItem(K.counter, String(n))
}

// ── Logo ──────────────────────────────────────────────────────
export function getLogo()         { return localStorage.getItem(K.logo) || null }
export function saveLogo(b64)     { localStorage.setItem(K.logo, b64) }
export function removeLogo()      { localStorage.removeItem(K.logo) }

// ── Saved clients ─────────────────────────────────────────────
export function getClients() {
  try { return JSON.parse(localStorage.getItem(K.clients) || '[]') }
  catch { return [] }
}
export function saveClient(client) {
  // key by GSTIN (or name if no GSTIN)
  const key = client.gstin || client.name
  const list = getClients().filter(c => (c.gstin || c.name) !== key)
  list.unshift(client)
  localStorage.setItem(K.clients, JSON.stringify(list))
}
export function deleteClient(key) {
  const list = getClients().filter(c => (c.gstin || c.name) !== key)
  localStorage.setItem(K.clients, JSON.stringify(list))
}

// ── Backup & Restore ──────────────────────────────────────────
export function exportAllData() {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    invoices: getInvoices(),
    clients: getClients(),
    counter: localStorage.getItem(K.counter) || '3',
    logo: getLogo(),
  }
}

export function importAllData(data) {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file: data is not a valid JSON object.')
  }
  if (!Array.isArray(data.invoices)) {
    throw new Error('Invalid backup format: missing invoices array.')
  }

  // Save invoices
  localStorage.setItem(K.invoices, JSON.stringify(data.invoices))

  // Save clients if present
  if (Array.isArray(data.clients)) {
    localStorage.setItem(K.clients, JSON.stringify(data.clients))
  }

  // Save counter if present
  if (data.counter !== undefined && data.counter !== null) {
    localStorage.setItem(K.counter, String(data.counter))
  }

  // Save logo if present
  if (data.logo) {
    localStorage.setItem(K.logo, data.logo)
  }

  return {
    invoicesCount: data.invoices.length,
    clientsCount: (data.clients || []).length,
  }
}

