import {stemmer} from 'stemmer'

const stopWords = new Set(
  (
    'a an and any are as at be by can could did do does for from get getting have having how i in is it ' +
    'make made makes making me my of on or our please should take taking tell the there to us was were ' +
    'what when where which who will with would you your'
  ).split(' '),
)
const questionPreamble =
  /^(?:please )?(?:i want to|i(?: would|['’]d) like to|i(?: am|['’]m) looking for|tell me about|show me)\s+/u
const maximumTerms = 12
// Indexes represent no match, typo, prefix, stem and exact word, in that order.
const titleScores = [0, 6, 12, 18, 48]
const descriptionScores = [0, 3, 7, 13, 30]
const textScores = [0, 1, 3, 7, 24]

type SearchFields = {title?: string | null; description?: string | null; text?: string | null}
type WordIndex = {
  words: Set<string>
  stems: Set<string>
  byLength: Map<number, string[]>
}
type SearchTerm = {
  word: string
  stem: string
  prefix: boolean
  fuzzy: boolean
  similar: Map<string, boolean>
}

function wordsOf(text: string) {
  return (
    text
      .normalize('NFKD')
      .toLowerCase()
      .replace(/\p{M}/gu, '')
      .replace(/['’]s\b/g, '')
      .replace(/['’]/g, '')
      .match(/[\p{L}\p{N}]+/gu) ?? []
  )
}

export function topicStems(text: string) {
  return new Set(
    wordsOf(text)
      .filter((word) => /^\p{L}{3,}$/u.test(word) && !stopWords.has(word))
      .map(stemmer),
  )
}

function indexWords(words: string[]): WordIndex {
  const unique = new Set(words)
  const stems = new Set([...unique].map(stemmer))
  const byLength = new Map<number, string[]>()
  for (const word of new Set([...unique, ...stems])) {
    if (!/^\p{L}+$/u.test(word)) continue
    const terms = byLength.get(word.length)
    if (terms) terms.push(word)
    else byLength.set(word.length, [word])
  }
  return {words: unique, stems, byLength}
}

export function indexSearchFields({title, description, text}: SearchFields) {
  const titleWords = wordsOf(title ?? '')
  return {
    phrase: titleWords.join(' '),
    title: indexWords(titleWords),
    description: indexWords(wordsOf(description ?? '')),
    text: indexWords(wordsOf(text ?? '')),
  }
}

// Permit a single insertion, deletion, substitution, or adjacent transposition.
function oneEditApart(first: string, second: string) {
  if (Math.abs(first.length - second.length) > 1) return false
  const [shorter, longer] = first.length <= second.length ? [first, second] : [second, first]
  let position = 0
  while (position < shorter.length && shorter[position] === longer[position]) position++
  if (shorter.length !== longer.length)
    return shorter.slice(position) === longer.slice(position + 1)
  if (shorter.slice(position + 1) === longer.slice(position + 1)) return true
  return (
    shorter[position] === longer[position + 1] &&
    shorter[position + 1] === longer[position] &&
    shorter.slice(position + 2) === longer.slice(position + 2)
  )
}

function matchQuality(term: SearchTerm, index: WordIndex) {
  if (index.words.has(term.word)) return 4
  if (index.stems.has(term.stem)) return 3
  if (term.prefix) {
    for (const word of index.words) {
      if (word.startsWith(term.word)) return 2
    }
  }
  if (term.fuzzy) {
    const firstLength = Math.max(4, Math.min(term.word.length, term.stem.length) - 1)
    for (let length = firstLength; length <= term.word.length + 1; length++) {
      for (const word of index.byLength.get(length) ?? []) {
        let similar = term.similar.get(word)
        if (similar === undefined) {
          similar =
            oneEditApart(term.word, word) ||
            (term.stem.length >= 5 && oneEditApart(term.stem, word))
          term.similar.set(word, similar)
        }
        if (similar) return 1
      }
    }
  }
  return 0
}

export function createSearchRanker(query: string) {
  const exactPhrase = wordsOf(query).join(' ')
  const words = wordsOf(query.toLowerCase().trim().replace(questionPreamble, ''))
  const meaningful = words.filter((word) => !stopWords.has(word))
  if (!meaningful.length) return

  const terms = new Map<string, SearchTerm>()
  for (const word of meaningful) {
    const stem = stemmer(word)
    terms.set(stem, {
      word,
      stem,
      prefix: word === meaningful.at(-1) && word.length >= 3,
      fuzzy: /^\p{L}{5,}$/u.test(word),
      similar: new Map(),
    })
    if (terms.size === maximumTerms) break
  }
  const minimumMatches = Math.ceil((terms.size * 2) / 3)

  return (document: ReturnType<typeof indexSearchFields>) => {
    let matched = 0
    let titleMatches = 0
    let relevance = 0
    for (const term of terms.values()) {
      const title = matchQuality(term, document.title)
      const description = title === 4 ? 0 : matchQuality(term, document.description)
      const text = title === 4 || description === 4 ? 0 : matchQuality(term, document.text)
      const titleScore = titleScores[title]
      const score = Math.max(titleScore, descriptionScores[description], textScores[text])
      if (title) titleMatches++
      if (score) matched++
      relevance += score + titleScore / 100
    }
    if (matched < minimumMatches) return

    if (document.phrase === exactPhrase) relevance += 100
    else if (` ${document.phrase} `.includes(` ${exactPhrase} `)) relevance += 45
    if (titleMatches === terms.size) relevance += terms.size / document.title.words.size

    // Query coverage is more important than all other scoring signals combined.
    return matched * 1000 + relevance
  }
}
