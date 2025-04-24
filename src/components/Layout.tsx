
import React from 'react';
import Logo from './Logo';
import { useNavigate, useLocation } from 'react-router-dom';

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

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {showBackButton ? (
            <button 
              onClick={handleBack}
              className="text-vetxpert-blue"
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
          <h1 className="text-2xl font-bold mb-4 text-vetxpert-blue">{title}</h1>
        )}
        {children}
      </main>
    </div>
  );
};

export default Layout;
