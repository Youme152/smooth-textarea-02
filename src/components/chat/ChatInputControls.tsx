
import { SendButton } from "./SendButton";

interface ChatInputControlsProps {
  value: string;
  onSend: () => void;
  disabled?: boolean;
}

export function ChatInputControls({
  value,
  onSend,
  disabled = false
}: ChatInputControlsProps) {
  return (
    <div className="flex items-center justify-between p-3">
      <div className="flex-1"></div>
      
      <SendButton 
        onClick={onSend}
        disabled={!value.trim() || disabled}
      />
    </div>
  );
}
