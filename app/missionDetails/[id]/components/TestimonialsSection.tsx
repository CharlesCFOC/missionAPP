"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { MissionTestimonial } from "../types";
import { fadeIn } from "../utils";
import { TextInput, Textarea } from "./inputs";

type TestimonialsSectionProps = {
  testimonials: MissionTestimonial[];
  isEditMode: boolean;
  onAddTestimonial: () => void;
  onTestimonialChange: (index: number, key: keyof MissionTestimonial, value: string) => void;
  gallerySlot?: ReactNode;
};

export const TestimonialsSection = ({
  testimonials,
  isEditMode,
  onAddTestimonial,
  onTestimonialChange,
  gallerySlot,
}: TestimonialsSectionProps) => (
  <motion.section
    variants={fadeIn}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    transition={{ duration: 0.6 }}
    className="space-y-8"
  >
    <h2 className="text-2xl font-bold text-[#ff9c4b]">Testimonials & Gallery</h2>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        {testimonials.map((testimonial, index) => (
          <div
            key={index}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-6 shadow-xl space-y-3"
          >
            {isEditMode ? (
              <>
                <Textarea
                  value={testimonial.quote}
                  onChange={(val) => onTestimonialChange(index, "quote", val)}
                  placeholder="Testimonial quote..."
                  className="min-h-[100px]"
                />
                <div className="grid sm:grid-cols-2 gap-3">
                  <TextInput
                    value={testimonial.author}
                    onChange={(val) => onTestimonialChange(index, "author", val)}
                    placeholder="Author..."
                  />
                  <TextInput
                    value={testimonial.role}
                    onChange={(val) => onTestimonialChange(index, "role", val)}
                    placeholder="Role..."
                  />
                </div>
              </>
            ) : (
              <>
                <p className="text-base italic text-white/90 leading-relaxed">
                  “{testimonial.quote}”
                </p>
                <div className="mt-4">
                  <p className="text-sm font-semibold text-[#ff9c4b]">{testimonial.author}</p>
                  <p className="text-xs text-white/60">{testimonial.role}</p>
                </div>
              </>
            )}
          </div>
        ))}
        {isEditMode && (
          <button
            onClick={onAddTestimonial}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition text-sm font-semibold"
          >
            <FaPlus /> Add testimonial
          </button>
        )}
      </div>
      {gallerySlot}
    </div>
  </motion.section>
);
