import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-1 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Image
                src="/images/mipripity.png"
                alt="MIPRIPITY Logo"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <h3 className="text-xl font-bold">MIPRIPITY</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Community-driven property evaluation and investment platform
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 MIPRIPITY by Techtasker Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
