'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { api, Property } from '@/lib/api'
import { Search, MapPin, Plus, Building, Zap, Globe, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

const categories = [
  { value: 'all', label: 'All Categories' },
  { value: 'Residential', label: 'Residential' },
  { value: 'Commercial', label: 'Commercial' },
  { value: 'Land', label: 'Land' },
  { value: 'Material', label: 'Material' },
]

export default function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchProperties()
  }, [selectedCategory])

  const fetchProperties = async () => {
    try {
      setLoadingProperties(true)

      const params: {
        category?: string
        limit?: number
        offset?: number
      } = {}

      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }

      const response = await api.getProperties(params)

      if (response.success) {
        setProperties(response.data)
      } else {
        toast.error(response.error || 'Error fetching properties. Please try again later.')
      }
    } catch (error) {
      toast.error('Error fetching properties. Please check your connection and try again.')
    } finally {
      setLoadingProperties(false)
    }
  }

  const filteredProperties = properties.filter((property) =>
    [property.title, property.location, property.description].some((text) =>
      text?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>

      <div className="relative container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16 py-20">
          <div className="relative">
            <h1 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
              MIPRIPITY
            </h1>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-sm"></div>
          </div>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Next-generation property evaluation platform powered by Techtasker Solutions
          </p>
          <div className="flex justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full">
              <Zap className="h-4 w-4 text-yellow-400" />
              <span className="text-slate-300">Lightning Fast</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full">
              <Globe className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300">Global Network</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-slate-300">AI Powered</span>
            </div>
          </div>
        </section>

        {/* Properties Section */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent mb-2">
                Properties for Evaluation
              </h2>
              <div className="h-1 w-32 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full"></div>
            </div>
            <Button 
              asChild 
              className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 border-0 shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-purple-500/40 hover:scale-105"
            >
              <Link href="/add-property">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          </div>

          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5 transition-colors group-focus-within:text-cyan-400" />
              <Input
                placeholder="Search properties in the metaverse..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-100 placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300 h-12"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[240px] bg-slate-800/50 backdrop-blur-sm border-slate-700 text-slate-100 focus:border-purple-400 focus:ring-purple-400/20 h-12">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-slate-100 focus:bg-slate-700">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* Properties Grid */}
        <section className="mb-12">
          {loadingProperties ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="bg-slate-800/30 backdrop-blur-sm border-slate-700 animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-slate-700 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-700 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 bg-slate-700 rounded-lg"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property, index) => (
                <Card 
                  key={property.id} 
                  className="group bg-slate-800/30 backdrop-blur-sm border-slate-700 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2 overflow-hidden"
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="line-clamp-1 text-slate-100 group-hover:text-cyan-400 transition-colors">
                        {property.title}
                      </CardTitle>
                      <Badge 
                        variant="secondary" 
                        className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 text-slate-200 border border-slate-600"
                      >
                        {property.category_name || 'Uncategorized'}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      <MapPin className="inline-block h-3 w-3 mr-1 text-cyan-400" />
                      {property.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link href={`/properties/${property.id}`} className="block mb-4">
                      <div className="relative overflow-hidden rounded-lg">
                        {property.images && property.images.length > 0 ? (
                          <Image
                            src={
                              property.images.find((img) => img.is_primary)?.image_url ||
                              property.images[0].image_url
                            }
                            alt={property.title}
                            width={400}
                            height={240}
                            className="object-cover w-full h-48 group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="h-48 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-slate-500 rounded-lg group-hover:from-slate-600 group-hover:to-slate-700 transition-all duration-300">
                            <Building className="h-12 w-12" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute top-2 right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    </Link>
                    <p className="text-sm text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                      {property.description}
                    </p>
                    {property.current_worth && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-green-500/10 to-cyan-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-lg font-bold text-transparent bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text">
                          ₦{new Intl.NumberFormat('en-NG').format(property.current_worth)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">Current Market Value</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-slate-800/30 backdrop-blur-sm border-slate-700">
              <CardContent className="text-center py-16">
                <div className="relative mb-8">
                  <Building className="h-20 w-20 text-slate-600 mx-auto" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Properties Found</h3>
                <p className="text-slate-500 mb-6">
                  No properties found for the selected category. Be the first to add one!
                </p>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 shadow-lg shadow-purple-500/25"
                >
                  <Link href="/add-property">Launch Your First Property</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </section>
      </div>

      {/* Custom CSS for animations */}
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
      `}</style>
    </div>
  )
}