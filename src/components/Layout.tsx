
import React, { useEffect } from 'react';
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

  // Development authentication helper - auto signs in with development account
  useEffect(() => {
    const checkAndSignIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        try {
          // Try to sign in with anonymous access for development
          const { error } = await supabase.auth.signInWithPassword({
            email: 'dev@vetxpert.com',
            password: 'devpassword123'
          });
          
          if (error) {
            // If the user doesn't exist yet or email not confirmed, let's create one and auto-confirm it
            if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
              // First try to sign up
              const { data, error: signupError } = await supabase.auth.signUp({
                email: 'dev@vetxpert.com',
                password: 'devpassword123'
              });
              
              if (signupError) {
                console.error("Failed to create dev account:", signupError);
                return;
              }
              
              // For development, we'll use admin functions to confirm the email
              // In a production environment, user would need to click on the confirmation email
              const { error: adminError } = await supabase.auth.admin.updateUserById(
                data.user?.id as string,
                { email_confirm: true }
              );
              
              if (adminError) {
                console.error("Failed to confirm email:", adminError);
                toast.error("Failed to confirm email. Please check the Supabase dashboard to manually confirm.");
                
                // Try signing in anyway since the account might have been created before
                const { error: loginError } = await supabase.auth.signInWithPassword({
                  email: 'dev@vetxpert.com',
                  password: 'devpassword123'
                });
                
                if (!loginError) {
                  toast.success("Signed in with development account");
                }
              } else {
                toast.success("Development account created and confirmed");
              }
            } else {
              console.error("Authentication error:", error);
            }
          } else {
            toast.success("Signed in with development account");
          }
        } catch (err) {
          console.error("Authentication error:", err);
        }
      }
    };

    checkAndSignIn();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

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
        {title && (
          <h1 className="text-2xl font-bold mb-4 text-vetxpert-primary">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
