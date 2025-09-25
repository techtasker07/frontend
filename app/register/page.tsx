'use client'

import { Suspense } from 'react'
import { RegisterForm } from './register-form'
import Image from 'next/image'
import Link from 'next/link'

function RegisterPageContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Image src="/images/mipripity.png" alt="Mipripity Logo" width={48} height={48} className="mx-auto" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              sign in to your existing account
            </Link>
          </p>
        </div>

        <RegisterForm />
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterPageContent />
    </Suspense>
  )
}
