
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProfessionalProfile {
  bio: string;
  yearsExperience: string;
  specialties: string;
}

interface ProfessionalProfileStepProps {
  professionalProfile: ProfessionalProfile;
  setProfessionalProfile: (profile: ProfessionalProfile) => void;
}

const ProfessionalProfileStep = ({ professionalProfile, setProfessionalProfile }: ProfessionalProfileStepProps) => {
  const experienceOptions = [
    { value: "0-1", label: "0-1 years" },
    { value: "2-5", label: "2-5 years" },
    { value: "6-10", label: "6-10 years" },
    { value: "11-15", label: "11-15 years" },
    { value: "16+", label: "16+ years" }
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white">Your Experience</h3>
        <p className="text-slate-400">Share your expertise and background</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={professionalProfile.bio}
          onChange={(e) => setProfessionalProfile({ ...professionalProfile, bio: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Tell clients about your experience and passion for your craft..."
          rows={4}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="yearsExperience">Years of Experience</Label>
        <Select value={professionalProfile.yearsExperience} onValueChange={(value) => setProfessionalProfile({ ...professionalProfile, yearsExperience: value })}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
            <SelectValue placeholder="Select experience" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 border-slate-600">
            {experienceOptions.map((option) => (
              <SelectItem key={option.value} value={option.value} className="text-white focus:bg-slate-600">
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="specialties">Specialties</Label>
        <Textarea
          id="specialties"
          value={professionalProfile.specialties}
          onChange={(e) => setProfessionalProfile({ ...professionalProfile, specialties: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Hair cuts, beard trims, styling, etc."
          rows={3}
        />
      </div>
    </div>
  );
};

export default ProfessionalProfileStep;
