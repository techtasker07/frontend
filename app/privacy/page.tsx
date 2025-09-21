import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Eye, Database, Users, Mail, Info, CheckCircle, AlertTriangle } from "lucide-react"

export default function PrivacyPolicyPage() {
  const lastUpdated = "December 15, 2024"

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: Database,
      content: [
        {
          subtitle: "Personal Information",
          items: [
            "Name, email address, and phone number when you create an account",
            "Profile pictures and other images you upload",
            "Property information and descriptions you submit",
            "Communication preferences and settings",
          ],
        },
        {
          subtitle: "Usage Information",
          items: [
            "How you interact with our platform and services",
            "Pages visited, features used, and time spent on the platform",
            "Device information, IP address, and browser type",
            "Voting patterns and property evaluation activities",
          ],
        },
        {
          subtitle: "Property Data",
          items: [
            "Property details, images, and descriptions you submit",
            "Location information and property valuations",
            "Voting data and community feedback",
            "AI-generated prospects and recommendations",
          ],
        },
      ],
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: Eye,
      content: [
        {
          subtitle: "Service Provision",
          items: [
            "Provide and maintain our property evaluation platform",
            "Generate AI-powered property prospects and insights",
            "Enable community voting and property assessments",
            "Facilitate communication between users",
          ],
        },
        {
          subtitle: "Platform Improvement",
          items: [
            "Analyze usage patterns to improve our services",
            "Develop new features and enhance user experience",
            "Conduct research and analytics for platform optimization",
            "Ensure platform security and prevent fraud",
          ],
        },
        {
          subtitle: "Communication",
          items: [
            "Send important updates about your account or properties",
            "Provide customer support and respond to inquiries",
            "Send newsletters and promotional content (with consent)",
            "Notify you about platform changes and new features",
          ],
        },
      ],
    },
    {
      id: "information-sharing",
      title: "Information Sharing and Disclosure",
      icon: Users,
      content: [
        {
          subtitle: "Public Information",
          items: [
            "Property listings and descriptions are publicly visible",
            "Voting statistics and community feedback are shared publicly",
            "User names and profile information may be displayed with properties",
            "AI-generated prospects are visible to all users",
          ],
        },
        {
          subtitle: "Service Providers",
          items: [
            "Cloud storage providers for data hosting and backup",
            "Analytics services to understand platform usage",
            "Email service providers for communication",
            "Payment processors for any future premium features",
          ],
        },
        {
          subtitle: "Legal Requirements",
          items: [
            "Comply with applicable laws and regulations",
            "Respond to legal requests and court orders",
            "Protect our rights and prevent fraud or abuse",
            "Ensure platform safety and security",
          ],
        },
      ],
    },
    {
      id: "data-security",
      title: "Data Security and Protection",
      icon: Lock,
      content: [
        {
          subtitle: "Security Measures",
          items: [
            "Encryption of data in transit and at rest",
            "Regular security audits and vulnerability assessments",
            "Access controls and authentication mechanisms",
            "Secure cloud infrastructure and backup systems",
          ],
        },
        {
          subtitle: "Data Retention",
          items: [
            "Account information retained while your account is active",
            "Property data retained to maintain platform functionality",
            "Voting data retained for statistical and analytical purposes",
            "Communication records retained for customer support",
          ],
        },
      ],
    },
    {
      id: "user-rights",
      title: "Your Rights and Choices",
      icon: Shield,
      content: [
        {
          subtitle: "Access and Control",
          items: [
            "Access and update your personal information through your profile",
            "Delete your account and associated data upon request",
            "Control visibility of your profile information",
            "Opt-out of promotional communications",
          ],
        },
        {
          subtitle: "Data Portability",
          items: [
            "Request a copy of your personal data in a portable format",
            "Transfer your data to another service where technically feasible",
            "Receive information about data processing activities",
            "Request correction of inaccurate personal information",
          ],
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">Privacy Policy</Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Your Privacy Matters
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            We're committed to protecting your privacy and being transparent about how we collect, use, and protect your
            personal information.
          </p>
          <Alert className="max-w-2xl mx-auto border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Last Updated:</strong> {lastUpdated}
            </AlertDescription>
          </Alert>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-12 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Mipripity ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains
                how we collect, use, disclose, and safeguard your information when you use our property evaluation
                platform and related services.
              </p>
              <p className="text-slate-700 leading-relaxed">
                By using Mipripity, you agree to the collection and use of information in accordance with this Privacy
                Policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  We are committed to GDPR compliance and follow international best practices for data protection.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Content Sections */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl space-y-12">
          {sections.map((section, index) => (
            <Card key={section.id} className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <section.icon className="mr-3 h-6 w-6 text-blue-600" />
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {section.content.map((subsection, subIndex) => (
                  <div key={subIndex}>
                    <h4 className="font-semibold text-lg text-slate-800 mb-3">{subsection.subtitle}</h4>
                    <ul className="space-y-2">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                    {subIndex < section.content.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Cookies and Tracking */}
      <section className="py-12 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Database className="mr-3 h-6 w-6 text-blue-600" />
                Cookies and Tracking Technologies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience on our platform. These
                technologies help us understand how you use our services and improve functionality.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Essential Cookies</h4>
                  <p className="text-sm text-slate-600">
                    Required for basic platform functionality, authentication, and security.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Analytics Cookies</h4>
                  <p className="text-sm text-slate-600">Help us understand usage patterns and improve our services.</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Preference Cookies</h4>
                  <p className="text-sm text-slate-600">
                    Remember your settings and preferences for a personalized experience.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Marketing Cookies</h4>
                  <p className="text-sm text-slate-600">
                    Used to deliver relevant content and advertisements (with your consent).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* International Transfers */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than Nigeria. We ensure that
                such transfers comply with applicable data protection laws and implement appropriate safeguards to
                protect your personal information.
              </p>
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  We use cloud services that may store data in multiple regions to ensure reliability and performance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Questions About Privacy?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            If you have any questions about this Privacy Policy or our data practices, please don't hesitate to contact
            us.
          </p>
          <Card className="border-0 shadow-lg bg-white/10 backdrop-blur-sm text-white max-w-md mx-auto">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 mx-auto text-blue-200 mb-4" />
              <h3 className="font-semibold mb-2">Privacy Officer</h3>
              <p className="text-blue-100 text-sm mb-4">privacy@mipripity.com</p>
              <p className="text-xs text-blue-200">We'll respond to privacy inquiries within 48 hours</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
