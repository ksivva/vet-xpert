import React, { useEffect } from 'react';
import Logo from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { Button } from './ui/button';
import { LogOut } from 'lucide-react';

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

  useEffect(() => {
    const checkAndSignIn = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: 'dev@vetxpert.com',
            password: 'devpassword123'
          });
          
          if (error) {
            if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
              const { data, error: signupError } = await supabase.auth.signUp({
                email: 'dev@vetxpert.com',
                password: 'devpassword123'
              });
              
              if (signupError) {
                console.error("Failed to create dev account:", signupError);
                return;
              }
              
              const { error: adminError } = await supabase.auth.admin.updateUserById(
                data.user?.id as string,
                { email_confirm: true }
              );
              
              if (adminError) {
                console.error("Failed to confirm email:", adminError);
                toast.error("Failed to confirm email. Please check the Supabase dashboard to manually confirm.");
                
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Successfully logged out');
      navigate('/auth');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="min-h-screen bg-vetxpert-background">
      <header className="bg-vetxpert-primary shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {showBackButton ? (
            <button 
              onClick={() => navigate(-1)}
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
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-white hover:text-white hover:bg-vetxpert-primary/90"
          >
            <LogOut className="h-5 w-5" />
          </Button>
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
