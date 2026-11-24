import {Card} from '@sanity/ui'
import type {BlockStyleProps} from 'sanity'

export function LeadStyle({children}: BlockStyleProps) {
  return <span style={{fontSize: '1.333em'}}>{children}</span>
}

export function DottedLinkStyle({children}: BlockStyleProps) {
  return (
    <Card as="span" tone="primary" radius={2} paddingX={2} style={{display: 'block'}}>
      {children}
    </Card>
  )
}
