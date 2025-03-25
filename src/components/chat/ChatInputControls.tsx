
import { DeepSearchDropdown } from "./DeepSearchDropdown";
import { SendButton } from "./SendButton";

interface ChatInputControlsProps {
  value: string;
  onSend: () => void;
  deepResearchActive: boolean;
  onDeepSearchCategorySelect: (category: string) => void;
}

export function ChatInputControls({
  value,
  onSend,
  deepResearchActive,
  onDeepSearchCategorySelect
}: ChatInputControlsProps) {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-2">
        <DeepSearchDropdown 
          deepResearchActive={deepResearchActive}
          onCategorySelect={onDeepSearchCategorySelect}
        />
      </div>
      
      <SendButton 
        onClick={onSend}
        disabled={!value.trim()}
      />
    </div>
  );
}
