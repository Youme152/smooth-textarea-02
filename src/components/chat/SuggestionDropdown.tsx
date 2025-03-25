
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
    <div className="suggestion-dropdown absolute left-0 right-0 bg-black/80 backdrop-blur-lg rounded-lg overflow-hidden shadow-lg z-10 mt-1 transition-all duration-150 border border-neutral-800/50">
      <ul className="py-1">
        {suggestions.map((suggestion, index) => (
          <li 
            key={index}
            className="px-4 py-2.5 text-white hover:bg-neutral-800/50 transition-colors cursor-pointer"
            onClick={() => onSuggestionClick(suggestion)}
          >
            <span className="text-white">{suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
