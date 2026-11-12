/**
 * Surface, control and typography tokens for the console.
 *
 * The system is the Schematics 2026 brand, read off the official portal
 * (schematics-its.com) and `docs/Design Guidelines - Schematics 2026`:
 *
 *   - ground #07081f, panels one tone step up, separated by a 1px edge and
 *     never by a shadow — nothing on this screen floats except menus;
 *   - Fredoka for headings, Poppins for text;
 *   - one accent, the brand sky #53d2f8, on the single primary control and on
 *     chart data. Chrome stays neutral: no accent nav pill, no tinted bar.
 *
 * Every text colour clears 4.5:1 on its own surface (ink-3, the quietest, is
 * 7.1:1 on a panel), so meaning is never carried by a faint tone alone.
 */

/** Page background, applied once by the shell. */
export const SURFACE_PAGE = 'bg-ground'

/** Panel: the container every section lives in. */
export const SURFACE_CARD = 'bg-panel'

/** Recessed well inside a panel. */
export const SURFACE_WELL = 'bg-well'

export const BORDER = 'border-edge'

export const CARD = `rounded-2xl border ${BORDER} ${SURFACE_CARD}`

export const WELL = `rounded-xl border ${BORDER} ${SURFACE_WELL}`

export const RECESSED = `rounded-lg border border-edge-soft ${SURFACE_WELL}`

export const FOCUS =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky'

/** The one bright control on a screen: the brand's flat sky fill, black text. */
export const BTN_PRIMARY = `inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-sky px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-sky-soft disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`

/** The brand's outlined companion to the primary control. */
export const BTN_SECONDARY = `inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-sky-soft/40 px-3.5 py-2.5 text-sm font-medium text-ink transition hover:border-sky-soft hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`

export const BTN_DANGER = `inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-rose-400/40 px-3.5 py-2.5 text-sm font-medium text-rose-200 transition hover:border-rose-300 hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`

export const INPUT = `w-full rounded-xl border ${BORDER} bg-field px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-3 transition focus:border-sky/70 ${FOCUS}`

export const LABEL = 'block text-sm font-medium text-ink-2'

/** The title of a screen: a noun, at 24px, never a landing-page headline. */
export const PAGE_TITLE = 'font-display text-2xl font-bold text-ink'

/** Section title inside a panel. */
export const SECTION_HEADING = 'font-display text-lg font-semibold text-ink'

/** 12px sentence-case column head — no uppercase, no tracking, no header band. */
export const TH = 'px-3 py-2.5 text-left text-xs font-medium text-ink-3'

/** Numeric column head: figures line up on the right. */
export const TH_NUM = `${TH} text-right`

export const TD = 'px-3 py-2.5 align-top text-sm text-ink-2'

/** Numeric cell: right-aligned tabular figures. */
export const TD_NUM = `${TD} text-right tabular-nums`

/*
 * The portal's sheet: the document list's own card, radius 20 with generous
 * padding (Schematics 2026 Figma, node 1149:10712), set in the same navy panel
 * as every other card on the console.
 */

/** The document list's card. */
export const SHEET = `rounded-[20px] border ${BORDER} ${SURFACE_CARD}`

/** The sheet's own title: Fredoka 32/48. */
export const SHEET_TITLE = 'font-display text-[2rem] leading-[3rem] font-semibold text-ink'

/** A label on the sheet: Fredoka 16/24, the same ink as the title. */
export const SHEET_LABEL = 'font-display text-base leading-6 font-semibold text-ink'

/** Quiet supporting text on the sheet. */
export const SHEET_MUTED = 'text-sm text-ink-3'

/**
 * The sheet's action: full width, an outlined hairline, no fill.
 * The portal's one filled control is the sky pill, so these stay outlined.
 */
export const SHEET_ACTION = `inline-flex w-full cursor-pointer items-center justify-center gap-2.5 rounded-[14.52px] border border-sky-soft/40 px-3.5 py-2 text-[1.06rem] text-ink transition hover:border-sky-soft hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`

/** The portal's filled pill: flat sky, dark label. */
export const SHEET_ACTION_PRIMARY = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-[14.52px] bg-sky px-4 py-2 text-[1.06rem] font-medium text-night transition hover:bg-sky-soft disabled:cursor-not-allowed disabled:opacity-50 ${FOCUS}`

/*
 * The portal's navigation buttons, after schematics-its.com but stepped down
 * to 40px to sit in the 64px bar: a pill at radius 14.5, Poppins 15/500, the
 * filled one in the brand sky with a black label and the outlined one on a
 * 0.8px #c6edfe hairline.
 */
const NAV_BTN =
  'inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-[14.5px] px-4 text-[0.9375rem] font-medium transition disabled:cursor-not-allowed disabled:opacity-50'

export const NAV_BTN_FILLED = `${NAV_BTN} bg-sky text-black hover:bg-sky-soft ${'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-soft'}`

export const NAV_BTN_OUTLINE = `${NAV_BTN} border-[0.8px] border-sky-soft text-white hover:bg-white/10 ${'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-soft'}`

/** Status pill base; callers append their own pale tint and same-hue text. */
export const PILL =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium whitespace-nowrap'
