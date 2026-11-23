export function allowsDraftPreview(nodeEnv?: string, vercelEnv?: string, enabled?: string) {
  return (
    enabled === 'true' && (vercelEnv === 'preview' || (nodeEnv === 'development' && !vercelEnv))
  )
}
