import {set, type StringInputProps} from 'sanity'
import {hexColor} from '../../shared/organizations'

export function OrganizationColorInput(props: StringInputProps) {
  return (
    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
      <div style={{flex: 1, minWidth: 0}}>{props.renderDefault(props)}</div>
      <input
        type="color"
        aria-label={`Choose ${props.schemaType.title?.toLowerCase() || 'color'}`}
        disabled={props.readOnly}
        value={hexColor(props.value) ?? '#000000'}
        onChange={(event) => props.onChange(set(event.currentTarget.value.toUpperCase()))}
        style={{inlineSize: '2.5rem', blockSize: '2.25rem'}}
      />
    </div>
  )
}
