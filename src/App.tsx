
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Treatment from "./pages/Treatment";
import Dead from "./pages/Dead";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Determine the base path for routing based on environment
// Remove trailing slash for proper route handling
const getBasename = () => {
  // In production, use the vet-xpert path
  if (import.meta.env.PROD) {
    return "/vet-xpert";
  }
  // In development, use root path
  return "";
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={getBasename()}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/treatment/:animalId" element={<Treatment />} />
          <Route path="/dead/:animalId" element={<Dead />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
