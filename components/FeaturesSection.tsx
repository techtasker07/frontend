import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";

type Feature = {
  icon: string;
  title: string;
  description: string;
  details: string;
  illustration: string;
};

const features: Feature[] = [
  {
    icon: "/market.png",
    title: "Market Analytics",
    description: "Get detailed insights on property values, market trends, and investment opportunities with our advanced analytics tools.",
    details: "Discover the power of data-driven real estate decisions with our Market Analytics service. Our comprehensive process includes:\n\n1. **Data Aggregation**: We collect and analyze data from multiple sources including government records, MLS listings, and historical sales data.\n\n2. **AI Analysis**: Our advanced algorithms identify trends, predict market movements, and calculate property values.\n\n3. **Custom Reports**: Receive personalized reports tailored to your investment goals and location preferences.\n\n4. **Expert Insights**: Our real estate experts review and enhance the AI-generated insights.\n\n5. **Ongoing Updates**: Get regular updates on market changes and new opportunities.",
    illustration: "/images/market_place.gif"
  },
  {
    icon: "/poll.png",
    title: "Community Polls",
    description: "Poll the community about property prospects, get insights from other investors, and make informed decisions together.",
    details: "Engage with the Mipripity community through our Community Polls feature. Here's how the process works:\n\n1. **Poll Creation**: Create or participate in polls about specific property prospects or market trends.\n\n2. **Community Voting**: Gather insights from fellow investors and real estate enthusiasts.\n\n3. **Real-time Results**: View live poll results and discussions to inform your decisions.\n\n4. **Expert Moderation**: Our team ensures polls are relevant and discussions remain constructive.\n\n5. **Actionable Insights**: Use poll data to validate your investment strategies and discover new opportunities.",
    illustration: "/images/poll.gif"
  },
  {
    icon: "/verified.png",
    title: "Verified Listings",
    description: "All properties are verified and authenticated to ensure you're getting accurate information and legitimate deals.",
    details: "Trust in our rigorous verification process that ensures every property listing meets the highest standards. Our verification process includes:\n\n1. **Document Review**: Thorough examination of property deeds, titles, and legal documents.\n\n2. **Physical Inspection**: On-site verification of property condition and features.\n\n3. **Owner Authentication**: Confirmation of property ownership and contact information.\n\n4. **Market Validation**: Cross-checking property details against market data and records.\n\n5. **Quality Assurance**: Final review by our expert team before publication.",
    illustration: "/images/verifications.gif"
  },
  {
    icon: "/notification.png",
    title: "Instant Notifications",
    description: "Get real-time alerts for new properties matching your criteria and poll results for properties you're interested in.",
    details: "Stay ahead of the market with our Instant Notifications system. The service process ensures you never miss an opportunity:\n\n1. **Preference Setup**: Configure your notification preferences based on location, price range, and property type.\n\n2. **Real-time Monitoring**: Our system continuously scans for new listings and poll results.\n\n3. **Instant Alerts**: Receive immediate notifications via app, email, or SMS when matches are found.\n\n4. **Smart Filtering**: Advanced algorithms prioritize the most relevant opportunities for you.\n\n5. **Customizable Delivery**: Choose how and when you receive notifications to fit your schedule.",
    illustration: "/images/ongoing.gif"
  },
  {
    icon: "/investment_tracking.png",
    title: "Investment Tracking",
    description: "Track your property investments, monitor performance, and get recommendations for portfolio optimization.",
    details: "Manage and optimize your real estate portfolio with our comprehensive Investment Tracking service. The process includes:\n\n1. **Portfolio Setup**: Import or manually add your property investments to your dashboard.\n\n2. **Performance Monitoring**: Track rental income, expenses, and property appreciation over time.\n\n3. **Financial Analysis**: Receive detailed reports on ROI, cash flow, and portfolio diversification.\n\n4. **Market Benchmarking**: Compare your investments against market averages and similar properties.\n\n5. **Optimization Recommendations**: Get AI-powered suggestions for portfolio improvements and new investment opportunities.",
    illustration: "/images/investment.gif"
  },
  {
    icon: "/consultant.png",
    title: "Expert Consultation",
    description: "Connect with real estate experts, get professional advice, and access exclusive market insights and reports.",
    details: "Access professional real estate expertise through our Expert Consultation service. Our consultation process is designed to provide you with personalized guidance:\n\n1. **Expert Matching**: Connect with certified real estate professionals specializing in your area of interest.\n\n2. **Initial Assessment**: Comprehensive review of your goals, current portfolio, and market position.\n\n3. **Personalized Strategy**: Receive tailored advice and investment strategies based on your profile.\n\n4. **Ongoing Support**: Schedule follow-up sessions and access priority support channels.\n\n5. **Exclusive Resources**: Gain access to premium market reports, research, and networking opportunities.",
    illustration: "/images/consultation.gif"
  }
];

export function FeaturesSection() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sheetHeight, setSheetHeight] = useState(50); // in vh
  const [touchStartY, setTouchStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const sheetContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartY(e.touches[0].clientY);
    setIsDragging(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.touches[0].clientY;
    const deltaY = touchStartY - currentY;
    
    // If user is dragging up (deltaY > 0), expand the sheet
    if (deltaY > 5) {
      setIsDragging(true);
      const newHeight = Math.min(95, sheetHeight + (deltaY / window.innerHeight) * 20);
      setSheetHeight(newHeight);
      setTouchStartY(currentY);
    }
    // If user is dragging down (deltaY < 0), collapse the sheet
    else if (deltaY < -5) {
      setIsDragging(true);
      const newHeight = Math.max(20, sheetHeight + (deltaY / window.innerHeight) * 20);
      setSheetHeight(newHeight);
      setTouchStartY(currentY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    // Snap to 50% or 95% based on current position
    if (sheetHeight > 72.5) {
      setSheetHeight(95);
    } else if (sheetHeight < 35) {
      setIsOpen(false);
      setTimeout(() => setSheetHeight(50), 300);
    } else {
      setSheetHeight(50);
    }

    setIsDragging(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (e.currentTarget.scrollTop > 10) {
      setSheetHeight(95);
    }
  };

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
            <Card
              key={index}
              className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
              onClick={() => {
                setSelectedFeature(feature);
                setIsOpen(true);
                setSheetHeight(50);
              }}
            >
              <CardHeader>
                <div className="w-12 h-12 bg-white-50 rounded-lg flex items-center justify-center mb-4">
                  <img src={feature.icon} alt={feature.title} className="h-12 w-12" />
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

      {selectedFeature && (
        isMobile ? (
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetContent
              side="bottom"
              className="overflow-hidden bg-gradient-to-t from-blue-50 to-indigo-100 border-0 rounded-t-2xl transition-all duration-300"
              style={{ height: `${sheetHeight}vh` }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              ref={sheetContentRef as any}
            >
              <div className="h-full flex flex-col">
                <div className="w-12 h-1.5 bg-gray-400 rounded-full mx-auto my-4 cursor-grab active:cursor-grabbing flex-shrink-0" />
                
                <div className="flex-1 px-4 pb-8 overflow-y-auto" onScroll={handleScroll}>
                  <SheetHeader>
                    <SheetTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                      <img src={selectedFeature.icon} alt={selectedFeature.title} className="h-10 w-10" />
                      {selectedFeature.title}
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6">
                    <div className="text-center">
                      <img
                        src={selectedFeature.illustration}
                        alt={`${selectedFeature.title} illustration`}
                        className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-4 border-white"
                      />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Overview</h3>
                      <p className="text-gray-700 leading-relaxed text-center text-lg">{selectedFeature.description}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">How It Works</h3>
                      {(() => {
                        const parts = selectedFeature.details.split('\n\n');
                        const intro = parts[0];
                        const steps = parts.slice(1);
                        return (
                          <>
                            <p className="text-gray-700 leading-relaxed mb-6 text-center">{intro}</p>
                            <div className="space-y-4">
                              {steps.map((step, i) => {
                                const [title, desc] = step.split(': ');
                                const cleanTitle = title.replace(/^\d+\. \*\*(.*)\*\*$/, '$1');
                                return (
                                  <div key={i} className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                                      {i + 1}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900 mb-2">{cleanTitle}</h4>
                                      <p className="text-gray-700 leading-relaxed">{desc}</p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-3xl overflow-y-auto bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                  <img src={selectedFeature.icon} alt={selectedFeature.title} className="h-10 w-10" />
                  {selectedFeature.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6 space-y-6">
                <div className="text-center">
                  <img
                    src={selectedFeature.illustration}
                    alt={`${selectedFeature.title} illustration`}
                    className="w-full max-w-sm mx-auto rounded-xl shadow-lg border-4 border-white"
                  />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Overview</h3>
                  <p className="text-gray-700 leading-relaxed text-center text-lg">{selectedFeature.description}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      )}
    </section>
  );
}