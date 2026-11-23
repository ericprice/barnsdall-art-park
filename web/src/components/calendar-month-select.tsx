'use client'

import {useRouter} from 'next/navigation'

export function CalendarMonthSelect({
  month,
  choices,
}: {
  month: string
  choices: {value: string; label: string; href: string}[]
}) {
  const router = useRouter()
  const current = choices.find((item) => item.value === month)
  return (
    <label className="calendar-month-select">
      {current?.label} <span aria-hidden="true">+</span>
      <select
        value={month}
        aria-label={current?.label}
        onChange={(event) => router.push(choices[event.target.selectedIndex].href, {scroll: false})}
      >
        {choices.map((item) => (
          <option value={item.value} key={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
