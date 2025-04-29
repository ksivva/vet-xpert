
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Treatment from "./pages/Treatment";
import Dead from "./pages/Dead";
import Realize from "./pages/Realize";
import NotFound from "./pages/NotFound";
import './App.css';

const queryClient = new QueryClient();

// Determine the base path for routing based on environment
const getBasename = () => {
  // In production, use the vet-xpert path
  return import.meta.env.PROD ? "/vet-xpert" : "";
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={getBasename()}>
        <div className="min-h-screen bg-vetxpert-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/treatment/:animalId" element={<Treatment />} />
              <Route path="/dead/:animalId" element={<Dead />} />
              <Route path="/realize/:animalId" element={<Realize />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
