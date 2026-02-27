"use client";

import { ChangeEvent } from "react";
import { MissionGalleryItem } from "../types";
import { TextInput } from "./inputs";
import { FaPlus } from "react-icons/fa";

type GallerySectionProps = {
  gallery: MissionGalleryItem[];
  isEditMode: boolean;
  onAddGalleryItem: () => void;
  onGalleryChange: (index: number, key: keyof MissionGalleryItem, value: string) => void;
  onGalleryFileChange: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
};

export const GallerySection = ({
  gallery,
  isEditMode,
  onAddGalleryItem,
  onGalleryChange,
  onGalleryFileChange,
}: GallerySectionProps) => (
  <div className="grid grid-cols-2 gap-4">
    {gallery.map((item, index) => (
      <div
        key={index}
        className="relative overflow-hidden rounded-3xl border border-white/20 shadow-lg group bg-white/5"
      >
        {isEditMode ? (
          <div className="p-4 space-y-3">
            <div className="w-full h-32 rounded-xl overflow-hidden bg-black/20 flex items-center justify-center">
              {item.src ? (
                <img
                  src={item.src}
                  alt={item.alt || `Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white/40 text-sm">Preview will appear here</span>
              )}
            </div>
            <TextInput
              value={item.alt}
              onChange={(val) => onGalleryChange(index, "alt", val)}
              placeholder="Alt text..."
            />
            <TextInput
              value={item.src}
              onChange={(val) => onGalleryChange(index, "src", val)}
              placeholder="Image URL..."
            />
            {item.fileName && (
              <p className="text-xs text-white/60">Uploaded: {item.fileName}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <input
                id={`edit-gallery-upload-${index}`}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onGalleryFileChange(event, index)}
              />
              <button
                type="button"
                onClick={() => document.getElementById(`edit-gallery-upload-${index}`)?.click()}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
              >
                Upload from computer
              </button>
            </div>
          </div>
        ) : (
          <>
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition" />
          </>
        )}
      </div>
    ))}
    {isEditMode && (
      <button
        onClick={onAddGalleryItem}
        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold min-h-[160px]"
      >
        <FaPlus /> Add gallery image
      </button>
    )}
  </div>
);
