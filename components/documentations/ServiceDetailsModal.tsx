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
  Shield,
  Award,
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
  'acquisition': {
    id: 'acquisition',
    title: 'Acquisition',
    description: 'Due diligence verification of property status through coordinate charting and document verification',
    icon: Shield,
    color: 'bg-blue-500',
    features: ['Coordinate Charting', 'Property Status Verification', 'Seller Document Verification', 'Due Diligence Report'],
    processSteps: [
      {
        step: 1,
        title: 'Property Information Submission',
        description: 'Submit property details, location coordinates, and initial seller information.',
        duration: '1-2 days'
      },
      {
        step: 2,
        title: 'Coordinate Charting',
        description: 'Plot and verify property coordinates on official mapping systems.',
        duration: '3-5 days'
      },
      {
        step: 3,
        title: 'Document Collection',
        description: 'Gather and review seller/owner documents for authenticity.',
        duration: '1 week'
      },
      {
        step: 4,
        title: 'Status Verification',
        description: 'Verify property ownership status, encumbrances, and legal standing.',
        duration: '1 week'
      },
      {
        step: 5,
        title: 'Due Diligence Report',
        description: 'Compile comprehensive verification report with findings and recommendations.',
        duration: '3-5 days'
      },
      {
        step: 6,
        title: 'Final Review & Delivery',
        description: 'Review report accuracy and deliver to client with expert consultation.',
        duration: '2-3 days'
      }
    ],
    requirements: [
      'Property location and coordinates',
      'Seller/owner identification documents',
      'Existing property documents (if any)',
      'Purchase agreement details',
      'Applicant identification'
    ],
    processingTime: '2-3 weeks from submission',
    benefits: [
      'Comprehensive property verification',
      'Risk assessment and mitigation',
      'Legal compliance assurance',
      'Expert due diligence analysis',
      'Secure transaction foundation'
    ]
  },
  'survey-plan': {
    id: 'survey-plan',
    title: 'Survey Plan',
    description: 'Process and file survey plans for land documentation',
    icon: FileText,
    color: 'bg-green-500',
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
        duration: '2-3 days'
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
    processingTime: '2 weeks from point picking',
    benefits: [
      'Officially certified survey plans',
      'Legal compliance with Lagos State regulations',
      'Professional surveying standards',
      'Secure document processing',
      'Expert consultation throughout the process'
    ]
  },
  'title-document': {
    id: 'title-document',
    title: 'Title Document Processing',
    description: 'Process title documents including Deem Grant, Governor\'s Consent, and Regularisation',
    icon: Award,
    color: 'bg-purple-500',
    features: ['Deem Grant (Fresh C of O)', 'Governor\'s Consent', 'Regularisation', 'Land Information Processing'],
    processSteps: [
      {
        step: 1,
        title: 'Document Type Selection',
        description: 'Choose from Deem Grant, Governor\'s Consent, or Regularisation based on property status.',
        duration: '1 day'
      },
      {
        step: 2,
        title: 'Requirement Assessment',
        description: 'Review specific requirements for selected title document type.',
        duration: '2-3 days'
      },
      {
        step: 3,
        title: 'Document Preparation',
        description: 'Prepare and compile all required documents including Deed of Assignment and Purchase Receipt.',
        duration: '1 week'
      },
      {
        step: 4,
        title: 'Land Information Processing',
        description: 'Process land information requirements for applicable document types.',
        duration: '1-2 weeks'
      },
      {
        step: 5,
        title: 'Lodgement Preparation',
        description: 'Prepare Survey Plan (Record Copy) and all documents for official lodgement.',
        duration: '3-5 days'
      },
      {
        step: 6,
        title: 'Processing & Approval',
        description: 'Submit to relevant authorities and monitor approval process.',
        duration: '2-4 weeks'
      },
      {
        step: 7,
        title: 'Document Delivery',
        description: 'Receive approved title documents and deliver to client.',
        duration: '1 week'
      }
    ],
    requirements: [
      'Deed of Assignment',
      'Purchase Receipt (Family Receipt Preferred)',
      'Survey Plan (Record Copy) for Lodgement',
      'Land Information (for Deem Grant and Regularisation)',
      'Existing C of O (for Governor\'s Consent)',
      'Applicant identification and property details'
    ],
    processingTime: '4-6 weeks from submission',
    benefits: [
      'Official title document processing',
      'Multiple document type options',
      'Expert guidance on requirements',
      'Secure lodgement and tracking',
      'Legal compliance assurance'
    ]
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