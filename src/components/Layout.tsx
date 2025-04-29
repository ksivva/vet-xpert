
import React, { useEffect, useState } from 'react';
import Logo from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title,
  showBackButton = false
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authLoaded, setAuthLoaded] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Development authentication helper - auto signs in with development account
  // but continues rendering even if authentication fails
  useEffect(() => {
    const checkAndSignIn = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          try {
            // Try to sign in with anonymous access for development
            const { error } = await supabase.auth.signInWithPassword({
              email: 'dev@vetxpert.com',
              password: 'devpassword123'
            });
            
            if (error) {
              console.log("Authentication error (app will continue to work):", error.message);
              setAuthError(error.message);
              
              // Only show toast in development
              if (import.meta.env.DEV) {
                toast.error("Authentication error: " + error.message);
                toast.info("App continues in limited mode without authentication");
              }
            } else {
              toast.success("Signed in with development account");
            }
          } catch (err) {
            console.error("Authentication error:", err);
            setAuthError(err instanceof Error ? err.message : String(err));
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
        setAuthError(err instanceof Error ? err.message : String(err));
      } finally {
        // Always mark auth as loaded so the app renders
        setAuthLoaded(true);
      }
    };

    // Try authentication but don't block rendering
    checkAndSignIn();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  // Always render the layout, even if auth is still loading
  return (
    <div className="min-h-screen bg-vetxpert-background">
      <header className="bg-vetxpert-primary shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {showBackButton ? (
            <button 
              onClick={handleBack}
              className="text-white"
              aria-label="Go back"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
          ) : (
            <div className="w-6"></div>
          )}
          
          <Logo />
          
          <div className="w-6"></div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {authError && import.meta.env.DEV && (
          <div className="bg-yellow-50 text-yellow-800 p-4 mb-6 rounded-lg border border-yellow-200">
            <p className="font-medium">Auth warning (dev only)</p>
            <p className="text-sm">The app continues to work in limited mode: {authError}</p>
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
