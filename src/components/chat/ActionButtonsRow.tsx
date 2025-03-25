
import React from "react";
import { ActionButton } from "../ActionButton";
import { ImageIcon, FileUp, Figma, MonitorIcon, CircleUserRound } from "lucide-react";

export function ActionButtonsRow() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      <ActionButton
        icon={<ImageIcon className="w-4 h-4" />}
        label="Clone a Screenshot"
      />
      <ActionButton
        icon={<Figma className="w-4 h-4" />}
        label="Import from Figma"
      />
      <ActionButton
        icon={<FileUp className="w-4 h-4" />}
        label="Upload a Project"
      />
      <ActionButton
        icon={<MonitorIcon className="w-4 h-4" />}
        label="Landing Page"
      />
      <ActionButton
        icon={<CircleUserRound className="w-4 h-4" />}
        label="Sign Up Form"
      />
    </div>
  );
}
