// Called on both published documents and drafts, without mutating the input document.
export function migrateEditorialImages(document) {
  function visit(value, path) {
    if (Array.isArray(value)) return value.map((item) => visit(item, [...path, '[]']))
    if (!value || typeof value !== 'object') return value

    const result = Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, visit(child, [...path, key])]),
    )

    if (
      ['parkImage', 'editorialImage', 'image'].includes(result._type) ||
      result.asset?._ref?.startsWith('image-')
    ) {
      const editorial =
        (document._type === 'article' &&
          path.length === 1 &&
          ['image', 'featureImage'].includes(path[0])) ||
        (document._type === 'homePage' && path.join('.') === 'heroSlides.[].image')
      result._type = editorial ? 'editorialImage' : 'parkImage'
      const caption = (result.caption || '').trim() || (result.alt || '').trim()
      const credit = (result.credit || '').trim()
      if (credit && !caption.includes(credit)) {
        result.caption = [caption, credit].filter(Boolean).join(' ')
      } else if (caption) {
        result.caption = caption
      }

      if (!editorial) {
        delete result.presentation
      } else if (!result.presentation) {
        if (result.treatment === 'cutout') {
          result.presentation = result.cutoutScale > 1 ? 'closeCutout' : 'roseCutout'
        } else if (
          result.light?.toUpperCase() === '#F2DBDF' &&
          result.dark?.toUpperCase() === '#E0A8B5'
        ) {
          result.presentation = 'rose'
        }
      }
      for (const key of ['credit', 'alt', 'light', 'dark', 'cutoutScale', 'treatment'])
        delete result[key]
    }

    if (document._type === 'siteSettings' && path.join('.') === 'socialLinks.[]') {
      result._type = 'socialLink'
    } else if (result._type === 'link') {
      delete result.icon
    }
    return result
  }

  return visit(document, [])
}
