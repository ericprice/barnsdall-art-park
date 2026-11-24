import {useDocumentValues, useFormValue, type StringFieldProps} from 'sanity'
const imagePath = ['image']
function ColorForTarget({id, field}: {id: string; field: StringFieldProps}) {
  const published = useDocumentValues<{image?: {asset?: unknown}}>(id, imagePath)
  const draft = useDocumentValues<{image?: {asset?: unknown}}>('drafts.' + id, imagePath)
  if ((draft.value ?? published.value)?.image?.asset) return null
  return field.renderDefault(field)
}
export function FeatureColor(props: StringFieldProps) {
  const card = useFormValue(props.path.slice(0, -1)) as
    {entry?: {_ref: string}; image?: {asset?: unknown}} | undefined
  return card?.entry?._ref && !card.image?.asset ? (
    <ColorForTarget id={card.entry._ref} field={props} />
  ) : null
}
