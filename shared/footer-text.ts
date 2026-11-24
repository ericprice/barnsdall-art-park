function footerParagraph(text?: string | null) {
  if (!text) return undefined
  return [
    {
      _type: 'block' as const,
      _key: 'paragraph',
      style: 'normal' as const,
      markDefs: [],
      children: [{_type: 'span' as const, _key: 'text', text, marks: []}],
    },
  ]
}

export function footerFromPlainText(fields: {
  address?: string | null
  footerText?: string | null
  landAcknowledgment?: string | null
}) {
  return {
    address: footerParagraph(fields.address),
    footerText: footerParagraph(fields.footerText),
    landAcknowledgment: footerParagraph(fields.landAcknowledgment),
  }
}
