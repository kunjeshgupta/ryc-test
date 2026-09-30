export const COMPANY = {
  name:      import.meta.env.VITE_COMPANY_NAME || 'Your Company Name',
  tagline:   import.meta.env.VITE_COMPANY_TAGLINE || 'Crane Rental & Heavy Lifting Services',
  address:   import.meta.env.VITE_COMPANY_ADDRESS || 'Commercial Complex, Highway Road',
  city:      import.meta.env.VITE_COMPANY_CITY || 'Gurgaon, Haryana 122001',
  gstin:     import.meta.env.VITE_COMPANY_GSTIN || '06XXXXX0000X1Z1',
  phone:     import.meta.env.VITE_COMPANY_PHONE || '+91 98000 00000',
  email:     import.meta.env.VITE_COMPANY_EMAIL || 'billing@example.com',
  stateCode: import.meta.env.VITE_COMPANY_STATE_CODE || '06',
}

export const BANK = {
  accountName: import.meta.env.VITE_BANK_ACCOUNT_NAME || import.meta.env.VITE_COMPANY_NAME || 'Your Company Name',
  accountNo:   import.meta.env.VITE_BANK_ACCOUNT_NO || '00000000000000',
  ifsc:        import.meta.env.VITE_BANK_IFSC || 'HDFC0000000',
  branch:      import.meta.env.VITE_BANK_BRANCH || 'Main Branch',
}

export const DEFAULTS = {
  hsnSac:       '998719',
  paymentTerms: 'Within 30 Days',
  units:        ['Hr.', 'Days', 'Month', 'Trip', 'Nos.'],
  gstRate:      18,   // %
}
