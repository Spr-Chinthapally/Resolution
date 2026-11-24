import React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ErrorMessage = ({ title = "Something went wrong", message, onRetry }) => (
  <div
    className="rounded-xl border border-red-200 bg-red-50 p-5 flex items-start gap-3"
    data-testid="error-message"
  >
    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
    <div className="flex-1">
      <div className="font-semibold text-red-800">{title}</div>
      {message && <p className="mt-1 text-sm text-red-700">{message}</p>}
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="mt-3 rounded-lg border-red-300 text-red-700 hover:bg-red-100"
          data-testid="error-retry-btn"
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Try Again
        </Button>
      )}
    </div>
  </div>
);
