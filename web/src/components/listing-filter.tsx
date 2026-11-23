'use client'

import {useRouter} from 'next/navigation'

export function ListingFilter({
  label,
  value,
  all,
  choices,
  hrefs,
}: {
  label: string
  all: string
  value: string
  choices: string[]
  hrefs: string[]
}) {
  const router = useRouter()
  return (
    <label className="listing-filter">
      {label}: {value || all} <span aria-hidden="true">+</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => router.push(hrefs[event.target.selectedIndex], {scroll: false})}
      >
        <option value="">{all}</option>
        {choices.map((choice) => (
          <option key={choice}>{choice}</option>
        ))}
      </select>
    </label>
  )
}
