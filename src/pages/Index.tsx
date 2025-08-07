
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, MapPin, Calendar, Users, Brain, Shield, Globe, Sparkles, ArrowRight, Star } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">AI Travel Planner</span>
            </div>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                <Sparkles className="h-4 w-4 text-yellow-400 mr-2" />
                <span className="text-sm text-white/90">AI-Powered Travel Intelligence</span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Plan Your Perfect
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent block">
                Adventure
              </span>
            </h1>
            
            <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
              Let our advanced AI create personalized itineraries, discover hidden gems, and optimize your travel experience with intelligent recommendations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300">
                  <Plane className="mr-2 h-5 w-5" />
                  Start Planning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg rounded-xl backdrop-blur-md">
                Watch Demo
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              {[
                { icon: Brain, text: "AI-Powered Planning", color: "from-blue-400 to-cyan-400" },
                { icon: Shield, text: "Secure & Private", color: "from-green-400 to-emerald-400" },
                { icon: Globe, text: "Global Destinations", color: "from-purple-400 to-pink-400" }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center justify-center space-x-3 p-4 bg-white/5 backdrop-blur-md rounded-xl border border-white/10">
                  <div className={`p-2 bg-gradient-to-r ${feature.color} rounded-lg`}>
                    <feature.icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
              <Star className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-600">Features</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need for amazing trips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our AI analyzes thousands of data points to create personalized travel experiences that match your style and budget perfectly.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: "Smart Itinerary Generation",
                description: "AI creates optimized daily plans with activities, restaurants, and attractions based on your preferences and travel style.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: MapPin,
                title: "Real-time Intelligence",
                description: "Live weather updates, current exchange rates, local events, and crowd predictions to optimize your travel decisions.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Users,
                title: "Collaborative Planning",
                description: "Plan trips for any group size with expense tracking, shared itineraries, and democratic decision-making tools.",
                gradient: "from-purple-500 to-pink-500"
              }
            ].map((feature, idx) => (
              <Card key={idx} className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 hover:scale-105">
                <CardHeader className="pb-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-6">
              Ready to plan your next adventure?
            </h2>
            <p className="mx-auto max-w-xl text-lg leading-8 text-blue-100 mb-10">
              Join thousands of travelers who trust AI Travel Planner to create unforgettable experiences tailored just for them.
            </p>
            <div className="flex items-center justify-center gap-x-6">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold shadow-2xl">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
