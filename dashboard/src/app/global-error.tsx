'use client'

import { Button } from '@/src/components/landing-page/Button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-red-600">Une erreur est survenue !</h2>
          <Button
            className="mt-4"
            onClick={() => reset()}
          >
            Réesayer
          </Button>
        </div>
      </body>
    </html>
  )
} 