
import { cn } from "@/lib/utils";

interface SuggestionDropdownProps {
  inputValue: string;
  suggestions: string[];
  visible: boolean;
  onSuggestionClick: (suggestion: string) => void;
}

export function SuggestionDropdown({
  inputValue,
  suggestions,
  visible,
  onSuggestionClick
}: SuggestionDropdownProps) {
  if (!visible || !inputValue || suggestions.length === 0) return null;

  // Get the first character to highlight
  const firstChar = inputValue.toLowerCase().charAt(0);

  return (
    <div className="suggestion-dropdown absolute left-0 right-0 bg-black/80 backdrop-blur-lg rounded-lg overflow-hidden shadow-lg z-10 mt-1 transition-all duration-150 border border-neutral-800/50">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => {
          // Highlight the first character of the suggestion that matches the input
          const highlightedSuggestion = (
            <span className="text-white">
              {firstChar}<span className="text-white/80">{suggestion.slice(1)}</span>
            </span>
          );
          
          return (
            <li 
              key={index}
              className="px-4 py-2.5 text-white hover:bg-neutral-800/50 transition-colors cursor-pointer"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion.toLowerCase().startsWith(firstChar) 
                ? highlightedSuggestion 
                : <span className="text-white">{suggestion}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
