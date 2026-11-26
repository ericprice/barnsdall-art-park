// Only historical image shapes need conversion. Modern copies can appear alongside them.
const legacyImageFields = ['credit', 'light', 'dark', 'cutoutScale', 'treatment']
export function migrateEditorialImages(document) {
  function visit(value, path) {
    if (Array.isArray(value)) return value.map((item) => visit(item, [...path, '[]']))
    if (!value || typeof value !== 'object') return value

    const result = Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, visit(child, [...path, key])]),
    )

    const isOldImage =
      result._type === 'image' ||
      (result.asset?._ref?.startsWith('image-') && legacyImageFields.some((key) => key in result))
    if (isOldImage) {
      const editorial =
        result._type === 'editorialImage' ||
        (document._type === 'article' &&
          path.length === 1 &&
          ['image', 'featureImage'].includes(path[0])) ||
        (document._type === 'homePage' &&
          ['heroSlides.[].image', 'features.[].image'].includes(path.join('.')))
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
      for (const key of legacyImageFields) delete result[key]
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
