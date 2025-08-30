// noinspection XmlDeprecatedElement,JSDeprecatedSymbols

'use client';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  PersonalInfoLoader,
} from '@/components';
import { useGetDocumentById, useUpdateDocument } from '@/hooks';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ChevronDown, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { PersonalInfoType } from '@/types/resume.type';

const PersonalInfoForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const personalInfo = resumeInfo?.personalInfo;
  const { mutate: setResumeInfo } = useUpdateDocument();

  const [localPersonalInfo, setLocalPersonalInfo] = useState<PersonalInfoType>({
    firstName: '',
    lastName: '',
    jobTitle: '',
    address: '',
    phone: '',
    email: '',
    github: '',
    linkedin: '',
  });

  const [localDisplayFormat, setLocalDisplayFormat] = useState<'default' | 'compact'>('default');

  useEffect(() => {
    if (personalInfo) {
      setLocalPersonalInfo(personalInfo);
    }
  }, [personalInfo]);

  useEffect(() => {
    if (resumeInfo?.personalInfoDisplayFormat) {
      setLocalDisplayFormat(resumeInfo.personalInfoDisplayFormat as 'default' | 'compact');
    }
  }, [resumeInfo?.personalInfoDisplayFormat]);

  const handleChange = useCallback((e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setLocalPersonalInfo((prev: PersonalInfoType) => ({ ...prev, [name]: value }));
  }, []);

  const handleBlur = useCallback(
    (e: { target: { name: string; value: string } }) => {
      const { name, value } = e.target;
      const updatedPersonalInfo = { ...localPersonalInfo, [name]: value };
      setResumeInfo({ personalInfo: updatedPersonalInfo });
    },
    [localPersonalInfo, setResumeInfo]
  );

  const handleDisplayFormatChange = useCallback(
    (format: 'default' | 'compact') => {
      setLocalDisplayFormat(format);
      setResumeInfo({ personalInfoDisplayFormat: format });
    },
    [setResumeInfo]
  );

  if (isLoading) {
    return <PersonalInfoLoader />;
  }
  return (
    <div>
      <div className="w-full">
        <h2 className="text-lg font-bold">Personal Information</h2>
        <p className="text-sm">Get Started with the personal information</p>
      </div>

      <div className="mb-4">
        <Label className="text-sm">Display Format</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 w-full justify-between">
              {localDisplayFormat === 'default' ? 'Default' : 'Compact'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => handleDisplayFormatChange('default')}>Default</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDisplayFormatChange('compact')}>Compact</DropdownMenuItem>
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
                  onBlur={handleBlur}
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
                  onBlur={handleBlur}
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
                onBlur={handleBlur}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-sm">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="phone"
                    required
                    autoComplete="off"
                    placeholder=""
                    value={localPersonalInfo.phone || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <Label className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="email"
                    required
                    autoComplete="off"
                    placeholder=""
                    value={localPersonalInfo.email || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-sm">Github</Label>
                <div className="relative">
                  <Github className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="github"
                    autoComplete="off"
                    placeholder="username"
                    value={localPersonalInfo.github || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <Label className="text-sm">LinkedIn</Label>
                <div className="relative">
                  <Linkedin className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="linkedin"
                    autoComplete="off"
                    placeholder="username"
                    value={localPersonalInfo.linkedin || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <Label className="text-sm">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  name="address"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={localPersonalInfo.address || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="h-9 pl-8"
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
