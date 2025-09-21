import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Scale, Shield, Users, Building, AlertTriangle, Info, CheckCircle, XCircle, Mail } from "lucide-react"

export default function TermsOfServicePage() {
  const lastUpdated = "December 15, 2024"

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: FileText,
      content: [
        "By accessing and using Mipripity, you accept and agree to be bound by the terms and provision of this agreement.",
        "If you do not agree to abide by the above, please do not use this service.",
        "These terms apply to all visitors, users, and others who access or use the service.",
        "We reserve the right to update these terms at any time without prior notice.",
      ],
    },
    {
      id: "description",
      title: "Service Description",
      icon: Building,
      content: [
        "Mipripity is a community-driven property evaluation platform that allows users to submit, evaluate, and vote on property listings.",
        "We provide AI-powered property prospects and investment insights based on community data and market analysis.",
        "The platform facilitates property discovery, evaluation, and community interaction around real estate.",
        "Services are provided 'as is' and we make no warranties about the accuracy of property valuations or AI-generated content.",
      ],
    },
    {
      id: "user-accounts",
      title: "User Accounts and Registration",
      icon: Users,
      content: [
        "You must create an account to access certain features of the platform.",
        "You are responsible for maintaining the confidentiality of your account credentials.",
        "You must provide accurate, current, and complete information during registration.",
        "You are responsible for all activities that occur under your account.",
        "We reserve the right to suspend or terminate accounts that violate these terms.",
      ],
    },
    {
      id: "user-conduct",
      title: "User Conduct and Responsibilities",
      icon: Shield,
      content: [
        "Users must provide accurate and truthful information about properties.",
        "Harassment, abuse, or inappropriate behavior towards other users is prohibited.",
        "Users must not submit false, misleading, or fraudulent property information.",
        "Spam, promotional content, or commercial solicitation is not allowed.",
        "Users must respect intellectual property rights and not infringe on copyrights.",
        "Any attempt to manipulate voting or gaming the system is strictly prohibited.",
      ],
    },
    {
      id: "content-policy",
      title: "Content Policy and Intellectual Property",
      icon: FileText,
      content: [
        "Users retain ownership of content they submit but grant us a license to use, display, and distribute it.",
        "By submitting content, you represent that you have the right to do so and that it doesn't violate any laws.",
        "We reserve the right to remove content that violates our policies or terms of service.",
        "Users are responsible for ensuring they have permission to share property information and images.",
        "We respect intellectual property rights and will respond to valid DMCA takedown notices.",
      ],
    },
    {
      id: "prohibited-uses",
      title: "Prohibited Uses",
      icon: XCircle,
      content: [
        "Using the service for any unlawful purpose or to solicit others to perform unlawful acts.",
        "Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances.",
        "Infringing upon or violating our intellectual property rights or the intellectual property rights of others.",
        "Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating.",
        "Submitting false or misleading information about properties or property values.",
        "Using automated systems or bots to interact with the service without permission.",
      ],
    },
  ]

  const limitations = [
    {
      title: "Property Valuations",
      description:
        "Property evaluations and AI prospects are for informational purposes only and should not be considered professional appraisals.",
    },
    {
      title: "Investment Advice",
      description:
        "We do not provide investment advice. All investment decisions should be made with professional consultation.",
    },
    {
      title: "Data Accuracy",
      description:
        "While we strive for accuracy, we cannot guarantee the completeness or accuracy of user-submitted content.",
    },
    {
      title: "Service Availability",
      description:
        "We do not guarantee uninterrupted service and may experience downtime for maintenance or technical issues.",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">Terms of Service</Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            Terms of Service
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Please read these terms carefully before using Mipripity. By using our service, you agree to be bound by
            these terms and conditions.
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
              <CardTitle className="flex items-center text-2xl">
                <Scale className="mr-3 h-6 w-6 text-blue-600" />
                Agreement Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                These Terms of Service ("Terms") govern your use of the Mipripity platform and services operated by
                Techtasker Solutions ("us", "we", or "our"). These Terms apply to all visitors, users, and others who
                access or use our service.
              </p>
              <p className="text-slate-700 leading-relaxed">
                By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part
                of these terms, then you may not access the service.
              </p>
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  These terms may be updated from time to time. Continued use of the service constitutes acceptance of
                  any changes.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Main Terms Sections */}
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
              <CardContent>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Limitations and Disclaimers */}
      <section className="py-12 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <AlertTriangle className="mr-3 h-6 w-6 text-yellow-600" />
                Limitations and Disclaimers
              </CardTitle>
              <CardDescription>Important limitations you should be aware of when using our service</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {limitations.map((limitation, index) => (
                  <div key={index} className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <h4 className="font-semibold text-yellow-800 mb-2">{limitation.title}</h4>
                    <p className="text-sm text-yellow-700">{limitation.description}</p>
                  </div>
                ))}
              </div>
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Important:</strong> Mipripity is not a licensed real estate service. All property evaluations
                  and AI-generated prospects are for informational purposes only and should not replace professional
                  real estate advice or formal property appraisals.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Liability and Indemnification */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Liability and Indemnification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Limitation of Liability</h4>
                  <p className="text-slate-700 leading-relaxed">
                    In no event shall Mipripity, its directors, employees, partners, agents, suppliers, or affiliates be
                    liable for any indirect, incidental, special, consequential, or punitive damages, including without
                    limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your
                    use of the service.
                  </p>
                </div>
                <Separator />
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">User Indemnification</h4>
                  <p className="text-slate-700 leading-relaxed">
                    You agree to defend, indemnify, and hold harmless Mipripity and its licensee and licensors, and
                    their employees, contractors, agents, officers and directors, from and against any and all claims,
                    damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to
                    attorney's fees).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Termination */}
      <section className="py-12 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice
                or liability, under our sole discretion, for any reason whatsoever and without limitation, including but
                not limited to a breach of the Terms.
              </p>
              <p className="text-slate-700 leading-relaxed">
                If you wish to terminate your account, you may simply discontinue using the service or contact us to
                request account deletion. Upon termination, your right to use the service will cease immediately.
              </p>
              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  Even after termination, certain provisions of these Terms will survive, including ownership
                  provisions, warranty disclaimers, indemnity, and limitations of liability.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Governing Law */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Scale className="mr-3 h-6 w-6 text-blue-600" />
                Governing Law and Jurisdiction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                These Terms shall be interpreted and governed by the laws of the Federal Republic of Nigeria, without
                regard to its conflict of law provisions. Our failure to enforce any right or provision of these Terms
                will not be considered a waiver of those rights.
              </p>
              <p className="text-slate-700 leading-relaxed">
                Any disputes arising from these Terms or your use of the service will be resolved through binding
                arbitration in Lagos, Nigeria, in accordance with the rules of the Lagos Court of Arbitration.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Questions About These Terms?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            If you have any questions about these Terms of Service, please contact us. We're here to help clarify any
            concerns you may have.
          </p>
          <Card className="border-0 shadow-lg bg-white/10 backdrop-blur-sm text-white max-w-md mx-auto">
            <CardContent className="p-6">
              <Mail className="h-8 w-8 mx-auto text-blue-200 mb-4" />
              <h3 className="font-semibold mb-2">Legal Department</h3>
              <p className="text-blue-100 text-sm mb-4">legal@mipripity.com</p>
              <p className="text-xs text-blue-200">We'll respond to legal inquiries within 72 hours</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
