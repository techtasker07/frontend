'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Map,
  BarChart3,
  Building,
  Newspaper,
  CheckCircle,
  Clock,
  ArrowRight,
  Info,
  Users,
  Shield,
  Award,
  ChevronLeft,
  ChevronRight,
  MousePointer,
  Upload,
  FileCheck
} from 'lucide-react';
import { SurveyPlanSection } from '@/components/documentations/SurveyPlanSection';
import { CertificateOfOccupancySection } from '@/components/documentations/CertificateOfOccupancySection';
import { GazetteSection } from '@/components/documentations/GazetteSection';
import { SurveyChartSection } from '@/components/documentations/SurveyChartSection';
import { LayoutSurveySection } from '@/components/documentations/LayoutSurveySection';
import { ServiceDetailsModal } from '@/components/documentations/ServiceDetailsModal';

const documentSections = [
  {
    id: 'survey-plan',
    title: 'Survey Plan',
    description: 'Process and file survey plans for land documentation',
    icon: FileText,
    component: SurveyPlanSection,
    color: 'bg-blue-500',
    features: ['Fresh Survey Processing', 'Existing Coordinates', 'Direct Verification', 'Point Retaking']
  },
  {
    id: 'layout-survey',
    title: 'Layout Survey',
    description: 'Create and verify property layout surveys',
    icon: Map,
    component: LayoutSurveySection,
    color: 'bg-green-500',
    features: ['Multi-plot Layouts', 'Zoning Compliance', 'Development Planning', 'Boundary Verification']
  },
  {
    id: 'survey-chart',
    title: 'Chart Survey',
    description: 'Interactive survey charting with coordinate plotting',
    icon: BarChart3,
    component: SurveyChartSection,
    color: 'bg-purple-500',
    features: ['Interactive Mapping', 'Coordinate Plotting', 'Data Export', 'Point Management']
  },
  {
    id: 'certificate-occupancy',
    title: 'Certificate of Occupancy',
    description: 'Building approval and occupancy certificates',
    icon: Building,
    component: CertificateOfOccupancySection,
    color: 'bg-orange-500',
    features: ['Coming Soon'],
    comingSoon: true
  },
  {
    id: 'gazette',
    title: 'Gazette Services',
    description: 'Legal publications and property notices',
    icon: Newspaper,
    component: GazetteSection,
    color: 'bg-red-500',
    features: ['Coming Soon'],
    comingSoon: true
  }
];

// Animated illustrations for each step
const ChooseServiceIllustration = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-full h-48 mb-6 flex items-center justify-center">
    <div className={`absolute transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
      {/* Document cards */}
      <div className="relative">
        <div className="absolute -left-16 top-0 w-20 h-24 bg-blue-100 rounded-lg transform -rotate-12 transition-transform duration-500"
             style={{ animation: isActive ? 'float 3s ease-in-out infinite' : 'none' }}>
          <FileText className="w-8 h-8 text-blue-600 mx-auto mt-8" />
        </div>
        <div className="absolute left-0 top-0 w-20 h-24 bg-green-100 rounded-lg transition-transform duration-500"
             style={{ animation: isActive ? 'float 3s ease-in-out infinite 0.5s' : 'none' }}>
          <FileText className="w-8 h-8 text-green-600 mx-auto mt-8" />
        </div>
        <div className="absolute left-16 top-0 w-20 h-24 bg-purple-100 rounded-lg transform rotate-12 transition-transform duration-500"
             style={{ animation: isActive ? 'float 3s ease-in-out infinite 1s' : 'none' }}>
          <FileText className="w-8 h-8 text-purple-600 mx-auto mt-8" />
        </div>
      </div>
      {/* Cursor */}
      <MousePointer className="absolute -bottom-6 right-0 w-8 h-8 text-blue-600"
                    style={{ animation: isActive ? 'pointer 2s ease-in-out infinite' : 'none' }} />
    </div>
  </div>
);

const ProvideInfoIllustration = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-full h-48 mb-6 flex items-center justify-center">
    <div className={`absolute transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
      {/* Form lines */}
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2"
               style={{ animation: isActive ? `slideIn 0.5s ease-out ${i * 0.2}s both` : 'none' }}>
            <div className="w-32 h-3 bg-gray-200 rounded"></div>
            <div className="w-16 h-3 bg-green-400 rounded"
                 style={{ animation: isActive ? `fill 1s ease-out ${1 + i * 0.3}s both` : 'none' }}></div>
          </div>
        ))}
      </div>
      {/* Upload icon */}
      <Upload className="absolute -right-8 top-1/2 transform -translate-y-1/2 w-10 h-10 text-green-600"
              style={{ animation: isActive ? 'bounce 2s ease-in-out infinite 1.5s' : 'none' }} />
    </div>
  </div>
);

const CertifiedResultsIllustration = ({ isActive }: { isActive: boolean }) => (
  <div className="relative w-full h-48 mb-6 flex items-center justify-center">
    <div className={`absolute transition-all duration-700 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
      {/* Certificate */}
      <div className="relative w-40 h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg"
           style={{ animation: isActive ? 'certSlideIn 1s ease-out' : 'none' }}>
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
          <Award className="w-8 h-8 text-purple-600" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 space-y-1">
          <div className="h-2 bg-purple-200 rounded"></div>
          <div className="h-2 bg-purple-200 rounded w-3/4"></div>
        </div>
      </div>
      {/* Checkmark */}
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
           style={{ animation: isActive ? 'checkPop 0.5s ease-out 1.2s both' : 'none' }}>
        <FileCheck className="w-7 h-7 text-white" />
      </div>
      {/* Sparkles */}
      {isActive && [
        { top: '10%', left: '0%', delay: '1.5s' },
        { top: '70%', left: '10%', delay: '1.7s' },
        { top: '20%', right: '5%', delay: '1.9s' }
      ].map((pos, i) => (
        <div key={i} className="absolute w-2 h-2 bg-yellow-400 rounded-full"
             style={{ 
               ...pos,
               animation: `sparkle 1.5s ease-out ${pos.delay} infinite`
             }} />
      ))}
    </div>
  </div>
);

// How It Works Carousel Component
const HowItWorksCarousel = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const steps = [
    {
      icon: FileText,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      title: "Choose Your Service",
      number: "1",
      description: "Select from our comprehensive range of land documentation and surveying services tailored to your specific needs.",
      illustration: ChooseServiceIllustration
    },
    {
      icon: Users,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      title: "Provide Information",
      number: "2",
      description: "Fill in your property details, upload required documents, and specify your service requirements with our guided forms.",
      illustration: ProvideInfoIllustration
    },
    {
      icon: Award,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
      title: "Get Certified Results",
      number: "3",
      description: "Receive professionally processed documents with official certification, ready for legal and governmental use.",
      illustration: CertifiedResultsIllustration
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setDirection(1);
      setActiveStep((prev) => (prev + 1) % 3);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const goToStep = (index: number) => {
    setDirection(index > activeStep ? 1 : -1);
    setActiveStep(index);
  };

  const goToPrev = () => {
    setDirection(-1);
    setActiveStep((prev) => (prev - 1 + 3) % 3);
  };

  const goToNext = () => {
    setDirection(1);
    setActiveStep((prev) => (prev + 1) % 3);
  };

  const currentStep = steps[activeStep];
  const Illustration = currentStep.illustration;

  return (
    <div className="mb-8 md:mb-12">
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pointer {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-5px, -5px); }
        }
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes fill {
          from { width: 0; }
          to { width: 4rem; }
        }
        @keyframes certSlideIn {
          from { transform: translateY(20px) scale(0.8); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes checkPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInReverse {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>

      <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-0">
        How It Works
      </h2>
      
      <div className="max-w-4xl mx-auto">
        {/* Main Carousel Card */}
        <Card className="relative overflow-hidden bg-transparent border-none shadow-none">
          <CardContent className="pt-1 pb-1 px-6 md:px-12 bg-transparent">
            {/* Illustration */}
            <Illustration isActive={true} />
            
            {/* Content with fade transition */}
            <div key={activeStep} className="text-center" style={{ animation: direction > 0 ? 'fadeIn 0.7s ease-out' : 'fadeInReverse 0.7s ease-out' }}>
              {/* Step number badge */}
              <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 text-white rounded-full text-xl font-bold mb-2">
                {currentStep.number}
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-gray-900">
                {currentStep.title}
              </h3>
              
              <p className="text-sm md:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Previous step"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600" />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
              aria-label="Next step"
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </CardContent>
        </Card> 
      </div>
    </div>
  );
};

export default function DocumentationsPage() {
  const [showProcessForm, setShowProcessForm] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedServiceForModal, setSelectedServiceForModal] = useState<any>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
  };

  const handleBackToOverview = () => {
    setSelectedSection(null);
    setShowProcessForm(false);
  };

  const handleServiceCardClick = (service: any) => {
    setSelectedServiceForModal(service);
    setIsServiceModalOpen(true);
  };

  const handleServiceModalClose = () => {
    setIsServiceModalOpen(false);
    setSelectedServiceForModal(null);
  };

  const handleGetStarted = (serviceId: string) => {
    setSelectedSection(serviceId);
  };

  const selectedSectionData = documentSections.find(section => section.id === selectedSection);

  if (selectedSection && selectedSectionData) {
    const Component = selectedSectionData.component;
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-4 md:mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToOverview}
            className="mb-3 md:mb-4 text-sm md:text-base"
          >
            ← Back to Document Services
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedSectionData.color} text-white`}>
              <selectedSectionData.icon className="h-5 w-5 md:h-6 md:w-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">{selectedSectionData.title}</h1>
              <p className="text-sm md:text-base text-gray-600">{selectedSectionData.description}</p>
            </div>
          </div>
        </div>
        <Component />
      </div>
    );
  }

  if (showProcessForm) {
    return (
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <div className="mb-4 md:mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToOverview}
            className="mb-3 md:mb-4"
          >
            ← Back to Overview
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">File a Process</h1>
          <p className="text-sm md:text-base text-gray-600">Select the documentation service you need</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {documentSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  section.comingSoon ? 'opacity-60' : 'hover:scale-105'
                }`}
                onClick={() => !section.comingSoon && handleSectionSelect(section.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-lg ${section.color} text-white`}>
                      <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    {section.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base md:text-lg">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs md:text-sm text-gray-600 mb-3 md:mb-4">{section.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">Features:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {section.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {!section.comingSoon && (
                    <div className="mt-3 md:mt-4 flex items-center text-sm text-blue-600 font-medium">
                      Get Started
                      <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Land Documentation Services</h1>
        <p className="text-sm md:text-xl text-gray-600 max-w-2xl mx-auto mb-6 md:mb-8 px-4">
          Professional land surveying, documentation, and certification services for property owners,
          developers, and real estate professionals in Lagos, Nigeria.
        </p>
        <Button
          size="lg"
          onClick={() => setShowProcessForm(true)}
          className="px-6 md:px-8 py-3 text-base md:text-lg w-full sm:w-auto"
        >
          File a Process
          <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
        </Button>
      </div>

      {/* How It Works - New Carousel */}
      <HowItWorksCarousel />

      {/* Service Overview */}
      <div className="mb-8 md:mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-6 md:mb-8">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {documentSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card
                key={section.id}
                className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
                onClick={() => handleServiceCardClick(section)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color} text-white`}>
                      <IconComponent className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg truncate">{section.title}</CardTitle>
                      {section.comingSoon && (
                        <Badge variant="secondary" className="mt-1 text-xs">Coming Soon</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{section.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Key Features:</h4>
                    <ul className="text-xs md:text-sm text-gray-600 space-y-1">
                      {section.features.slice(0, 2).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                          <span className="truncate">{feature}</span>
                        </li>
                      ))}
                      {section.features.length > 2 && (
                        <li className="text-xs text-gray-500">
                          +{section.features.length - 2} more features
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="mt-3 text-sm text-blue-600 font-medium">
                    View Details
                    <ArrowRight className="h-3 w-3 md:h-4 md:w-4 inline ml-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-8 md:mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-xl md:text-2xl">Why Choose Our Services?</CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="text-center">
                <Shield className="h-10 w-10 md:h-12 md:w-12 text-blue-600 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">Certified & Accredited</h3>
                <p className="text-sm md:text-base text-gray-600">
                  All our services are provided by licensed surveyors and certified professionals
                  following Lagos State surveying standards.
                </p>
              </div>
              <div className="text-center">
                <Clock className="h-10 w-10 md:h-12 md:w-12 text-green-600 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">Fast Processing</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Efficient processing times with dedicated support to ensure your documents
                  are delivered within the specified timelines.
                </p>
              </div>
              <div className="text-center">
                <Info className="h-10 w-10 md:h-12 md:w-12 text-purple-600 mx-auto mb-3 md:mb-4" />
                <h3 className="text-base md:text-lg font-semibold mb-2">Expert Guidance</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Professional consultation and guidance throughout the entire process
                  to ensure compliance and accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
          <CardContent className="pt-6 md:pt-8 pb-6 md:pb-8 px-4 md:px-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Ready to Get Started?</h2>
            <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6 max-w-2xl mx-auto">
              Begin your land documentation process today. Our team is ready to assist you
              with all your surveying and certification needs.
            </p>
            <Button
              size="lg"
              onClick={() => setShowProcessForm(true)}
              className="px-6 md:px-8 py-3 text-base md:text-lg w-full sm:w-auto"
            >
              Start Your Application
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Service Details Modal */}
      <ServiceDetailsModal
        service={selectedServiceForModal}
        isOpen={isServiceModalOpen}
        onClose={handleServiceModalClose}
        onGetStarted={handleGetStarted}
      />
    </div>
  );
}