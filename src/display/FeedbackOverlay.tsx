// FeedbackOverlay.tsx — brief green/red flash shown over ButtonLayout on note hit/miss
// Displayed for 600ms then hidden; positioned absolutely over the parent container
type Props = {
  result: 'correct' | 'wrong' | null
  expectedName?: string
}

export default function FeedbackOverlay({ result, expectedName }: Props) {
  if (!result) return null

  const bg = result === 'correct' ? 'bg-green-500' : 'bg-red-500'
  const message = result === 'correct'
    ? '✓'
    : `✗  ${expectedName ?? '?'}`

  return (
    <div
      className={`absolute inset-0 ${bg} bg-opacity-50 flex items-center justify-center
                  rounded-lg text-white text-4xl font-bold pointer-events-none`}
    >
      {message}
    </div>
  )
}
