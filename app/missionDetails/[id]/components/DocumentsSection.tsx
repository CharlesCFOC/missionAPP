"use client";

import { ChangeEvent } from "react";
import { motion } from "framer-motion";
import { FaDownload, FaFolderOpen, FaPlus } from "react-icons/fa";
import { MissionDocument } from "../types";
import { fadeIn } from "../utils";
import { TextInput, Textarea } from "./inputs";

type DocumentsSectionProps = {
  documents: MissionDocument[];
  isEditMode: boolean;
  onAddDocument: () => void;
  onDocumentChange: (index: number, key: keyof MissionDocument, value: string) => void;
  onDocumentFileChange: (event: ChangeEvent<HTMLInputElement>, index: number) => void;
};

export const DocumentsSection = ({
  documents,
  isEditMode,
  onAddDocument,
  onDocumentChange,
  onDocumentFileChange,
}: DocumentsSectionProps) => (
  <motion.section
    variants={fadeIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="space-y-6"
  >
    <h2 className="text-2xl font-bold text-[#ff9c4b]">Documents to download</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
      {documents.map((doc, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-[#ff9c4b] via-[#ffb86b] to-[#ff9c4b] flex items-center justify-center text-lg text-white">
              <FaFolderOpen />
            </div>
            {isEditMode ? (
              <TextInput
                value={doc.title}
                onChange={(val) => onDocumentChange(index, "title", val)}
                placeholder="Document title..."
              />
            ) : (
              <div className="flex items-center justify-between gap-3 w-full">
                <h3 className="text-lg font-semibold">{doc.title}</h3>
                {doc.link && (
                  <a
                    href={doc.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Download document"
                    className="inline-flex items-center justify-center text-white hover:text-[#ffb86b] transition"
                  >
                    <FaDownload className="motion-safe:animate-pulse" />
                  </a>
                )}
              </div>
            )}
          </div>
          {isEditMode ? (
            <Textarea
              value={doc.description}
              onChange={(val) => onDocumentChange(index, "description", val)}
              placeholder="Document description..."
              className="min-h-[80px]"
            />
          ) : (
            <p className="text-sm text-white/70">{doc.description}</p>
          )}
          {isEditMode ? (
            <div className="space-y-2">
              <TextInput
                value={doc.link}
                onChange={(val) => onDocumentChange(index, "link", val)}
                placeholder="Document link or data URL..."
              />
              {doc.fileName && <p className="text-xs text-white/60">Uploaded: {doc.fileName}</p>}
              <div className="flex flex-wrap gap-2">
                <input
                  id={`document-upload-${index}`}
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={(event) => onDocumentFileChange(event, index)}
                />
                <button
                  type="button"
                  onClick={() => document.getElementById(`document-upload-${index}`)?.click()}
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
                >
                  Upload from computer
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ))}
    </div>
    {isEditMode && (
      <button
        onClick={onAddDocument}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
      >
        <FaPlus /> Add document
      </button>
    )}
  </motion.section>
);
