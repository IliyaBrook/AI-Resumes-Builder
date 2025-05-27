import PersonalInfoSkeletonLoader from "@/components/skeleton-loader/personal-info-loader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useGetDocument from "@/features/document/use-get-document-by-id";
import useUpdateDocument from "@/features/document/use-update-document";
import useDebounce from "@/hooks/use-debounce";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Mail, Phone, MapPin, Github, Linkedin } from "lucide-react";

const PersonalInfoForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();

  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    setIsInitialized(false);
  }, [documentId]);

  const [personalInfo, setPersonalInfo] = useState<{
    id?: number;
    firstName: string;
    lastName: string;
    jobTitle: string;
    address: string;
    phone: string;
    email: string;
    github?: string;
    linkedin?: string;
  }>(
    {
      id: undefined,
      firstName: "",
      lastName: "",
      jobTitle: "",
      address: "",
      phone: "",
      email: "",
      github: "",
      linkedin: "",
    }
  );

  useEffect(() => {
    if (resumeInfo?.personalInfo && !isInitialized) {
      setPersonalInfo({
        id: resumeInfo.personalInfo.id ?? undefined,
        firstName: resumeInfo.personalInfo.firstName || "",
        lastName: resumeInfo.personalInfo.lastName || "",
        jobTitle: resumeInfo.personalInfo.jobTitle || "",
        address: resumeInfo.personalInfo.address || "",
        phone: resumeInfo.personalInfo.phone || "",
        email: resumeInfo.personalInfo.email || "",
        github: resumeInfo.personalInfo.github || "",
        linkedin: resumeInfo.personalInfo.linkedin || "",
      });
      setIsInitialized(true);
    }
  }, [resumeInfo?.personalInfo, isInitialized]);

  const debouncedPersonalInfo = useDebounce(personalInfo, 600);

  useEffect(() => {
    if (!resumeInfo || !isInitialized) return;
    
    const hasChanges = JSON.stringify(debouncedPersonalInfo) !== JSON.stringify({
      id: resumeInfo.personalInfo?.id ?? undefined,
      firstName: resumeInfo.personalInfo?.firstName || "",
      lastName: resumeInfo.personalInfo?.lastName || "",
      jobTitle: resumeInfo.personalInfo?.jobTitle || "",
      address: resumeInfo.personalInfo?.address || "",
      phone: resumeInfo.personalInfo?.phone || "",
      email: resumeInfo.personalInfo?.email || "",
      github: resumeInfo.personalInfo?.github || "",
      linkedin: resumeInfo.personalInfo?.linkedin || "",
    });

    if (hasChanges) {
      setResumeInfo({
        personalInfo: debouncedPersonalInfo,
      });
    }
  }, [debouncedPersonalInfo, resumeInfo, isInitialized, setResumeInfo]);

  const handleChange = useCallback(
    (e: { target: { name: string; value: string } }) => {
      const { name, value } = e.target;
      setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  if (isLoading) {
    return <PersonalInfoSkeletonLoader />;
  }

  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Personal Information</h2>
        <p className="text-sm">Get Started with the personal information</p>
      </div>
      <div>
        <form>
          <div className="space-y-4">
            {}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">First Name</Label>
                <Input
                  name="firstName"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={personalInfo.firstName}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-sm">Last Name</Label>
                <Input
                  name="lastName"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={personalInfo.lastName}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
            </div>

            {}
            <div>
              <Label className="text-sm">Job Title</Label>
              <Input
                name="jobTitle"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfo.jobTitle}
                onChange={handleChange}
                className="h-9"
              />
            </div>

            {}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-sm">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    name="phone"
                    required
                    autoComplete="off"
                    placeholder=""
                    value={personalInfo.phone}
                    onChange={handleChange}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="relative">
                <Label className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    name="email"
                    required
                    autoComplete="off"
                    placeholder=""
                    value={personalInfo.email}
                    onChange={handleChange}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>

            {}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-sm">Github</Label>
                <div className="relative">
                  <Github className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    name="github"
                    autoComplete="off"
                    placeholder="username"
                    value={personalInfo.github}
                    onChange={handleChange}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
              <div className="relative">
                <Label className="text-sm">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    name="linkedin"
                    autoComplete="off"
                    placeholder="username"
                    value={personalInfo.linkedin}
                    onChange={handleChange}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>

            {}
            <div className="relative">
              <Label className="text-sm">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  name="address"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={personalInfo.address}
                  onChange={handleChange}
                  className="pl-8 h-9"
                />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
