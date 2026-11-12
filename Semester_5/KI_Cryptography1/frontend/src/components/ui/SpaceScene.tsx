import sceneUrl from '@/assets/brand/login-bg.svg'

/**
 * The auth screens' backdrop: the Schematics 2026 Figma's own Login Page
 * artwork (node 276:10), exported whole — the UFO and its beam on the left,
 * the violet wash behind them, the asteroids, stars and sparkle — with the
 * page's logo, headings and form card cut away so the live markup carries
 * them. The right half is deliberately empty: that is where the form sits.
 */
export function SpaceScene({ className = '' }: { className?: string }) {
  return (
    <div className={`${className} overflow-hidden`} aria-hidden="true">
      <img
        src={sceneUrl}
        alt=""
        className="absolute inset-0 h-full w-full max-w-none object-cover object-left select-none"
      />
    </div>
  )
}
