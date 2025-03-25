
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

  return (
    <div className="suggestion-dropdown absolute left-0 right-0 bg-black/90 backdrop-blur-md rounded-lg overflow-hidden shadow-lg z-10 mt-1 transition-all duration-150 border border-neutral-800">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => {
          // Don't highlight with color, just show the full suggestion
          return (
            <li 
              key={index}
              className="px-4 py-2.5 text-gray-300 hover:bg-neutral-800 transition-colors cursor-pointer"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
