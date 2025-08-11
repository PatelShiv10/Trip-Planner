import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, MapPin, Calendar, Users, Brain, Shield, Globe, Star, ArrowRight, Sparkles, MessageCircle, Download, CreditCard, Zap, CheckCircle } from 'lucide-react';
const Index = () => {
  return <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Triply</span>
            </div>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl transform hover:scale-105">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-purple-200 mb-8">
              <Sparkles className="h-4 w-4 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-700">AI-Powered Travel Planning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Plan Your Perfect
              <br />
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Trip with AI
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Get detailed trip plans with real-time pricing from across India. Our AI searches the web for accurate costs, 
              creates custom itineraries, and keeps you within budget.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg rounded-xl shadow-2xl transition-all duration-200 hover:shadow-3xl transform hover:scale-105">
                  <Plane className="mr-2 h-5 w-5" />
                  Start Planning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Real-time pricing from web
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Budget-guaranteed plans
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Accurate Indian pricing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Why Choose Our AI Travel Planner?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI technology combined with real-time web scraping for the most accurate and budget-friendly travel plans
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[{
            icon: Brain,
            title: "Real-Time Price Scraping",
            description: "Our AI scrapes live prices from booking sites, train websites, and hotel platforms for accurate costs",
            color: "from-blue-500 to-cyan-500",
            highlight: "NEW"
          }, {
            icon: Shield,
            title: "Budget Guarantee",
            description: "Plans are guaranteed to stay within your budget. No surprises, no overruns, just accurate planning",
            color: "from-green-500 to-emerald-500",
            highlight: "GUARANTEED"
          }, {
            icon: MessageCircle,
            title: "Chat to Modify Plans",
            description: "Talk to our AI assistant to adjust your itinerary, change transportation, or update activities instantly",
            color: "from-purple-500 to-pink-500"
          }, {
            icon: Download,
            title: "Professional PDF Export",
            description: "Download beautiful PDF versions of your complete trip plans with all details and pricing included",
            color: "from-orange-500 to-red-500"
          }, {
            icon: CreditCard,
            title: "Smart Expense Tracking",
            description: "Track your actual expenses and compare them with AI estimates to stay within budget throughout your trip",
            color: "from-yellow-500 to-orange-500"
          }, {
            icon: Zap,
            title: "Indian Travel Specialist",
            description: "Specialized in Indian travel with accurate train bookings, local transport, and regional pricing",
            color: "from-indigo-500 to-purple-500"
          }].map((feature, idx) => <Card key={idx} className="relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-white to-gray-50">
                {feature.highlight && <div className="absolute top-4 right-4">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full bg-gradient-to-r ${feature.color} text-white`}>
                      {feature.highlight}
                    </span>
                  </div>}
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-2xl inline-block mb-6 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-24 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get your perfect trip plan in just three simple steps with guaranteed accurate pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[{
            step: 1,
            title: "Set Your Budget & Preferences",
            description: "Enter your destination, dates, and budget range. Our AI will respect your budget limits strictly.",
            icon: Calendar
          }, {
            step: 2,
            title: "AI Scrapes Live Prices",
            description: "Our AI searches the web for current prices from hotels, trains, flights, and activities in real-time.",
            icon: Brain
          }, {
            step: 3,
            title: "Get Your Budget-Perfect Plan",
            description: "Receive a detailed itinerary with accurate costs that never exceed your specified budget range.",
            icon: CheckCircle
          }].map((step, idx) => <div key={idx} className="text-center relative">
                {idx < 2 && <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-purple-300 to-blue-300 transform translate-x-4"></div>}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
                  <step.icon className="h-8 w-8 text-purple-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </div>)}
          </div>
        </div>
      </div>

      {/* Pricing Accuracy Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-6">
              Accurate Pricing Guaranteed
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto">
              Unlike other travel planners that guess prices, our AI scrapes live data from booking websites, 
              IRCTC, hotel sites, and activity providers to give you real, current pricing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-bold text-lg mb-2">Live Train Prices</h4>
                <p className="text-sm opacity-80">Real IRCTC pricing for all train routes</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-bold text-lg mb-2">Hotel Rate Scraping</h4>
                <p className="text-sm opacity-80">Current rates from booking platforms</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h4 className="font-bold text-lg mb-2">Activity Pricing</h4>
                <p className="text-sm opacity-80">Live costs for tours and attractions</p>
              </div>
            </div>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold shadow-xl transition-all duration-200 hover:shadow-2xl transform hover:scale-105">
                Try Accurate Planning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">
        <div className="relative px-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready for Your Budget-Perfect Trip?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of travelers who trust our AI for accurate pricing and budget-guaranteed trip planning.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold shadow-2xl transition-all duration-200 hover:shadow-3xl transform hover:scale-105">
                  <Plane className="mr-2 h-5 w-5" />
                  Start Planning Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
            <p className="text-white/70 text-sm mt-4">
              No credit card required • Free to start • Accurate pricing guaranteed
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export default Index;