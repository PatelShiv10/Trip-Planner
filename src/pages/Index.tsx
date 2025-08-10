
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, MapPin, Calendar, Users, Brain, Shield, Globe, Star, ArrowRight, Sparkles, MessageCircle, Download, CreditCard, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-xl shadow-lg">
                <Plane className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xl font-bold text-white">Triply</span>
            </div>
            <Link to="/auth">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-2 rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              AI-Powered
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Travel Planner
              </span>
            </h1>
            
            <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
              Create personalized trip plans with accurate Indian pricing, chat with AI to modify plans, track expenses, and download professional itineraries in PDF format.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-4 text-lg rounded-xl shadow-2xl transition-all duration-200 hover:shadow-3xl">
                  <Plane className="mr-2 h-5 w-5" />
                  Start Planning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative bg-gradient-to-b from-purple-800 to-purple-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              Powerful Features for Smart Travel Planning
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Everything you need to plan, modify, and track your perfect trip with accurate Indian pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "AI Trip Generation", 
                description: "Generate detailed itineraries with realistic Indian pricing for trains, hotels, food, and activities",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: MessageCircle,
                title: "Chat to Modify Plans",
                description: "Talk to our AI assistant to adjust your itinerary, change transportation, or update activities",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: Download,
                title: "PDF Download",
                description: "Download professional PDF versions of your complete trip plans with all details included",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: CreditCard,
                title: "Expense Tracking",
                description: "Track your actual expenses and compare them with AI estimates to stay within budget",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: MapPin,
                title: "Accurate Indian Pricing",
                description: "Get realistic costs for Indian trains, hotels, food, and attractions based on current market rates",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: Zap,
                title: "Custom Budgets",
                description: "Set your own budget ranges or choose from preset options for budget, mid-range, or luxury travel",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-2xl">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className={`p-4 bg-gradient-to-r ${feature.color} rounded-2xl inline-block mb-6 shadow-lg`}>
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                    <p className="text-white/80 leading-relaxed">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="relative bg-gradient-to-b from-purple-900 to-indigo-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Create your perfect trip in just a few simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Create Your Trip",
                description: "Enter your destination, dates, budget, and interests. Choose from preset budgets or set custom ranges.",
                icon: Calendar
              },
              {
                step: 2,
                title: "AI Generates Plan",
                description: "Our AI creates a detailed itinerary with accurate Indian pricing for transportation, hotels, and activities.",
                icon: Brain
              },
              {
                step: 3,
                title: "Modify & Track",
                description: "Chat with AI to adjust plans, track expenses, and download your complete itinerary as a PDF.",
                icon: MessageCircle
              }
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-2xl font-bold text-white">{step.step}</span>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                  <step.icon className="h-8 w-8 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                  <p className="text-white/80 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 py-24">
        <div className="relative px-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to plan your next adventure?
            </h2>
            <p className="text-xl text-white/90 mb-10 leading-relaxed">
              Join thousands of travelers using our AI-powered trip planner with accurate Indian pricing and smart features.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold shadow-2xl transition-all duration-200 hover:shadow-3xl">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
