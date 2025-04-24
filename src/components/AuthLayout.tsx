
import Logo from './Logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-vetxpert-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo />
          <h1 className="mt-6 text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
