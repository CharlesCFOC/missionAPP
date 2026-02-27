"use client";

export interface MissionLeader {
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface MissionDocument {
  title: string;
  description: string;
  link: string;
  fileName?: string;
  fileData?: string;
}

export interface MissionTimelineEntry {
  day: string;
  title: string;
  details: string;
}

export interface MissionStat {
  label: string;
  value: string;
}

export interface MissionGalleryItem {
  src: string;
  alt: string;
  fileName?: string;
  fileData?: string;
}

export interface MissionTestimonial {
  quote: string;
  author: string;
  role: string;
}

export interface MissionData {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  city: string;
  coverImage: string;
  dateDisplay: string;
  startDate?: string;
  endDate?: string;
  pricePerPerson: number;
  totalSpots: number;
  spotsReserved: number;
  description: string;
  objectives: string[];
  stats: MissionStat[];
  practicalInfo: { icon: string; label: string; value: string }[];
  timeline: MissionTimelineEntry[];
  leaders: MissionLeader[];
  documents: MissionDocument[];
  testimonials: MissionTestimonial[];
  gallery: MissionGalleryItem[];
  status?: "active" | "draft" | "archived";
  createdAt?: string;
}
