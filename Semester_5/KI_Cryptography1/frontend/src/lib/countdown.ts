import { useEffect, useState } from 'react'

export interface CountdownSnapshot {
  expired: boolean
  totalRemainingMs: number
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function computeCountdown(
  deadlineIso: string | null,
  nowMs: number = Date.now(),
): CountdownSnapshot | null {
  if (deadlineIso === null) {
    return null
  }

  const targetMs = Date.parse(deadlineIso)
  if (Number.isNaN(targetMs)) {
    return null
  }

  const diffMs = targetMs - nowMs
  if (diffMs <= 0) {
    return {
      expired: true,
      totalRemainingMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  const totalSeconds = Math.floor(diffMs / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor((totalSeconds % 86_400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    expired: false,
    totalRemainingMs: diffMs,
    days,
    hours,
    minutes,
    seconds,
  }
}

export function formatDeadlineDisplay(deadlineIso: string): string {
  const date = new Date(deadlineIso)
  if (Number.isNaN(date.getTime())) {
    return deadlineIso
  }

  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date)
}

export function useLiveNow(intervalMs = 1000): number {
  const [nowMs, setNowMs] = useState<number>(() => Date.now())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now())
    }, intervalMs)

    return () => {
      window.clearInterval(timer)
    }
  }, [intervalMs])

  return nowMs
}
