import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PassphraseModal } from "@/components/PassphraseModal";
import Home from "./pages/Home";
import Cases from "./pages/Cases";
import Targets from "./pages/Targets";
import New from "./pages/New";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      setAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PassphraseModal
          open={!authenticated}
          onAuthenticated={() => setAuthenticated(true)}
        />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/targets" element={<Targets />} />
            <Route path="/new" element={<New />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
