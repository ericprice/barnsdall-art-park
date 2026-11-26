import type {ComponentProps, ReactNode} from 'react'
import './section-disclosure.scss'

type Props = Pick<ComponentProps<'details'>, 'id' | 'open' | 'className' | 'children'> & {
  label: ReactNode
}

export function SectionDisclosure({label, children, className, ...props}: Props) {
  return (
    <details
      className={className ? `section-disclosure ${className}` : 'section-disclosure'}
      {...props}
    >
      <summary>
        <span>{label}</span>
      </summary>
      <div className="section-disclosure__content">{children}</div>
    </details>
  )
}
