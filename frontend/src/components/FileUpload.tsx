import React, { useState } from "react";
import { sendFile } from "../services/api";
import { ArrowUpTrayIcon } from "@heroicons/react/24/outline";

const FileUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (uploadedFiles.length >= 1) {
      setError("File upload limit reached (1 file max).");
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      await sendFile(file);
      setUploadedFiles((prev) => [...prev, file]);
    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.error ||
        `Error uploading ${file.name}. Please try again.`;
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col w-full p-4">
      <div className="flex items-center w-full space-x-4">
        {/* Left Icon / Upload Indicator */}
        <div className="flex items-center justify-center">
          {!isUploading && (
            <label htmlFor="file-upload" className="cursor-pointer">
              <ArrowUpTrayIcon
                className={`h-6 w-6 ${
                  uploadedFiles.length >= 1 || isUploading
                    ? "text-gray-400"
                    : "text-blue-500"
                }`}
              />
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading || uploadedFiles.length >= 1}
              />
            </label>
          )}
          {isUploading && (
            <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          )}
        </div>

        <div className="flex-1">
          {error && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-500">{error}</span>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <ul className="flex flex-col space-y-1">
              {uploadedFiles.map((file, index) => (
                <li
                  key={index}
                  className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md"
                >
                  {file.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
