
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation(); // hämtar sökvägen

  useEffect(() => {
    // Loggar ett fel i konsolen om användaren försöker gå till en ogiltig sida
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground mb-4">Oops! Sidan hittades inte</p>
        <Button asChild>
          <Link to="/">
            Tillbaka till startsidan
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
