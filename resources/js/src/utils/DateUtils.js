export const formatLastActive = (dateStr) => {
  if (!dateStr) return { label: 'No Data', sub: null }

  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now - date
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  let label
  if (diffSec < 60) label = 'Just now'
  else if (diffMin < 60) label = `${diffMin} minutes ago`
  else if (diffHour < 24) label = `${diffHour} hours ago`
  else if (diffDay < 30) label = `${diffDay} days ago`
  else if (diffMonth < 12) label = `${diffMonth} months ago`
  else label = `${diffYear} years ago`

  const sub = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  return { label, sub }
}
