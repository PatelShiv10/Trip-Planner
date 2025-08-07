
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plane, MapPin, Calendar, Users, Brain, Shield, Globe } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-white">
        <div className="pb-80 pt-16 sm:pb-40 sm:pt-24 lg:pb-48 lg:pt-40">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 sm:static">
            <div className="sm:max-w-lg">
              <h1 className="font-bold tracking-tight text-gray-900 text-4xl sm:text-6xl">
                AI-Powered Travel Planning
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                Let artificial intelligence create the perfect itinerary for your next adventure. 
                Smart planning, real-time updates, and personalized recommendations.
              </p>
            </div>
            <div>
              <div className="mt-10">
                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/auth">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Plane className="mr-2 h-5 w-5" />
                      Start Planning
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Learn More
                  </Button>
                </div>

                {/* Feature highlights */}
                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Brain className="mr-2 h-4 w-4 text-blue-600" />
                    AI-Generated Itineraries
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="mr-2 h-4 w-4 text-blue-600" />
                    Secure & Private
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="mr-2 h-4 w-4 text-blue-600" />
                    Global Destinations
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for perfect trips
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Our AI analyzes thousands of data points to create personalized travel experiences tailored just for you.
            </p>
          </div>
          
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <Brain className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Smart Itinerary Generation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Our AI considers your preferences, budget, and travel dates to create optimized daily itineraries with activities, restaurants, and attractions.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Real-time Updates</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Get live weather updates, current exchange rates, and local event information to make informed decisions during your trip.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle>Group Planning</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Plan trips for any group size with expense tracking, shared itineraries, and collaborative decision making tools.
                  </CardDescription>
                </CardContent>
              </Card>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to plan your next adventure?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of travelers who trust AI Travel Planner to create unforgettable experiences.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Get Started Free
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
