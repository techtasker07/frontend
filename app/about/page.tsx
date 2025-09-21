import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Target, Lightbulb, Shield, Award, Globe, ArrowRight, Heart, Zap, MapPin } from "lucide-react"

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Mr. Prosper Owah",
      role: "CEO & Founder",
      image: "/professional-african-ceo.png",
      description: "Visionary leader with 15+ years in real estate and technology innovation.",
    },
    {
      name: "Mr. Taiwo Majekodunmi",
      role: "Product Manager",
      image: "/professional-african-man-product.png",
      description: "Tech expert specializing in AI and machine learning applications.",
    },
    {
      name: "Eniola",
      role: "Operations",
      image: "/professional-african-woman-operations.png",
      description: "Product strategist focused on user experience and market research.",
    },
  ]

  const values = [
    {
      icon: Shield,
      title: "Transparency",
      description: "We believe in open, honest communication and transparent property evaluations.",
    },
    {
      icon: Users,
      title: "Community",
      description: "Building a strong community of property enthusiasts and real estate professionals.",
    },
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "Leveraging cutting-edge AI technology to revolutionize property assessment.",
    },
    {
      icon: Heart,
      title: "Trust",
      description: "Fostering trust through reliable data and authentic user experiences.",
    },
  ]

  const achievements = [
    { number: "10,000+", label: "Properties Evaluated" },
    { number: "5,000+", label: "Active Users" },
    { number: "50+", label: "Cities Covered" },
    { number: "95%", label: "User Satisfaction" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white">About Mipripity</Badge>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Revolutionizing Property Evaluation
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-4xl mx-auto leading-relaxed">
              We're transforming how people discover, evaluate, and invest in properties through community-driven
              insights and AI-powered intelligence.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-800">Our Story</h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Founded in 2025 by <strong>Techtasker Solutions</strong>, Mipripity emerged from a simple observation:
                property evaluation was too complex, too expensive, and too exclusive. We believed everyone deserved
                access to reliable property insights.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed">
                Today, we're proud to be Nigeria's leading community-driven property evaluation platform, combining the
                wisdom of crowds with the power of artificial intelligence to democratize real estate knowledge.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <Globe className="w-4 h-4 mr-1" />
                  Nigeria-Based
                </Badge>
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <Zap className="w-4 h-4 mr-1" />
                  AI-Powered
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  <Users className="w-4 h-4 mr-1" />
                  Community-Driven
                </Badge>
              </div>
            </div>
            <div className="relative">
              {/* Office Location Map */}
              <div className="relative rounded-2xl shadow-2xl overflow-hidden bg-white p-4">
                <div className="mb-4 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-slate-800">Our Office Location</h3>
                    <p className="text-sm text-slate-600">34 Rafiu Cres, Mafoluku Oshodi, Lagos 102214, Lagos</p>
                  </div>
                </div>
                <div className="relative h-80 w-full rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3964.2847982842447!2d3.3302!3d6.5244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b8b2ae68280c1%3A0x4e5f306c2b4c5d6e!2s34%20Rafiu%20Cres%2C%20Mafoluku%20Oshodi%2C%20Lagos%20102214%2C%20Lagos!5e0!3m2!1sen!2sng!4v1635789012345!5m2!1sen!2sng"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-100">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle className="text-2xl text-blue-800">Our Mission</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-slate-700 leading-relaxed">
                  To democratize property evaluation by creating a transparent, community-driven platform that empowers
                  everyone to make informed real estate decisions through collective wisdom and smart insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-pink-100">
              <CardHeader>
                <Lightbulb className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle className="text-2xl text-purple-800">Our Vision</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-slate-700 leading-relaxed">
                  To become Africa's most trusted property evaluation ecosystem, where every property decision is backed
                  by reliable data, community insights, and cutting-edge technology, creating a more transparent real
                  estate market for all.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Our Core Values</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              These principles guide everything we do and shape how we serve our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white/90 backdrop-blur-sm"
              >
                <CardHeader className="text-center">
                  <value.icon className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 text-center">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">Our Impact</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Numbers that reflect our commitment to transforming the property evaluation landscape
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{achievement.number}</div>
                <div className="text-blue-100 text-lg">{achievement.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-800 mb-6">Meet Our Team</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              The passionate individuals behind Mipripity's success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white"
              >
                <CardContent className="p-6 text-center">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={200}
                    height={200}
                    className="rounded-full mx-auto mb-4 object-cover"
                  />
                  <h3 className="text-xl font-bold text-slate-800 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                  <p className="text-slate-600 text-sm">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-slate-800 mb-6">Join Our Journey</h2>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Be part of the revolution in property evaluation. Whether you're a property owner, investor, or enthusiast,
            there's a place for you in our community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Link href="/register">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
