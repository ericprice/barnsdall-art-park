// Identity colors are sampled from the supplied interface plates (palette, listings, and News).
export const organizationDocuments = [
  {_id: 'organization.park', title: 'The Park', light: '#99D289', dark: '#458933'},
  {_id: 'organization.hollyhock', title: 'Hollyhock House', light: '#FCC200', dark: '#C38500'},
  {
    _id: 'organization.gallery',
    title: 'LA Municipal Art Gallery',
    light: '#D4C3FF',
    dark: '#5C489D',
  },
  {_id: 'organization.arts', title: 'Arts Center', light: '#F2DBDF', dark: '#B36C8F'},
  {_id: 'organization.theatre', title: 'Gallery Theatre', light: '#8E8B55', dark: '#605A4A'},
  {_id: 'organization.foundation', title: 'The Foundation', light: '#99D289', dark: '#458933'},
].map((org) => ({...org, _type: 'organization' as const}))

export type OrganizationTheme = {title: string; light: string; dark: string}
type ThemeProjection = {title?: string | null; light?: string | null; dark?: string | null}
const aliases: Record<string, string> = {
  park: 'park',
  'green-days': 'park',
  olives: 'park',
  grove: 'park',
  'initiative-olive': 'park',
  'the park': 'park',
  landscape: 'park',
  'arts-center': 'arts',
  'student-showcase': 'arts',
  'arts center': 'arts',
  'arts center & junior arts center': 'arts',
  'la municipal art gallery': 'gallery',
  'los angeles municipal art gallery': 'gallery',
  gallery: 'gallery',
  silton: 'gallery',
  lakota: 'gallery',
  theatre: 'theatre',
  ceramics: 'theatre',
  screening: 'theatre',
  rentals: 'theatre',
  'gallery theatre': 'theatre',
  'barnsdall gallery theatre': 'theatre',
  hollyhock: 'hollyhock',
  'hollyhock house': 'hollyhock',
  unesco: 'hollyhock',
}

export function organizationIdFor(name?: string | null) {
  return 'organization.' + (aliases[name?.trim().toLowerCase() || ''] || 'foundation')
}

export function organizationTheme(
  projected?: ThemeProjection | null,
  name?: string | null,
): OrganizationTheme {
  const fallback = organizationDocuments.find((doc) => doc._id === organizationIdFor(name))!
  return {
    title: projected?.title || name || fallback.title,
    light: hexColor(projected?.light) ?? fallback.light,
    dark: hexColor(projected?.dark) ?? fallback.dark,
  }
}

function hexColor(value?: string | null) {
  return value && /^#[a-f0-9]{6}$/i.test(value) ? value : undefined
}
