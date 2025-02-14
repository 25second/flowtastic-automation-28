
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";
import Servers from "@/pages/Servers";
import Tables from "@/pages/Tables";
import NotFound from "@/pages/NotFound";
import { PrivateRoute } from "@/components/auth/PrivateRoute";

export const AuthenticatedRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        } />
        <Route path="/settings" element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />
        <Route path="/servers" element={
          <PrivateRoute>
            <Servers />
          </PrivateRoute>
        } />
        <Route path="/tables" element={
          <PrivateRoute>
            <Tables />
          </PrivateRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};
