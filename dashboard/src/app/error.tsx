'use client'

import { useEffect } from 'react'
import { Button } from '@/src/components/landing-page/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
      <Button
        className="mt-4"
        onClick={() => reset()}
      >
        Try again
      </Button>
    </div>
  )
} 