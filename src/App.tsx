
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import NewTrip from "./pages/NewTrip";
import TripDetail from "./pages/TripDetail";
import EditTrip from "./pages/EditTrip";
import TripExpenses from "./pages/TripExpenses";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Layout />}>
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="trip/new" element={
                <ProtectedRoute>
                  <NewTrip />
                </ProtectedRoute>
              } />
              <Route path="trip/:id" element={
                <ProtectedRoute>
                  <TripDetail />
                </ProtectedRoute>
              } />
              <Route path="trip/:id/edit" element={
                <ProtectedRoute>
                  <EditTrip />
                </ProtectedRoute>
              } />
              <Route path="trip/:id/expenses" element={
                <ProtectedRoute>
                  <TripExpenses />
                </ProtectedRoute>
              } />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
