
import { useState } from "react";
import { Database } from "@/integrations/supabase/types";

type BusinessType = Database["public"]["Enums"]["business_type"];

interface Service {
  name: string;
  price: string;
  duration: number;
}

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
}

interface BusinessInfo {
  businessName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  businessType: BusinessType;
}

interface ProfessionalProfile {
  bio: string;
  yearsExperience: string;
  specialties: string;
}

export const useRegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    email: "",
    phone: ""
  });

  const [businessInfo, setBusinessInfo] = useState<BusinessInfo>({
    businessName: "",
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
    businessType: "" as BusinessType
  });

  const [professionalProfile, setProfessionalProfile] = useState<ProfessionalProfile>({
    bio: "",
    yearsExperience: "",
    specialties: ""
  });

  const [services, setServices] = useState<Service[]>([
    { name: "", price: "", duration: 30 }
  ]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return personalInfo.fullName && personalInfo.email && personalInfo.phone;
      case 2:
        return businessInfo.businessName && businessInfo.streetAddress && businessInfo.city && 
               businessInfo.state && businessInfo.zipCode && businessInfo.businessType;
      case 3:
        return professionalProfile.bio && professionalProfile.yearsExperience;
      case 4:
        return services.some(service => service.name && service.price);
      default:
        return false;
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setPersonalInfo({ fullName: "", email: "", phone: "" });
    setBusinessInfo({ businessName: "", streetAddress: "", city: "", state: "", zipCode: "", businessType: "" as BusinessType });
    setProfessionalProfile({ bio: "", yearsExperience: "", specialties: "" });
    setServices([{ name: "", price: "", duration: 30 }]);
  };

  return {
    currentStep,
    personalInfo,
    businessInfo,
    professionalProfile,
    services,
    setPersonalInfo,
    setBusinessInfo,
    setProfessionalProfile,
    setServices,
    handleNext,
    handlePrevious,
    isStepValid,
    resetForm
  };
};
