
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, MapPin, Calendar, Users, Brain, Shield, Globe, Star, ArrowRight, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800">
      {/* Navigation */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white rounded-xl">
                <Plane className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xl font-bold text-white">Triply</span>
            </div>
            <Link to="/auth">
              <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-6 py-2 rounded-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              AI-Powered
              <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Travel Planner
              </span>
              <br />
              <span className="text-4xl md:text-5xl">Web UI Kit</span>
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
              <div className="flex items-center space-x-4 text-white">
                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Responsive Design</span>
              </div>
              
              <div className="flex items-center space-x-4 text-white">
                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Light & Dark Mode</span>
              </div>
              
              <div className="flex items-center space-x-4 text-white">
                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Style guide included</span>
              </div>
              
              <div className="flex items-center space-x-4 text-white">
                <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
                <span className="text-lg">Neatly & Organized</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white px-8 py-4 text-lg rounded-xl shadow-2xl">
                  <Plane className="mr-2 h-5 w-5" />
                  Start Planning Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Stats Section */}
            <div className="flex justify-center items-center space-x-8 mb-16">
              <div className="text-center">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-white">200+</div>
                    <div className="text-white/80">Screens</div>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Star className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white/80">Figma variables</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What's Inside Section */}
      <div className="relative py-24 bg-gradient-to-b from-purple-800 to-purple-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-5xl font-bold text-white mb-8">
                What's inside?
              </h2>
              <p className="text-xl text-white/80 mb-12 leading-relaxed">
                We provide simple and clean design. Each screen has a unique component and name so it's easy to customize.
              </p>
              
              <div className="space-y-6">
                {[
                  {
                    icon: Sparkles,
                    title: "Pixel Perfect",
                    description: "All Layer & Shapes are perfectly placed",
                    color: "from-blue-500 to-cyan-500"
                  },
                  {
                    icon: Brain,
                    title: "Easy Customizable", 
                    description: "100% Easy to Change & Customizable",
                    color: "from-green-500 to-emerald-500"
                  },
                  {
                    icon: Shield,
                    title: "Component & Style",
                    description: "Color, Text and component guides provided",
                    color: "from-purple-500 to-pink-500"
                  },
                  {
                    icon: Globe,
                    title: "Organized Layers",
                    description: "The file is named, grouped and well organized",
                    color: "from-orange-500 to-red-500"
                  },
                  {
                    icon: MapPin,
                    title: "Light & Dark Themes",
                    description: "Available in Both and Dark Themes",
                    color: "from-yellow-500 to-orange-500"
                  },
                  {
                    icon: Star,
                    title: "Figma Variables",
                    description: "Figma Variables enable reusable, dynamic design values.",
                    color: "from-indigo-500 to-purple-500"
                  }
                ].map((feature, idx) => (
                  <Card key={idx} className="bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20 transition-all duration-300 rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 bg-gradient-to-r ${feature.color} rounded-xl flex-shrink-0`}>
                          <feature.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                          <p className="text-white/80 leading-relaxed">{feature.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                <div className="text-center text-white">
                  <div className="text-6xl mb-4">📱</div>
                  <h3 className="text-2xl font-bold mb-4">Ready-to-use layouts</h3>
                  <p className="text-white/80 mb-8">
                    MateX includes over 300+ ready-to-use screens tailored for AI customer support.
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3 mb-8">
                    {[
                      "Sign In & Sign Up", "AI Chat", "Search",
                      "Calendar", "My Map", "Saved", 
                      "World Feed", "Blog", "Feedback"
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/20 rounded-xl p-3 text-sm font-medium">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
              Join thousands of travelers who trust our AI Travel Planner to create unforgettable experiences.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl font-semibold shadow-2xl">
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
