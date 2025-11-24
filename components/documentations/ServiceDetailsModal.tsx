'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle,
  Clock,
  FileText,
  Map,
  BarChart3,
  Building,
  Newspaper,
  ArrowRight,
  X
} from 'lucide-react';

interface ServiceDetails {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  features: string[];
  processSteps: {
    step: number;
    title: string;
    description: string;
    duration?: string;
  }[];
  requirements: string[];
  processingTime: string;
  benefits: string[];
  comingSoon?: boolean;
}

interface ServiceDetailsModalProps {
  service: ServiceDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onGetStarted?: (serviceId: string) => void;
}

const serviceDetailsData: Record<string, ServiceDetails> = {
  'survey-plan': {
    id: 'survey-plan',
    title: 'Survey Plan',
    description: 'Process and file survey plans for land documentation',
    icon: FileText,
    color: 'bg-blue-500',
    features: ['Fresh Survey Processing', 'Existing Coordinates', 'Direct Verification', 'Point Retaking'],
    processSteps: [
      {
        step: 1,
        title: 'Document Submission',
        description: 'Submit property details, survey coordinates, and required documents through our secure portal.',
        duration: '1-2 days'
      },
      {
        step: 2,
        title: 'Document Verification',
        description: 'Our team reviews submitted documents for completeness and accuracy.',
        duration: '2-3 days'
      },
      {
        step: 3,
        title: 'Field Survey (if required)',
        description: 'Licensed surveyors conduct field measurements and coordinate verification.',
        duration: '1-2 weeks'
      },
      {
        step: 4,
        title: 'Plan Preparation',
        description: 'Survey plan is drafted and prepared according to Lagos State standards.',
        duration: '2-3 weeks'
      },
      {
        step: 5,
        title: 'Quality Assurance',
        description: 'Final review and quality checks before submission to relevant authorities.',
        duration: '3-5 days'
      },
      {
        step: 6,
        title: 'Approval & Delivery',
        description: 'Approved survey plan delivered with official certification.',
        duration: '1-2 weeks'
      }
    ],
    requirements: [
      'Property ownership documents',
      'Survey coordinates or boundary measurements',
      'Applicant identification',
      'Property address and location details',
      'Payment of applicable fees'
    ],
    processingTime: '3-4 months from point picking',
    benefits: [
      'Officially certified survey plans',
      'Legal compliance with Lagos State regulations',
      'Professional surveying standards',
      'Secure document processing',
      'Expert consultation throughout the process'
    ]
  },
  'layout-survey': {
    id: 'layout-survey',
    title: 'Layout Survey',
    description: 'Create and verify property layout surveys',
    icon: Map,
    color: 'bg-green-500',
    features: ['Multi-plot Layouts', 'Zoning Compliance', 'Development Planning', 'Boundary Verification'],
    processSteps: [
      {
        step: 1,
        title: 'Layout Planning',
        description: 'Review development plans and zoning requirements for the property.',
        duration: '1 week'
      },
      {
        step: 2,
        title: 'Field Measurements',
        description: 'Conduct comprehensive field survey of the entire layout area.',
        duration: '1-2 weeks'
      },
      {
        step: 3,
        title: 'Plot Subdivision',
        description: 'Define individual plot boundaries and measurements.',
        duration: '1 week'
      },
      {
        step: 4,
        title: 'Infrastructure Mapping',
        description: 'Map roads, utilities, and infrastructure within the layout.',
        duration: '1 week'
      },
      {
        step: 5,
        title: 'Compliance Verification',
        description: 'Ensure layout meets all zoning and development regulations.',
        duration: '3-5 days'
      },
      {
        step: 6,
        title: 'Final Documentation',
        description: 'Prepare and certify the complete layout survey documentation.',
        duration: '1 week'
      }
    ],
    requirements: [
      'Development approval documents',
      'Zoning certificates',
      'Site plan and architectural drawings',
      'Infrastructure plans',
      'Environmental impact assessment (if required)'
    ],
    processingTime: '3-4 months from submission',
    benefits: [
      'Comprehensive layout documentation',
      'Zoning compliance verification',
      'Infrastructure planning support',
      'Individual plot certifications',
      'Development approval facilitation'
    ]
  },
  'survey-chart': {
    id: 'survey-chart',
    title: 'Chart Survey',
    description: 'Interactive survey charting with coordinate plotting',
    icon: BarChart3,
    color: 'bg-purple-500',
    features: ['Interactive Mapping', 'Coordinate Plotting', 'Data Export', 'Point Management'],
    processSteps: [
      {
        step: 1,
        title: 'Data Collection',
        description: 'Gather survey coordinates and measurement data.',
        duration: '2-3 days'
      },
      {
        step: 2,
        title: 'Coordinate Processing',
        description: 'Process and validate coordinate data for accuracy.',
        duration: '1 week'
      },
      {
        step: 3,
        title: 'Chart Generation',
        description: 'Create interactive survey charts and maps.',
        duration: '1 week'
      },
      {
        step: 4,
        title: 'Data Visualization',
        description: 'Generate visual representations and export formats.',
        duration: '3-5 days'
      },
      {
        step: 5,
        title: 'Quality Review',
        description: 'Final verification of chart accuracy and completeness.',
        duration: '2-3 days'
      }
    ],
    requirements: [
      'Survey coordinate data',
      'Reference points and benchmarks',
      'Accuracy specifications',
      'Output format requirements'
    ],
    processingTime: '2-3 weeks from data submission',
    benefits: [
      'Interactive survey visualization',
      'Multiple export formats',
      'Coordinate accuracy verification',
      'Professional charting standards',
      'Data integration capabilities'
    ]
  },
  'certificate-occupancy': {
    id: 'certificate-occupancy',
    title: 'Certificate of Occupancy',
    description: 'Building approval and occupancy certificates',
    icon: Building,
    color: 'bg-orange-500',
    features: ['Coming Soon'],
    processSteps: [],
    requirements: [],
    processingTime: 'Coming Soon',
    benefits: [],
    comingSoon: true
  },
  'gazette': {
    id: 'gazette',
    title: 'Gazette Services',
    description: 'Legal publications and property notices',
    icon: Newspaper,
    color: 'bg-red-500',
    features: ['Coming Soon'],
    processSteps: [],
    requirements: [],
    processingTime: 'Coming Soon',
    benefits: [],
    comingSoon: true
  }
};

export function ServiceDetailsModal({ service, isOpen, onClose, onGetStarted }: ServiceDetailsModalProps) {
  if (!service) return null;

  const details = serviceDetailsData[service.id];

  const ModalContent = () => (
    <div className="flex flex-col h-full max-h-[90vh]">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b">
        <div className={`p-2 rounded-lg ${details.color} text-white flex-shrink-0`}>
          <details.icon className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold text-gray-900 truncate">{details.title}</h2>
          <p className="text-sm text-gray-600">{details.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Features */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Key Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {details.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Process Steps */}
        {!details.comingSoon && (
          <>
            <div>
              <h3 className="text-lg font-semibold mb-4">Service Process</h3>
              <div className="space-y-4">
                {details.processSteps.map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                      {step.duration && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{step.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Requirements */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Requirements</h3>
              <ul className="space-y-2">
                {details.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Processing Time & Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Processing Time</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span className="text-sm text-gray-600">{details.processingTime}</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-3">Benefits</h3>
                <ul className="space-y-1">
                  {details.benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}

        {/* Coming Soon */}
        {details.comingSoon && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <details.icon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
            <p className="text-sm text-gray-600">
              This service is currently under development. We'll notify you when it becomes available.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      {!details.comingSoon && (
        <div className="border-t p-6">
          <Button
            onClick={() => {
              onGetStarted?.(service.id);
              onClose();
            }}
            className="w-full"
            size="lg"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );

  // Use Sheet for mobile, Dialog for desktop
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="bottom" className="h-[90vh] p-0 rounded-t-xl">
          <ModalContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0">
        <ModalContent />
      </DialogContent>
    </Dialog>
  );
}