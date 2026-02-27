import { useRef } from "react";
import { FaUpload } from "react-icons/fa";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUpload({ onFilesSelected }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const incomingFiles = event.target.files;
    if (!incomingFiles || incomingFiles.length === 0) return;
    onFilesSelected(Array.from(incomingFiles));
    event.target.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple
      />
      <button
        onClick={handleButtonClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#271c70] text-white font-semibold hover:bg-[#ff9c4b] hover:text-black transition"
      >
        <FaUpload />
        Upload File
      </button>
    </>
  );
}
