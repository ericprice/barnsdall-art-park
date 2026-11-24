type Props = {light?: string; dark?: string}
export function ColorPair({light, dark}: Props) {
  return (
    <span
      aria-label={`Highlight ${light || 'unset'}, shadow ${dark || 'unset'}`}
      style={{
        display: 'inline-block',
        width: '100%',
        height: '100%',
        background: `linear-gradient(120deg, ${light || 'transparent'} 50%, ${dark || 'transparent'} 50%)`,
      }}
    />
  )
}
