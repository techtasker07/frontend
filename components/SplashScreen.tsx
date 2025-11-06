'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

interface SplashScreenProps {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Auto-hide after 3 seconds or when video ends
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, 5000)

    return () => clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Video Background */}
      <video
        autoPlay
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        onEnded={() => {
          setIsVisible(false)
          onComplete()
        }}
      >
        <source src="/splashmedia.mp4" type="video/mp4" />
      </video>

      {/* Overlay to ensure logo is visible */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* Logo positioned below center */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="mt-20"> {/* Push down from center */}
          <Image
            src="/logo192.png"
            alt="Mipripity Logo"
            width={100}
            height={100}
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  )
}