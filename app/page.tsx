"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api, type Property, type ProspectProperty } from "@/lib/api"
import { Search, MapPin, Plus, Building, Zap, Globe, TrendingUp, Lightbulb, ArrowRight, Star } from "lucide-react"
import { toast } from "sonner"

const categories = [
  { value: "all", label: "All Categories" },
  { value: "Residential", label: "Residential" },
  { value: "Commercial", label: "Commercial" },
  { value: "Land", label: "Land" },
  { value: "Material", label: "Material" },
]

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [prospectProperties, setProspectProperties] = useState<ProspectProperty[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [loadingProspectProperties, setLoadingProspectProperties] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchProperties()
    fetchProspectProperties()
  }, [selectedCategory])

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true)
      const params: {
        category?: string
        limit?: number
        offset?: number
      } = { limit: 6 }
      if (selectedCategory !== "all") {
        params.category = selectedCategory
      }
      const response = await api.getProperties(params)
      if (response.success) {
        setProperties(response.data)
      } else {
        toast.error(response.error || "Error fetching properties. Please try again later.")
      }
    } catch (error) {
      toast.error("Error fetching properties. Please check your connection and try again.")
    } finally {
      setLoadingProperties(false)
    }
  }

  const fetchProspectProperties = async () => {
    try {
      setLoadingProspectProperties(true)
      const response = await api.getProspectProperties({ limit: 6 })
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

  const filteredProperties = properties.filter((property) =>
    [property.title, property.location, property.description].some((text) =>
      text?.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Subtle Grid Pattern */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      ></div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Enhanced Hero Section */}
        <section className="text-center mb-20 py-24">
          <div className="relative">
            <h2 className="text-6xl md:text-7xl font-extrabold tracking-wide uppercase 
                          bg-gradient-to-r from-[#000080] to-[#F39322] 
                          bg-clip-text text-transparent 
                          drop-shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
              MIPRIPITY
            </h2>

            {/* Glow line under text */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-2/3 h-[3px] 
                            bg-gradient-to-r from-transparent via-[#F39322] to-transparent 
                            blur-sm opacity-60">
            </div>
          </div>
          
          <p className="text-lg md:text-xl text-slate-700 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Revolutionary property evaluation platform, powered by
            <br />
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Techtasker Solutions
            </span>
          </p>
        </section>

        {/* AI-Powered Prospect Properties Section */}
        <section className="mb-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm font-medium text-purple-800 mb-4">
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-500" />
              AI-Powered Intelligence
            </div>
            <h4 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Property Prospects
            </h4>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
              Discover investment opportunities with intelligent AI suggestions and comprehensive market analysis
            </p>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
          </div>

          {loadingProspectProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
                  <CardContent className="p-0">
                    <div className="h-56 bg-gradient-to-br from-purple-100 to-pink-100 rounded-t-xl"></div>
                    <div className="p-6 space-y-4">
                      <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded-lg w-1/2"></div>
                      <div className="h-8 bg-slate-200 rounded-lg w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : prospectProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {prospectProperties.map((property, index) => (
                  <Card
                    key={property.id}
                    className="group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden cursor-pointer"
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                    onClick={() => (window.location.href = `/prospectProperties/${property.id}`)}
                  >
                    <CardContent className="p-0">
                      <div className="relative overflow-hidden">
                        {property.image_url ? (
                          <Image
                            src={property.image_url || "/placeholder.svg"}
                            alt={property.title}
                            width={400}
                            height={224}
                            className="object-cover w-full h-56 group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => (e.currentTarget.src = "/placeholder.svg")}
                          />
                        ) : (
                          <div className="h-56 bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-purple-400 group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-500">
                            <Building className="h-16 w-16" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                            <Lightbulb className="w-3 h-3 mr-1" />
                            AI Prospects
                          </Badge>
                        </div>
                        <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <div className="flex items-center text-white text-sm font-medium">
                            <ArrowRight className="w-4 h-4 mr-1" />
                            View AI Analysis
                          </div>
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-purple-600 transition-colors mb-2 line-clamp-1">
                            {property.title}
                          </h3>
                          <div className="flex items-center text-slate-500 mb-3">
                            <MapPin className="h-4 w-4 mr-2 text-purple-400" />
                            <span className="line-clamp-1">{property.location}</span>
                          </div>
                        </div>

                        {property.estimated_worth && (
                          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                            <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text">
                              ₦{new Intl.NumberFormat("en-NG").format(property.estimated_worth)}
                            </p>
                            <p className="text-sm text-slate-500 mt-1">Estimated Worth</p>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <Badge variant="outline" className="text-purple-600 border-purple-200">
                            {property.category_name}
                          </Badge>
                          <div className="flex items-center text-sm text-slate-400">
                            <Zap className="h-3 w-3 mr-1 text-yellow-500" />
                            <span>AI Enhanced</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg"
                >
                  <Link href="/prospectProperties">
                    View All Prospect Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="text-center py-20">
                <div className="relative mb-8">
                  <Lightbulb className="h-24 w-24 text-purple-300 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-4">No Prospect Properties Yet</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  Be the first to add a property and unlock AI-powered investment insights and suggestions!
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Link href="/prospectProperties">
                    Explore AI Prospects
                    <Lightbulb className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Enhanced Properties Section */}
        <section className="mb-16">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-green-100 rounded-full text-sm font-medium text-blue-800 mb-4">
                <Building className="w-4 h-4 mr-2 text-blue-600" />
                Property Evaluation
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-6">
                Featured Properties
              </h2>
              <p className="text-xl text-slate-600 max-w-2xl">
                Browse through our curated collection of premium properties for comprehensive evaluation
              </p>
              <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-green-500 rounded-full mt-4"></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Link href="/add-property">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Property
                </Link>
              </Button>
            </div>
          </div>

          {/* Enhanced Search and Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-blue-500" />
              <Input
                placeholder="Search properties by title, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 h-14 text-lg shadow-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full lg:w-[280px] bg-white/90 backdrop-blur-sm border-slate-200 text-slate-700 focus:border-green-400 focus:ring-green-400/20 h-14 text-lg shadow-lg">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-slate-700 focus:bg-slate-100">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Properties Grid */}
          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded-lg w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-56 bg-slate-200 rounded-xl"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {filteredProperties.map((property, index) => (
                  <Card
                    key={property.id}
                    className="group bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden cursor-pointer"
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                    onClick={() => (window.location.href = `/properties/${property.id}`)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <CardTitle className="line-clamp-1 text-slate-800 group-hover:text-blue-600 transition-colors text-xl">
                          {property.title}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-blue-100 to-green-100 text-blue-800 border-0 shadow-sm"
                        >
                          {property.category_name || "Uncategorized"}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-500 flex items-center">
                        <MapPin className="inline-block h-4 w-4 mr-2 text-blue-400" />
                        {property.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link href={`/properties/${property.id}`} className="block mb-6">
                        <div className="relative overflow-hidden rounded-xl">
                          {property.images && property.images.length > 0 ? (
                            <Image
                              src={
                                property.images.find((img) => img.is_primary)?.image_url ||
                                property.images[0].image_url ||
                                "/placeholder.svg"
                              }
                              alt={property.title}
                              width={400}
                              height={240}
                              className="object-cover w-full h-56 group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="h-56 bg-gradient-to-br from-blue-100 to-green-100 flex items-center justify-center text-blue-400 rounded-xl group-hover:from-blue-200 group-hover:to-green-200 transition-all duration-500">
                              <Building className="h-16 w-16" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl"></div>
                          <div className="absolute top-4 right-4 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                          <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                            <div className="flex items-center text-white text-sm font-medium">
                              <ArrowRight className="w-4 h-4 mr-1" />
                              View Details
                            </div>
                          </div>
                        </div>
                      </Link>
                      <p className="text-slate-600 mt-4 line-clamp-2 leading-relaxed">{property.description}</p>
                      {property.current_worth && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                          <p className="text-2xl font-bold text-transparent bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text">
                            ₦{new Intl.NumberFormat("en-NG").format(property.current_worth)}
                          </p>
                          <p className="text-sm text-slate-500 mt-1">Current Market Value</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 px-8 py-4 text-lg"
                >
                  <Link href="/properties">
                    View All Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="text-center py-20">
                <div className="relative mb-8">
                  <Building className="h-24 w-24 text-blue-300 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-green-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-4">No Properties Found</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  No properties found for the selected category. Be the first to add one and start the evaluation
                  process!
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <Link href="/add-property">
                    Launch Your First Property
                    <Plus className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Enhanced Custom CSS for animations */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Smooth scroll behavior */
        html {
          scroll-behavior: smooth;
        }

        /* Enhanced card animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
