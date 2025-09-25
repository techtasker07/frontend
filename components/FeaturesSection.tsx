import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BarChart3, Users, Shield, Zap, TrendingUp, MessageCircle } from "lucide-react";

const features = [
  {
    icon: BarChart3,
    title: "Market Analytics",
    description: "Get detailed insights on property values, market trends, and investment opportunities with our advanced analytics tools."
  },
  {
    icon: Users,
    title: "Community Polls",
    description: "Poll the community about property prospects, get insights from other investors, and make informed decisions together."
  },
  {
    icon: Shield,
    title: "Verified Listings",
    description: "All properties are verified and authenticated to ensure you're getting accurate information and legitimate deals."
  },
  {
    icon: Zap,
    title: "Instant Notifications",
    description: "Get real-time alerts for new properties matching your criteria and poll results for properties you're interested in."
  },
  {
    icon: TrendingUp,
    title: "Investment Tracking",
    description: "Track your property investments, monitor performance, and get recommendations for portfolio optimization."
  },
  {
    icon: MessageCircle,
    title: "Expert Consultation",
    description: "Connect with real estate experts, get professional advice, and access exclusive market insights and reports."
  }
];

export function FeaturesSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose Mipripity?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with community insights to help you make the best real estate decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}