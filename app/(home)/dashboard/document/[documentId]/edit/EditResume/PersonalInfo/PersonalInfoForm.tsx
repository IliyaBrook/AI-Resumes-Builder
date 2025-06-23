'use client';
// components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Label,
  Input,
  PersonalInfoLoader,
} from '@/components';
// hooks
import { useDebounce, useGetDocumentById, useUpdateDocument } from '@/hooks';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Github, Linkedin, ChevronDown } from 'lucide-react';
import { PersonalInfoType } from '@/types/resume.type';
import { useFirstRender } from '@/context/first-render-provider';

const PersonalInfoForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const personalInfo = resumeInfo?.personalInfo;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const { isDataLoaded } = useFirstRender();

  const [localPersonalInfo, setLocalPersonalInfo] = useState<PersonalInfoType>(
    personalInfo || {
      firstName: '',
      lastName: '',
      jobTitle: '',
      address: '',
      phone: '',
      email: '',
      github: '',
      linkedin: '',
    }
  );

  const [localDisplayFormat, setLocalDisplayFormat] = useState<'default' | 'compact'>(
    (resumeInfo?.personalInfoDisplayFormat as 'default' | 'compact') || 'default'
  );

  const debouncedPersonalInfo = useDebounce(localPersonalInfo, 500);
  const debouncedDisplayFormat = useDebounce(localDisplayFormat, 500);

  useEffect(() => {
    if (personalInfo && (!localPersonalInfo.firstName || !localPersonalInfo.lastName)) {
      setLocalPersonalInfo(personalInfo);
    }
  }, [personalInfo]);

  useEffect(() => {
    if (resumeInfo?.personalInfoDisplayFormat) {
      setLocalDisplayFormat(resumeInfo.personalInfoDisplayFormat as 'default' | 'compact');
    }
  }, [resumeInfo?.personalInfoDisplayFormat]);

  useEffect(() => {
    if (isDataLoaded && debouncedPersonalInfo && debouncedPersonalInfo !== personalInfo) {
      setResumeInfo({ personalInfo: debouncedPersonalInfo });
    }
  }, [debouncedPersonalInfo, personalInfo, setResumeInfo, isDataLoaded]);

  useEffect(() => {
    if (
      isDataLoaded &&
      debouncedDisplayFormat &&
      debouncedDisplayFormat !== resumeInfo?.personalInfoDisplayFormat
    ) {
      setResumeInfo({ personalInfoDisplayFormat: debouncedDisplayFormat });
    }
  }, [debouncedDisplayFormat, resumeInfo?.personalInfoDisplayFormat, setResumeInfo, isDataLoaded]);

  const handleChange = useCallback((e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setLocalPersonalInfo((prev: PersonalInfoType) => ({ ...prev, [name]: value }));
  }, []);

  if (isLoading) {
    return <PersonalInfoLoader />;
  }
  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Personal Information</h2>
        <p className="text-sm">Get Started with the personal information</p>
      </div>

      <div className="mb-4">
        <Label className="text-sm">Display Format</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between h-9">
              {localDisplayFormat === 'default' ? 'Default' : 'Compact'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => setLocalDisplayFormat('default')}>
              Default
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLocalDisplayFormat('compact')}>
              Compact
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <form>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">First Name</Label>
                <Input
                  name="firstName"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={localPersonalInfo.firstName || ''}
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
                  value={localPersonalInfo.lastName || ''}
                  onChange={handleChange}
                  className="h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm">Job Title</Label>
              <Input
                name="jobTitle"
                required
                autoComplete="off"
                placeholder=""
                value={localPersonalInfo.jobTitle || ''}
                onChange={handleChange}
                className="h-9"
              />
            </div>

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
                    value={localPersonalInfo.phone || ''}
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
                    value={localPersonalInfo.email || ''}
                    onChange={handleChange}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-sm">Github</Label>
                <div className="relative">
                  <Github className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    name="github"
                    autoComplete="off"
                    placeholder="username"
                    value={localPersonalInfo.github || ''}
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
                    value={localPersonalInfo.linkedin || ''}
                    onChange={handleChange}
                    className="pl-8 h-9"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <Label className="text-sm">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  name="address"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={localPersonalInfo.address || ''}
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
