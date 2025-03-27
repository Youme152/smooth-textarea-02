
import { DeepSearchDropdown } from "./DeepSearchDropdown";
import { SendButton } from "./SendButton";

interface ChatInputControlsProps {
  value: string;
  onSend: () => void;
  deepResearchActive: boolean;
  toggleDeepResearch: () => void;
  disabled?: boolean;
}

export function ChatInputControls({
  value,
  onSend,
  deepResearchActive,
  toggleDeepResearch,
  disabled = false
}: ChatInputControlsProps) {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex items-center gap-2">
        <DeepSearchDropdown 
          deepResearchActive={deepResearchActive}
          onClick={toggleDeepResearch}
          disabled={disabled}
        />
      </div>
      
      <SendButton 
        onClick={onSend}
        disabled={!value.trim() || disabled}
      />
    </div>
  );
}
