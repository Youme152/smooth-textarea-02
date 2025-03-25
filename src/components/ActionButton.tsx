
import React from "react";

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
}

export function ActionButton({ icon, label }: ActionButtonProps) {
  return (
    <button
      type="button"
      className="flex items-center gap-2 px-4 py-2 bg-neutral-50 hover:bg-neutral-100 rounded-full border border-neutral-200 text-neutral-600 hover:text-neutral-900 transition-colors dark:bg-neutral-900 dark:hover:bg-neutral-800 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  );
}
