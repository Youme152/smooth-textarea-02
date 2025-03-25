
export type Message = {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
};
