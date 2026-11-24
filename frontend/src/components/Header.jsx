import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Printer, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const onLanding = location.pathname === "/";

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md"
      data-testid="app-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-logo">
          <div className="h-9 w-9 rounded-lg bg-sky-600 flex items-center justify-center shadow-sm">
            <Printer className="h-5 w-5 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-heading text-lg font-bold tracking-tight text-slate-900">
            LargePrint <span className="text-sky-600">AI</span>
          </span>
        </Link>

        {onLanding && (
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="nav-how-it-works">How It Works</a>
            <a href="#use-cases" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="nav-use-cases">Use Cases</a>
            <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors" data-testid="nav-faq">Resolution Guide</a>
          </nav>
        )}

        <Button
          onClick={() => navigate("/app")}
          className="rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium transition-colors"
          data-testid="header-cta"
        >
          {onLanding ? "Upload Image" : "New Project"}
          <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </header>
  );
};
