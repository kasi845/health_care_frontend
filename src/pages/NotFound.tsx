import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404: Route not found:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="mb-2 text-4xl font-bold text-primary">404</h1>
        <p className="mb-6 text-muted-foreground">Page not found</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/" className="text-primary underline hover:no-underline">Start</Link>
          <Link to="/system-ready" className="text-primary underline hover:no-underline">System</Link>
          <Link to="/home" className="text-primary underline hover:no-underline">Dashboard</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
