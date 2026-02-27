import { FaFileAlt, FaTrash } from "react-icons/fa";
import { DriveFile } from "./types";

interface FileCardProps {
  file: DriveFile;
  onPreview?: (file: DriveFile) => void;
  onDelete: (id: string) => void;
}

const formatDate = (value: string) => {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString();
};

export default function FileCard({ file, onPreview, onDelete }: FileCardProps) {
  const handleOpen = () => {
    if (onPreview) {
      onPreview(file);
    }
  };
  const typeLabel = file.type.charAt(0).toUpperCase() + file.type.slice(1);

  return (
    <div className="group bg-white/10 backdrop-blur-md rounded-xl p-5 shadow-lg transition-all transform hover:-translate-y-1 hover:shadow-2xl flex flex-col gap-4">
      <div
        className="flex items-center gap-4 cursor-pointer"
        onDoubleClick={handleOpen}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/10 text-[#ff9c4b]">
          <FaFileAlt className="text-2xl" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-white truncate">{file.name}</p>
          <p className="text-sm text-white/70">
            {typeLabel} • {file.size} • {formatDate(file.date)}
          </p>
        </div>
      </div>
      <div className="flex justify-end items-center gap-3">
        {onPreview && (
          <button
            onClick={handleOpen}
            className="px-4 py-2 rounded-lg bg-[#271c70] text-white font-medium hover:bg-[#ff9c4b] hover:text-black transition"
          >
            Preview
          </button>
        )}
        <button
          onClick={() => onDelete(file.id)}
          className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-red-500/90 transition"
          aria-label={`Delete ${file.name}`}
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
}
