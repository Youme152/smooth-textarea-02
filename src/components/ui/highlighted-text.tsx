
import React from "react";
import { cn } from "@/lib/utils";

type HighlightColor = "blue" | "green" | "pink" | "yellow" | "orange" | "teal";

const colorMap: Record<HighlightColor, string> = {
  blue: "bg-blue-400/90",
  green: "bg-green-400/90",
  pink: "bg-pink-400/90",
  yellow: "bg-yellow-300/90",
  orange: "bg-orange-400/90",
  teal: "bg-teal-400/90"
};

interface HighlightedTextProps {
  children: React.ReactNode;
  color: HighlightColor;
  className?: string;
}

export function HighlightedText({ children, color, className }: HighlightedTextProps) {
  return (
    <span className={cn("px-1.5 py-0.5 rounded", colorMap[color], className)}>
      {children}
    </span>
  );
}

export function StylizedHeading({ 
  children, 
  className 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h1 
      className={cn(
        "font-playfair text-4xl md:text-5xl font-normal tracking-tight",
        className
      )}
    >
      {children}
    </h1>
  );
}
