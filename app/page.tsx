"use client"

import { api, type Property, type ProspectProperty } from "@/lib/api"
import { MapPin, Building, Zap, Globe, Lightbulb } from "lucide-react"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"

const Page = () => {
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [prospectProperties, setProspectProperties] = useState<ProspectProperty[]>([])
  const [loadingProspectProperties, setLoadingProspectProperties] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined)

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true)
      const response = await api.getProperties({
        limit: 8,
        category: selectedCategory || undefined,
      })
      if (response.success) {
        setProperties(response.data)
      } else {
        console.error("Error fetching properties:", response.error)
      }
    } catch (error) {
      console.error("Error fetching properties:", error)
    } finally {
      setLoadingProperties(false)
    }
  }

  const fetchProspectProperties = async () => {
    try {
      setLoadingProspectProperties(true)
      const response = await api.getProspectProperties({ limit: 8 })
      if (response.success) {
        setProspectProperties(response.data)
      } else {
        console.error("Error fetching prospect properties:", response.error)
      }
    } catch (error) {
      console.error("Error fetching prospect properties:", error)
    } finally {
      setLoadingProspectProperties(false)
    }
  }

  useEffect(() => {
    fetchProperties()
    fetchProspectProperties()
  }, [selectedCategory])

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-cover bg-center h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">Welcome to Property Finder</h1>
          <p className="text-xl mb-8">Discover your dream home with ease</p>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 shadow-lg shadow-pink-500/25 transition-all duration-300 hover:shadow-pink-500/40 hover:scale-105 text-white"
          >
            <Link href="/properties">Explore Properties</Link>
          </Button>
        </div>
      </section>

      {/* Prospect Properties Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              AI-Powered Property Prospects
            </h2>
            <p className="text-gray-600 mb-4">Discover investment opportunities with intelligent suggestions</p>
            <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 border-0 shadow-lg shadow-pink-500/25 transition-all duration-300 hover:shadow-pink-500/40 hover:scale-105 text-white"
          >
            <Link href="/prospectProperties">View All Prospect Properties</Link>
          </Button>
        </div>

        {loadingProspectProperties ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="flex-shrink-0 w-80 bg-white/80 backdrop-blur-sm border border-gray-200 animate-pulse"
              >
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : prospectProperties.length > 0 ? (
          <div className="relative">
            <div
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
              style={{
                scrollSnapType: "x mandatory",
                scrollbarWidth: "thin",
                scrollbarColor: "#a855f7 transparent",
              }}
            >
              {prospectProperties.map((property, index) => (
                <Card
                  key={property.id}
                  className="flex-shrink-0 w-80 group bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-purple-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2 overflow-hidden cursor-pointer"
                  style={{
                    scrollSnapAlign: "start",
                    animationDelay: `${index * 100}ms`,
                  }}
                  onClick={() => (window.location.href = `/prospectProperties/${property.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      {property.image_url ? (
                        <Image
                          src={property.image_url || "/placeholder.svg"}
                          alt={property.title}
                          width={320}
                          height={192}
                          className="object-cover w-full h-48 group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-400 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
                          <Building className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                          AI Prospects
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600 transition-colors line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-purple-400" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      </div>

                      {property.estimated_worth && (
                        <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
                          <p className="text-lg font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                            ₦{new Intl.NumberFormat("en-NG").format(property.estimated_worth)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Estimated Worth</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{property.category_name}</span>
                        <div className="flex items-center">
                          <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                          <span>AI Powered</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {prospectProperties.slice(0, 4).map((_, index) => (
                <div key={index} className="w-2 h-2 bg-purple-300 rounded-full"></div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="text-center py-16">
              <div className="relative mb-8">
                <Lightbulb className="h-20 w-20 text-purple-300 mx-auto" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Prospect Properties Yet</h3>
              <p className="text-gray-500 mb-6">
                Be the first to add a property and get AI-powered investment suggestions!
              </p>
              <Button
                asChild
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg shadow-purple-500/25"
              >
                <Link href="/prospectProperties">Explore Prospects</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Properties Section */}
      <section className="mb-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">
              Featured Properties
            </h2>
            <p className="text-gray-600 mb-4">Browse through our curated list of properties</p>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-green-500 rounded-full"></div>
          </div>
          <Button
            asChild
            className="bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 border-0 shadow-lg shadow-green-500/25 transition-all duration-300 hover:shadow-green-500/40 hover:scale-105 text-white"
          >
            <Link href="/properties">View All Properties</Link>
          </Button>
        </div>

        {loadingProperties ? (
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <Card
                key={i}
                className="flex-shrink-0 w-80 bg-white/80 backdrop-blur-sm border border-gray-200 animate-pulse"
              >
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-300 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="relative">
            <div
              className="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
              style={{
                scrollSnapType: "x mandatory",
                scrollbarWidth: "thin",
                scrollbarColor: "#16a34a transparent",
              }}
            >
              {properties.map((property, index) => (
                <Card
                  key={property.id}
                  className="flex-shrink-0 w-80 group bg-white/80 backdrop-blur-sm border border-gray-200 hover:border-blue-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-2 overflow-hidden cursor-pointer"
                  style={{
                    scrollSnapAlign: "start",
                    animationDelay: `${index * 100}ms`,
                  }}
                  onClick={() => (window.location.href = `/properties/${property.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      {property.image_url ? (
                        <Image
                          src={property.image_url || "/placeholder.svg"}
                          alt={property.title}
                          width={320}
                          height={192}
                          className="object-cover w-full h-48 group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                        />
                      ) : (
                        <div className="h-48 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-blue-400 group-hover:from-blue-200 group-hover:to-green-200 transition-all duration-300">
                          <Building className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gradient-to-r from-blue-500 to-green-500 text-white border-0">
                          Featured
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {property.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="h-3 w-3 mr-1 text-blue-400" />
                          <span className="line-clamp-1">{property.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{property.category_name}</span>
                        <div className="flex items-center">
                          <Globe className="h-3 w-3 mr-1 text-blue-500" />
                          <span>Global</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scroll indicator */}
            <div className="flex justify-center mt-4 space-x-2">
              {properties.slice(0, 4).map((_, index) => (
                <div key={index} className="w-2 h-2 bg-blue-300 rounded-full"></div>
              ))}
            </div>
          </div>
        ) : (
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-200">
            <CardContent className="text-center py-16">
              <div className="relative mb-8">
                <Building className="h-20 w-20 text-blue-300 mx-auto" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Properties Found</h3>
              <p className="text-gray-500 mb-6">Please select a different category or try again later.</p>
              <Button
                asChild
                className="bg-gradient-to-r from-blue-500 to-green-600 hover:from-blue-600 hover:to-green-700 shadow-lg shadow-green-500/25"
              >
                <Link href="/properties">Explore Properties</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Custom CSS for scrollbar styling */}
      <style jsx>{`
        /* Webkit browsers */
        ::-webkit-scrollbar {
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(90deg, #a855f7, #ec4899);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(90deg, #9333ea, #db2777);
        }
      `}</style>
    </div>
  )
}

export default Page
