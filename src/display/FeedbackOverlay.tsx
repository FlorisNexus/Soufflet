/**
 * @file FeedbackOverlay.tsx
 * @description Brief visual feedback on note hit/miss.
 */

type Props = {
  /** The result of the note evaluation */
  result: 'correct' | 'wrong' | null
  /** The name of the expected note (shown on error) */
  expectedName?: string
}

/**
 * Component that displays a discreet visual indicator of the user's performance.
 * Updated to be non-blocking and more professional.
 */
export default function FeedbackOverlay({ result, expectedName }: Props) {
  if (!result) return null

  // Use a smaller, floating indicator instead of a full-screen overlay
  const isCorrect = result === 'correct'
  const bgColor = isCorrect ? 'bg-green-500/90' : 'bg-red-500/90'
  const icon = isCorrect ? '✓' : '✗'

  return (
    <div
      className={`absolute top-0 right-0 m-4 ${bgColor} backdrop-blur-md 
                  flex items-center gap-3 px-6 py-3 rounded-2xl shadow-2xl 
                  animate-in fade-in zoom-in duration-200 border border-white/20`}
    >
      <span className="text-2xl font-black text-white leading-none">{icon}</span>
      {!isCorrect && expectedName && (
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] uppercase font-bold text-white/70 tracking-widest">Attendu</span>
          <span className="text-lg font-black text-white">{expectedName}</span>
        </div>
      )}
    </div>
  )
}
