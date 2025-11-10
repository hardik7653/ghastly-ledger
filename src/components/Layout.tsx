import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Skull, FileText, Target, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Skull },
    { path: "/cases", label: "Cases", icon: FileText },
    { path: "/targets", label: "Targets", icon: Target },
    { path: "/new", label: "New", icon: PlusCircle },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with logo and navigation */}
      <header className="border-b border-border/50 horror-border sticky top-0 z-50 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <Skull className="w-8 h-8 text-accent group-hover:animate-pulse" />
              <h1 className="text-2xl font-heading text-foreground">
                Case Archives
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation tabs */}
      <nav className="border-b border-border/30 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center space-x-2 px-6 py-3 border-b-2 transition-all font-medium",
                  location.pathname === path
                    ? "border-accent text-accent horror-glow"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-accent/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Classified Archives • Access Restricted</p>
        </div>
      </footer>
    </div>
  );
};
