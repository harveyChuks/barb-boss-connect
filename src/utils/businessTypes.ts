import { Database } from "@/integrations/supabase/types";

export type BusinessType = Database["public"]["Enums"]["business_type"];

/**
 * Business Types - Categories that define what kind of business you operate
 * Example: "Hair Salon", "Cleaning Service", "Fitness Center"
 */
export const BUSINESS_TYPES = [
  { value: "barbershop" as BusinessType, label: "Barbershop" },
  { value: "hair_salon" as BusinessType, label: "Hair Salon" },
  { value: "makeup_artist" as BusinessType, label: "Makeup Artist" },
  { value: "nail_salon" as BusinessType, label: "Nail Salon" },
  { value: "spa" as BusinessType, label: "Spa" },
  { value: "beauty_clinic" as BusinessType, label: "Beauty Clinic" },
  { value: "fashion_designer" as BusinessType, label: "Fashion Designer" },
  { value: "cleaning_service" as BusinessType, label: "Cleaning Service" },
  { value: "fitness_center" as BusinessType, label: "Fitness Center" },
  { value: "massage_therapy" as BusinessType, label: "Massage Therapy" },
  { value: "tattoo_parlor" as BusinessType, label: "Tattoo Parlor" },
  { value: "medspa" as BusinessType, label: "Medical Spa" },
  { value: "driving_service" as BusinessType, label: "Driving Service" },
  { value: "painting" as BusinessType, label: "Painting Service" },
  { value: "flooring" as BusinessType, label: "Flooring Service" },
  { value: "plumbing" as BusinessType, label: "Plumbing Service" }
] as const;

/**
 * Get business type label from value
 */
export const getBusinessTypeLabel = (value: BusinessType): string => {
  const businessType = BUSINESS_TYPES.find(bt => bt.value === value);
  return businessType?.label || value;
};
