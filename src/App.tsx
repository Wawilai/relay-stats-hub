import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Report from "./pages/Report";
import ReportDetails from "./pages/ReportDetails";
import Activity from "./pages/Activity";
import MailRelay from "./pages/MailRelay";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <Layout>
              <Dashboard />
            </Layout>
          } />
          <Route path="/report" element={
            <Layout>
              <Report />
            </Layout>
          } />
          <Route path="/report/details" element={
            <Layout>
              <ReportDetails />
            </Layout>
          } />
          <Route path="/activity" element={
            <Layout>
              <Activity />
            </Layout>
          } />
          <Route path="/mailrelay" element={
            <Layout>
              <MailRelay />
            </Layout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
