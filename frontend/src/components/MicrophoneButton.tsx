import React from "react";
import { MicrophoneIcon } from "@heroicons/react/24/outline";

interface MicrophoneButtonProps {
  disabled: boolean;
  handleClick: () => void;
}

const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  disabled,
  handleClick,
}) => (
  <button
    type="button"
    onClick={handleClick}
    disabled={disabled}
    className={`p-2 rounded flex items-center justify-center ${
      disabled ? "bg-gray-200 text-gray-400" : "bg-gray-200 hover:bg-gray-300"
    }`}
    aria-label="Record voice input"
  >
    <MicrophoneIcon className="h-6 w-6" />
  </button>
);

export default MicrophoneButton;
