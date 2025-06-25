
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
}

interface PersonalInfoStepProps {
  personalInfo: PersonalInfo;
  setPersonalInfo: (info: PersonalInfo) => void;
}

const PersonalInfoStep = ({ personalInfo, setPersonalInfo }: PersonalInfoStepProps) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white">Personal Information</h3>
        <p className="text-slate-400">Let's start with your basic details</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          value={personalInfo.fullName}
          onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="John Doe"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={personalInfo.email}
          onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="john@example.com"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          value={personalInfo.phone}
          onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="(555) 123-4567"
        />
      </div>
    </div>
  );
};

export default PersonalInfoStep;
