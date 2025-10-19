import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import { SupportChat } from "./components/SupportChat";
import Home from "./pages/Home";
import AnalyzeFinances from "./pages/AnalyzeFinances";
import CompareInvestments from "./pages/CompareInvestments";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Portfolio from "./pages/Portfolio";
import Trades from "./pages/Trades";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<AnalyzeFinances />} />
          <Route path="/compare" element={<CompareInvestments />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/trades" element={<Trades />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <SupportChat />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
