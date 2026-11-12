function parseClock(value) {
  const match = value.match(/^(\d{1,2})(?::(\d{2}))?:?\s*(AM|PM)?$/i)
  if (!match) return ''

  let hours = Number(match[1])
  const minutes = Number(match[2] || 0)
  const meridiem = match[3]?.toUpperCase()

  if (minutes > 59 || hours > 23) return ''
  if (meridiem) {
    if (hours < 1 || hours > 12) return ''
    if (meridiem === 'AM' && hours === 12) hours = 0
    if (meridiem === 'PM' && hours !== 12) hours += 12
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

function getTimes(value) {
  const matches = [...String(value || '').matchAll(/(\d{1,2})(?::(\d{2}))?:?\s*(AM|PM)?/gi)]
  return matches.slice(0, 2).map((match) =>
    parseClock(`${match[1]}${match[2] ? `:${match[2]}` : ''}${match[3] ? ` ${match[3]}` : ''}`),
  )
}

function TimeRangeInput({ id, value, onChange, className }) {
  const [startTime = '', endTime = ''] = getTimes(value)

  function updateRange(nextStart, nextEnd) {
    const nextValue = nextStart && nextEnd
      ? `${nextStart} - ${nextEnd}`
      : nextStart || nextEnd
    onChange({ target: { name: id, value: nextValue } })
  }

  return (
    <div className="mt-2 grid grid-cols-2 gap-3">
      <label className="block text-xs text-white/45" htmlFor={`${id}-start`}>
        From
        <input
          id={`${id}-start`}
          type="time"
          value={startTime || ''}
          onChange={(event) => updateRange(event.target.value, endTime || '')}
          className={className}
        />
      </label>
      <label className="block text-xs text-white/45" htmlFor={`${id}-end`}>
        To
        <input
          id={`${id}-end`}
          type="time"
          value={endTime || ''}
          onChange={(event) => updateRange(startTime || '', event.target.value)}
          className={className}
        />
      </label>
    </div>
  )
}

export default TimeRangeInput
