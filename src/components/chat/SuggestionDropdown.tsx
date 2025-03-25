
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
    <div className="absolute left-0 right-0 bg-neutral-800/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg border border-neutral-700 z-10 mt-1 transition-all duration-150">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => {
          // If the suggestion starts with the input value, highlight the first character
          const displaySuggestion = suggestion.startsWith(firstChar) 
            ? <span>
                <span className="text-blue-400">{firstChar}</span>
                {suggestion.slice(1)}
              </span> 
            : suggestion;
            
          return (
            <li 
              key={index}
              className="px-4 py-2.5 text-gray-300 hover:bg-neutral-700 transition-colors cursor-pointer"
              onClick={() => onSuggestionClick(suggestion)}
            >
              {displaySuggestion}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
