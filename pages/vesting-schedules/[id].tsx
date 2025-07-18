'use client'

import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type UnlockEvent = {
  unlockDate: string
  amount: number
}

type Calculation = {
  runAt: string
  totalUnlocked: number
  totalLocked: number
  discountPercent: number
  discountedValue: number
  resultsJson: Array<{
    date: string
    unlockAmount: number
    premium: number
    discount: number
  }>
}

type Schedule = {
  id: string
  name: string
  totalQuantity: number
  purchasePrice?: number
  purchaseDate?: string
  unlockEvents: UnlockEvent[]
}

export default function ScheduleDetailPage() {
  
  const router = useRouter()
  const { id } = router.query as { id: string }

  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [calculation, setCalculation] = useState<Calculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        // 1) Fetch the schedule + its unlockEvents
        const schRes = await fetch(`/api/vesting-schedules/${id}`)
        if (!schRes.ok) throw new Error('Schedule fetch failed')
        const schData: Schedule = await schRes.json()

        // 2) Trigger / fetch the calculation via POST
        const calcRes = await fetch(`/api/vesting-schedules/${id}/calculate`, {
          method: 'POST',
        })
        if (!calcRes.ok) throw new Error('Calculation fetch failed')
        const calcData: Calculation = await calcRes.json()

        setSchedule(schData)
        setCalculation(calcData)
      } catch (err: any) {
        console.error(err)
        setError(err.message || 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) return <p className="p-6">Loading…</p>
  if (error)   return <p className="p-6 text-red-500">Error: {error}</p>
  if (!schedule) return <p className="p-6">No schedule found.</p>

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{schedule.name}</h1>
      <pre className="bg-gray-100 p-4 rounded">
        <strong>Schedule:</strong>{' '}
        {JSON.stringify(schedule, null, 2)}
        {'\n\n'}
        <strong>Calculation:</strong>{' '}
        {JSON.stringify(calculation, null, 2)}
      </pre>
    </main>
  )
}