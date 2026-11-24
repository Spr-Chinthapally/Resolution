import React from "react";
import { Printer } from "lucide-react";

export const Footer = () => (
  <footer className="border-t border-slate-200 bg-white mt-24" data-testid="app-footer">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center">
            <Printer className="h-4 w-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-heading font-bold text-slate-900">LargePrint AI</span>
        </div>
        <p className="text-sm text-slate-500 max-w-md">
          Professional large-format print preparation. Resolution targets shown are recommended
          guidelines and depend on final print size and viewing distance.
        </p>
      </div>
      <div className="mt-8 pt-8 border-t border-slate-100 text-xs text-slate-400">
        © {new Date().getFullYear()} LargePrint AI. Prepared for billboards, banners, posters, signs and displays.
      </div>
    </div>
  </footer>
);
