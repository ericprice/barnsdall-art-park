// Dates and descriptions for the six illustrated wireframe entries retain the design copy.
// Other milestones follow https://www.barnsdall.org/timeline. The date of the grove
// master plan follows the signed drawings and https://www.barnsdall.org/grove-history.
export type HistoryPhoto = {
  path: string
  alt: string
  caption?: string
  credit?: string
  sha1: string
}

const photographs = {
  grove: {
    path: '/images/history/olive-hill.webp',
    alt: 'Olive trees on the hillside below the buildings on Olive Hill.',
    caption: 'Olive Hill from the southeast, 1932–33.',
    credit: 'Anton Wagner, PC 017, California Historical Society.',
    sha1: '6278307e39281ef45fa80a13c0f94e9bffa58faa',
  },
  hill1921: {
    path: '/images/history/hill-1921.webp',
    alt: 'An aerial view of the olive orchard surrounding Hollyhock House.',
    caption: 'Barnsdall Park, 1921.',
    credit: '© Hollywood Photographs, c/o Stephen & Christy McAvoy Family Trust.',
    sha1: 'b9b9647e3617c88df15945ea051381bb8c18828b',
  },
  aline: {
    path: '/images/history/aline-barnsdall.webp',
    alt: 'Portrait of Aline Barnsdall.',
    credit: 'Courtesy of David Devine and Michael Devine.',
    sha1: '0e693bd2e36fedfa4f8a76a941154e8a273297c7',
  },
  entrance: {
    path: '/images/history/park-entrance-1937.webp',
    alt: 'The entrance to Barnsdall Park in the 1930s.',
    caption: 'Park entrance, circa 1937.',
    credit: 'Herman J. Schultheis Collection, Los Angeles Public Library.',
    sha1: 'f40e152a8e950403391ade9e908e74acf534a8b5',
  },
  hill1947: {
    path: '/images/history/hill-1947.webp',
    alt: 'Barnsdall Art Park seen from above in 1947.',
    caption: 'Barnsdall Park, 1947.',
    credit: '© Hollywood Photographs, c/o Stephen & Christy McAvoy Family Trust.',
    sha1: '0ce356ad64d3d1c8ccc9b6ad85d3c3b123450517',
  },
  juniorArts: {
    path: '/images/history/junior-arts.webp',
    alt: 'Children making art at a shared table at the Junior Arts Center.',
    sha1: 'f42577fd17b329419c43ce83fe535013d06d1bb0',
  },
  gallery: {
    path: '/images/history/municipal-gallery.webp',
    alt: 'Entrance to the Los Angeles Municipal Art Gallery.',
    sha1: 'dd6838f1c828db3b51974ba650e03c6af77399f1',
  },
  masterPlan: {
    path: '/images/history/olive-grove-plan-1995.webp',
    alt: 'Drawing of the north slope grove along Olive Hill Road.',
    caption: 'North slope, Barnsdall Park Master Plan, 1995.',
    credit: 'Drawing courtesy of William Johnson.',
    sha1: 'ffe70166bf323a741137a6777c17b42a00410240',
  },
  hollyhock: {
    path: '/images/history/hollyhock-house.webp',
    alt: 'The west façade of Hollyhock House.',
    credit: 'Joshua White / JWPictures.com.',
    sha1: '7b1e6bf6bac845b1b4537fb40b4f1ec2c5d14fe1',
  },
} satisfies Record<string, HistoryPhoto>

export const historyPhotos: HistoryPhoto[] = Object.values(photographs)

type Milestone = {key: string; date: string; text: string; photo?: HistoryPhoto}

const milestones: Milestone[] = [
  {
    key: '1919',
    date: '1919–1921',
    text: 'Hollyhock House is built on Olive Hill.',
    photo: photographs.hill1921,
  },
  {
    key: '1927',
    date: '1927',
    text: 'Aline Barnsdall gives the park to Los Angeles.',
    photo: photographs.aline,
  },
  {
    key: '1927-club',
    date: '1927–1942',
    text: 'The California Art Club makes its home at Hollyhock House.',
    photo: photographs.entrance,
  },
  {
    key: '1946',
    date: '1946',
    text: 'Adult art classes begin at Residence A.',
    photo: photographs.hill1947,
  },
  {
    key: '1963',
    date: '1963',
    text: 'Los Angeles designates Hollyhock House a Historic-Cultural Monument.',
  },
  {
    key: '1965',
    date: '1965',
    text: 'The City extends Historic-Cultural Monument status to Barnsdall Park.',
  },
  {key: '1967', date: '1967', text: 'The Junior Arts Center opens.', photo: photographs.juniorArts},
  {
    key: '1971',
    date: '1971',
    text: 'The Municipal Art Gallery and Gallery Theatre open.',
    photo: photographs.gallery,
  },
  {
    key: '1971-register',
    date: '1971',
    text: 'The Aline Barnsdall Complex enters the National Register of Historic Places.',
  },
  {key: '1974', date: '1974', text: 'The City begins a major restoration of Hollyhock House.'},
  {key: '1994', date: '1994', text: 'The Northridge earthquake damages Hollyhock House.'},
  {
    key: '1995',
    date: '1995',
    text: 'The Barnsdall Park Master Plan proposes replanting the olive grove.',
    photo: photographs.masterPlan,
  },
  {key: '2003', date: '2003', text: 'The Barnsdall Art Park Foundation is established.'},
  {key: '2005', date: '2005', text: 'Hollyhock House reopens after earthquake repairs.'},
  {
    key: '2007',
    date: '2007',
    text: 'The Aline Barnsdall Complex becomes a National Historic Landmark.',
  },
  {
    key: '2008-wine',
    date: '2008',
    text: 'The Foundation begins holding Friday night wine tastings to raise funds for the park.',
  },
  {
    key: '2008-restoration',
    date: '2008–2014',
    text: 'City, state and federal funds support the restoration of Hollyhock House.',
  },
  {
    key: '2015',
    date: '2015',
    text: 'Hollyhock House reopens and is nominated for the UNESCO World Heritage List.',
  },
  {key: '2016', date: '2016', text: 'The City begins restoring Residence A.'},
  {
    key: '2019',
    date: '2019',
    text: 'Hollyhock House joins the UNESCO World Heritage List.',
    photo: photographs.hollyhock,
  },
]

function introduction(key: string, title: string, paragraph: string) {
  return {
    _key: key,
    _type: 'contentSection' as const,
    anchor: key,
    title,
    body: [
      {
        _key: 'paragraph',
        _type: 'block' as const,
        style: 'normal' as const,
        markDefs: [],
        children: [{_key: 'text', _type: 'span' as const, marks: [], text: paragraph}],
      },
    ],
  }
}

export function createHistoryPage<T>(resolveImage: (photo: HistoryPhoto) => T | undefined) {
  return {
    _type: 'page' as const,
    title: 'Timeline',
    summary: 'The history of Olive Hill, its cultural spaces and preservation.',
    slug: {_type: 'slug' as const, current: 'history'},
    template: 'timeline' as const,
    image: resolveImage(photographs.grove),
    sections: [
      introduction(
        'historic-grove',
        'The historic grove',
        'Joseph H. Spires planted a commercial olive orchard here in the 1890s. Aline Barnsdall bought the 36-acre property in 1919. Frank Lloyd Wright and his son Lloyd incorporated the existing trees into their plans for Olive Hill.',
      ),
      introduction(
        'preservation',
        'Preservation over time',
        'Barnsdall gave the hilltop to the City in 1927. By 1992, only 90 olive trees remained. The 1995 park master plan called for replanting the grove, and by 2003, 315 new trees had been planted.',
      ),
    ],
    timelineHeading: 'Timeline',
    timelineEntries: milestones.map(({key, date, text, photo}) => ({
      _key: key,
      _type: 'timelineEntry' as const,
      dateLabel: date,
      description: text,
      ...(photo && {image: resolveImage(photo)}),
    })),
  }
}

export function createHistoryStudioPage(assetsByPath: Record<string, string>) {
  return createHistoryPage(({path, alt, caption, credit}) =>
    assetsByPath[path]
      ? {
          _type: 'parkImage' as const,
          asset: {_type: 'reference' as const, _ref: assetsByPath[path]},
          alt,
          caption,
          credit,
        }
      : undefined,
  )
}
