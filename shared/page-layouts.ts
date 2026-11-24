export const pageLayouts = {
  standard: 'Standard page',
  visit: 'Getting Here',
  policies: 'Visit policies',
  rentals: 'Rentals',
  foundation: 'Foundation',
  initiatives: 'Initiatives',
  supporters: 'Supporters',
  donate: 'Donate',
  initiative: 'Initiative story',
  restoration: 'Olive Grove Restoration',
  timeline: 'History / Timeline',
  contact: 'Contact',
  centennial: 'Centennial campaign',
} as const

export const historyPageId = 'e12abb4a-ab48-47bf-af10-1e629027ab37'
export const sectionRoles = {
  prose: 'Text and links',
  columns: 'Columns',
  accordion: 'Accordion',
  map: 'Map actions',
  inquiries: 'Rental inquiries',
  campaign: 'Campaign introduction',
  signup: 'Newsletter signup',
  plan: 'Restoration plan',
  past: 'Past initiatives drawer',
  news: 'Related news',
} as const

export const rolesByLayout: Record<string, (keyof typeof sectionRoles)[]> = {
  visit: ['map'],
  rentals: ['inquiries'],
  centennial: ['campaign'],
  contact: ['signup'],
  restoration: ['plan', 'past', 'news'],
}

export function pageHasMainImage(template?: unknown) {
  return !['policies', 'contact', 'initiatives', 'supporters', 'donate'].includes(String(template))
}
