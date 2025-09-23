"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft, 
  ArrowRight, 
  X, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  Users, 
  Target, 
  Shield, 
  FileText, 
  Calendar as CalendarIcon,
  CreditCard,
  CheckCircle,
  AlertTriangle,
  Camera,
  Building,
  Bookmark,
  Heart,
  Share2,
  Download,
  Phone,
  Mail,
  MapPin,
  Zap
} from "lucide-react"
import { formatCompactCurrency } from "@/lib/currency"
import type { DetailedProspect, PropertyValuation } from "@/lib/advanced-ai-valuator"

interface BossRequiredProspectDetailsProps {
  prospect: DetailedProspect
  valuation: PropertyValuation
  propertyImage?: string
  onBack: () => void
  onClose: () => void
  onRetake: () => void
  onSaveToFavorites: () => void
  onShare: () => void
}

// Time slots for consultation booking
const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
]

// Consultation types
const CONSULTATION_TYPES = [
  { id: 'basic', name: 'Basic Consultation (30 min)', price: 25000, description: 'Property overview and initial guidance' },
  { id: 'detailed', name: 'Detailed Analysis (60 min)', price: 50000, description: 'Comprehensive property analysis and business plan review' },
  { id: 'premium', name: 'Premium Package (2 hours)', price: 100000, description: 'Full consultation with market research and implementation roadmap' }
]

export function BossRequiredProspectDetails({
  prospect,
  valuation,
  propertyImage,
  onBack,
  onClose,
  onRetake,
  onSaveToFavorites,
  onShare
}: BossRequiredProspectDetailsProps) {
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [selectedConsultationType, setSelectedConsultationType] = useState<string>("")
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false)
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  
  const selectedConsultation = CONSULTATION_TYPES.find(c => c.id === selectedConsultationType)

  const handleBookConsultation = () => {
    if (!selectedDate || !selectedTime || !selectedConsultationType) {
      alert('Please select date, time, and consultation type')
      return
    }
    setIsBookingDialogOpen(true)
  }

  const processPayment = async () => {
    if (!selectedConsultation) return
    
    setIsPaymentProcessing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    alert(`Consultation booked successfully! 
    
Type: ${selectedConsultation.name}
Date: ${selectedDate?.toLocaleDateString()}
Time: ${selectedTime}
Amount: ₦${selectedConsultation.price.toLocaleString()}

You will receive a confirmation email shortly.`)
    
    setIsPaymentProcessing(false)
    setIsBookingDialogOpen(false)
  }

  const getRiskBadgeColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'  
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-pink-50 relative">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-purple-200">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center flex-1 min-w-0">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack}
              className="h-9 w-9 p-0 hover:bg-blue-100 mr-3 flex-shrink-0"
            >
              <ArrowLeft className="h-5 w-5 text-blue-600" />
            </Button>
            <Building className="mr-3 h-6 w-6 text-purple-600 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent truncate">
                {prospect.title}
              </h1>
              <p className="text-sm text-gray-600 truncate">
                Prospect Details & Business Plan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSaveToFavorites}
              className="h-9 w-9 p-0 hover:bg-pink-100 flex-shrink-0"
              title="Save to Favorites"
            >
              <Heart className="h-5 w-5 text-pink-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onShare}
              className="h-9 w-9 p-0 hover:bg-green-100 flex-shrink-0"
              title="Share"
            >
              <Share2 className="h-5 w-5 text-green-600" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="h-9 w-9 p-0 hover:bg-red-100 flex-shrink-0"
            >
              <X className="h-5 w-5 text-red-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 max-w-6xl mx-auto">
        
        {/* Current Property Value Card */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <DollarSign className="mr-2 h-5 w-5" />
              Current Property Financial Value
            </CardTitle>
            <p className="text-green-700 text-sm">
              Your property's estimated worth as-is, before any development
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-800">
                  {formatCompactCurrency(valuation.currentValue)}
                </p>
                <p className="text-sm text-green-600">Current Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-700">
                  {formatCompactCurrency(valuation.marketValue)}
                </p>
                <p className="text-sm text-green-600">Market Value</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-semibold text-green-600">
                  {valuation.appreciationRate.toFixed(1)}%
                </p>
                <p className="text-sm text-green-600">Annual Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prospect Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Sample Images */}
          <Card className="border-2 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5 text-purple-600" />
                Sample Images of Prospect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Main image display */}
                <div className="relative">
                  <img
                    src={prospect.sampleImages[activeImageIndex] || '/placeholder-prospect.jpg'}
                    alt={`${prospect.title} sample ${activeImageIndex + 1}`}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  <Badge className="absolute top-3 left-3 bg-white/90 text-gray-800">
                    Sample {activeImageIndex + 1} of {prospect.sampleImages.length}
                  </Badge>
                </div>
                
                {/* Image thumbnails */}
                {prospect.sampleImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {prospect.sampleImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-16 rounded border-2 overflow-hidden ${
                          activeImageIndex === index ? 'border-purple-400' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
                Investment Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-lg font-bold text-blue-800">
                    {formatCompactCurrency(prospect.estimatedCost)}
                  </p>
                  <p className="text-xs text-blue-600">Implementation Cost</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-lg font-bold text-green-800">
                    {prospect.expectedROI.toFixed(1)}%
                  </p>
                  <p className="text-xs text-green-600">Expected ROI</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-lg font-bold text-purple-800">
                    {prospect.paybackPeriod} years
                  </p>
                  <p className="text-xs text-purple-600">Payback Period</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-lg font-bold text-orange-800">
                    {formatCompactCurrency(prospect.monthlyIncome)}
                  </p>
                  <p className="text-xs text-orange-600">Monthly Income</p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Risk Level:</span>
                  <Badge className={getRiskBadgeColor(prospect.riskLevel)}>
                    {prospect.riskLevel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-600">Success Rate:</span>
                  <span className="text-sm font-medium text-green-600">
                    {prospect.successProbability.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analysis Tabs */}
        <Card className="border-2 border-purple-200">
          <CardContent className="p-6">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                <TabsTrigger value="description">Description</TabsTrigger>
                <TabsTrigger value="financials">Costs & ROI</TabsTrigger>
                <TabsTrigger value="business-plan">Business Plan</TabsTrigger>
                <TabsTrigger value="implementation">Implementation</TabsTrigger>
              </TabsList>

              {/* Brief & Detailed Description */}
              <TabsContent value="description" className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-purple-600" />
                    Brief Description of Prospect
                  </h3>
                  <p className="text-gray-700 bg-purple-50 p-4 rounded-lg">
                    {prospect.briefDescription}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Detailed Analysis</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {prospect.detailedDescription}
                  </p>
                </div>

                <Alert className="border-blue-200 bg-blue-50">
                  <Zap className="h-4 w-4 text-blue-600" />
                  <AlertDescription>
                    <strong className="text-blue-800">Implementation Timeframe:</strong>
                    <br />
                    <span className="text-blue-700">
                      This prospect can be realized in approximately <strong>{prospect.implementationTimeframe}</strong>
                    </span>
                  </AlertDescription>
                </Alert>
              </TabsContent>

              {/* Cost Analysis & ROI */}
              <TabsContent value="financials" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                    Estimated Cost to Actualize the Prospect
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h4 className="font-semibold text-red-800 mb-2">Implementation Costs</h4>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCompactCurrency(prospect.implementationCost)}
                      </p>
                      <p className="text-sm text-red-600 mt-1">Direct development costs</p>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-2">Total Investment</h4>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCompactCurrency(prospect.totalInvestment)}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">Including property value</p>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">Expected Return on Investment</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xl font-bold text-green-600">
                          {prospect.expectedROI.toFixed(1)}%
                        </p>
                        <p className="text-sm text-green-600">Annual ROI</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-600">
                          {formatCompactCurrency(prospect.monthlyIncome)}
                        </p>
                        <p className="text-sm text-green-600">Monthly Income</p>
                      </div>
                      <div>
                        <p className="text-xl font-bold text-green-600">
                          {prospect.paybackPeriod} years
                        </p>
                        <p className="text-sm text-green-600">Break-even Time</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Implementation Phases */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-orange-600" />
                    How Long It Could Take to Actualize
                  </h3>
                  
                  <div className="space-y-3">
                    {prospect.phases.map((phase, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-800">
                            Phase {index + 1}: {phase.name}
                          </h4>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">{phase.description}</p>
                        <p className="text-sm font-medium text-green-600">
                          Cost: {formatCompactCurrency(phase.cost)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Business Plan Model */}
              <TabsContent value="business-plan" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Target className="mr-2 h-5 w-5 text-purple-600" />
                    Business Plan Model
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Revenue Streams */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 mb-3">Revenue Streams</h4>
                      <ul className="space-y-2">
                        {prospect.businessModel.revenueStreams.map((stream, index) => (
                          <li key={index} className="flex items-center text-sm text-green-700">
                            <CheckCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                            {stream}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Target Market */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-800 mb-3">Target Market</h4>
                      <p className="text-blue-700 text-sm">{prospect.businessModel.targetMarket}</p>
                      <div className="mt-3">
                        <p className="text-xs text-blue-600">Market Size</p>
                        <p className="text-lg font-bold text-blue-800">
                          {formatCompactCurrency(prospect.businessModel.marketSize)}
                        </p>
                      </div>
                    </div>

                    {/* Competitive Advantage */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-3">Competitive Advantage</h4>
                      <p className="text-purple-700 text-sm">
                        {prospect.businessModel.competitiveAdvantage}
                      </p>
                    </div>

                    {/* Risk Assessment */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <h4 className="font-semibold text-orange-800 mb-3">Risk Assessment</h4>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-orange-600 mb-1">Risk Factors:</p>
                          {prospect.businessModel.riskFactors.map((risk, index) => (
                            <div key={index} className="flex items-center text-xs text-orange-700">
                              <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                              {risk}
                            </div>
                          ))}
                        </div>
                        <div>
                          <p className="text-xs text-green-600 mb-1">Mitigation:</p>
                          {prospect.businessModel.mitigation.map((mit, index) => (
                            <div key={index} className="flex items-center text-xs text-green-700">
                              <Shield className="h-3 w-3 mr-1 flex-shrink-0" />
                              {mit}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Implementation Details */}
              <TabsContent value="implementation" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Requirements & Permits */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <FileText className="mr-2 h-4 w-4" />
                      Requirements & Permits
                    </h4>
                    <ul className="space-y-2">
                      {prospect.requirementsAndPermits.map((req, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Key Suppliers */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Users className="mr-2 h-4 w-4" />
                      Key Suppliers
                    </h4>
                    <ul className="space-y-2">
                      {prospect.keySuppliers.map((supplier, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <Building className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                          {supplier}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Marketing Strategy */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Marketing Strategy
                    </h4>
                    <ul className="space-y-2">
                      {prospect.marketingStrategy.map((strategy, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <Target className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                          {strategy}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Operational Plan */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Operational Plan
                    </h4>
                    <ul className="space-y-2">
                      {prospect.operationalPlan.map((plan, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-700">
                          <Zap className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                          {plan}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Consultation Booking Section */}
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center text-green-800">
              <CalendarIcon className="mr-2 h-5 w-5" />
              Book Consultation
            </CardTitle>
            <p className="text-green-700 text-sm">
              Schedule a consultation with our experts to discuss this prospect in detail
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Consultation Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Consultation Type *
              </label>
              <Select value={selectedConsultationType} onValueChange={setSelectedConsultationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose consultation type" />
                </SelectTrigger>
                <SelectContent>
                  {CONSULTATION_TYPES.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div>
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs text-gray-500">₦{type.price.toLocaleString()} - {type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date *
                </label>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date() || date.getDay() === 0}
                  className="rounded-md border bg-white"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Time *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                      className="text-sm"
                    >
                      {time}
                    </Button>
                  ))}
                </div>

                {selectedConsultationType && selectedDate && selectedTime && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">Consultation Summary</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p><strong>Type:</strong> {selectedConsultation?.name}</p>
                      <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                      <p><strong>Time:</strong> {selectedTime}</p>
                      <p><strong>Fee:</strong> ₦{selectedConsultation?.price.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <Button 
                onClick={handleBookConsultation}
                disabled={!selectedDate || !selectedTime || !selectedConsultationType}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                Book Consultation
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Dialog */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <CreditCard className="mr-2 h-5 w-5 text-green-600" />
                Confirm & Pay
              </DialogTitle>
            </DialogHeader>
            
            {selectedConsultation && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Consultation Details</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Service:</strong> {selectedConsultation.name}</p>
                    <p><strong>Date:</strong> {selectedDate?.toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {selectedTime}</p>
                    <p><strong>Prospect:</strong> {prospect.title}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-green-600">₦{selectedConsultation.price.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsBookingDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={processPayment}
                    disabled={isPaymentProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isPaymentProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pay & Book
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>

      {/* Bottom Actions */}
      <div className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-sm border-t border-purple-200 p-4">
        <div className="flex gap-3 max-w-6xl mx-auto">
          <Button 
            onClick={onBack}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Prospects
          </Button>
          
          <Button 
            onClick={onRetake}
            variant="outline"
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Camera className="mr-2 h-4 w-4" />
            Retake Image
          </Button>

          <div className="flex-1" />
          
          <Button 
            onClick={onSaveToFavorites}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Bookmark className="mr-2 h-4 w-4" />
            Save Results
          </Button>
        </div>
      </div>
    </div>
  )
}
