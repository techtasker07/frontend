import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const features = [
  {
    icon: "/market.png",
    title: "Market Analytics",
    description: "Get detailed insights on property values, market trends, and investment opportunities with our advanced analytics tools."
  },
  {
    icon: "/poll.png",
    title: "Community Polls",
    description: "Poll the community about property prospects, get insights from other investors, and make informed decisions together."
  },
  {
    icon: "/verified.png",
    title: "Verified Listings",
    description: "All properties are verified and authenticated to ensure you're getting accurate information and legitimate deals."
  },
  {
    icon: "/notification.png",
    title: "Instant Notifications",
    description: "Get real-time alerts for new properties matching your criteria and poll results for properties you're interested in."
  },
  {
    icon: "/investment_tracking.png",
    title: "Investment Tracking",
    description: "Track your property investments, monitor performance, and get recommendations for portfolio optimization."
  },
  {
    icon: "/consultant.png",
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
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <img src={feature.icon} alt={feature.title} className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}