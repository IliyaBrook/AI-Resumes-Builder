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
import { useEffect, useState } from 'react';
import { ChevronDown, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { PersonalInfoType } from '@/types';
import { useTranslations } from 'next-intl';

const PersonalInfoForm = () => {
  const t = useTranslations('PersonalInfo');
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const { personalInfoDisplayFormat = 'default', personalInfo = null } = data?.data ?? {};

  const { mutate: setResumeInfo } = useUpdateDocument();

  const [personalInfoState, setPersonalInfoState] = useState<PersonalInfoType>({
    firstName: personalInfo?.firstName ?? '',
    lastName: personalInfo?.lastName ?? '',
    jobTitle: personalInfo?.jobTitle ?? '',
    address: personalInfo?.address ?? '',
    phone: personalInfo?.phone ?? '',
    email: personalInfo?.email ?? '',
    github: personalInfo?.github ?? '',
    linkedin: personalInfo?.linkedin ?? '',
  });

  useEffect(() => {
    if (personalInfo && !Object.values(personalInfo).every(value => !value)) {
      setPersonalInfoState(personalInfo);
    }
  }, [JSON.stringify(personalInfo)]);

  const [localDisplayFormat, setDisplayFormat] = useState<'default' | 'compact'>(
    personalInfoDisplayFormat as 'default' | 'compact'
  );

  const handleChange = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    setPersonalInfoState((prev: PersonalInfoType) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (e: { target: { name: string; value: string } }) => {
    const { name, value } = e.target;
    // Use ref to get the latest value instead of stale closure value
    const updatedPersonalInfo = { ...personalInfoState, [name]: value };
    setResumeInfo({ personalInfo: updatedPersonalInfo });
  };

  const handleDisplayFormatChange = (format: 'default' | 'compact') => {
    setDisplayFormat(format);
    setResumeInfo({ personalInfoDisplayFormat: format });
  };

  if (isLoading) {
    return <PersonalInfoLoader />;
  }
  return (
    <div>
      <div className="w-full">
        <h2 className="text-lg font-bold">{t('Personal Information')}</h2>
        <p className="text-sm">{t('Get Started with the personal information')}</p>
      </div>

      <div className="mb-4">
        <Label className="text-sm">{t('Display Format')}</Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-9 w-full justify-between">
              {localDisplayFormat === 'default' ? t('Default') : t('Compact')}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuItem onClick={() => handleDisplayFormatChange('default')}>{t('Default')}</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDisplayFormatChange('compact')}>{t('Compact')}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <form>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">{t('First Name')}</Label>
                <Input
                  name="firstName"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={personalInfoState.firstName || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="h-9"
                />
              </div>
              <div>
                <Label className="text-sm">{t('Last Name')}</Label>
                <Input
                  name="lastName"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={personalInfoState.lastName || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="h-9"
                />
              </div>
            </div>
            <div>
              <Label className="text-sm">{t('Job Title')}</Label>
              <Input
                name="jobTitle"
                required
                autoComplete="off"
                placeholder=""
                value={personalInfoState.jobTitle || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className="h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-sm">{t('Phone')}</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="phone"
                    required
                    autoComplete="off"
                    placeholder=""
                    value={personalInfoState.phone || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <Label className="text-sm">{t('Email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="email"
                    required
                    autoComplete="off"
                    placeholder=""
                    value={personalInfoState.email || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <Label className="text-sm">{t('Github')}</Label>
                <div className="relative">
                  <Github className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="github"
                    autoComplete="off"
                    placeholder={t('username')}
                    value={personalInfoState.github || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
              <div className="relative">
                <Label className="text-sm">{t('LinkedIn')}</Label>
                <div className="relative">
                  <Linkedin className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    name="linkedin"
                    autoComplete="off"
                    placeholder={t('username')}
                    value={personalInfoState.linkedin || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="h-9 pl-8"
                  />
                </div>
              </div>
            </div>

            <div className="relative">
              <Label className="text-sm">{t('Address')}</Label>
              <div className="relative">
                <MapPin className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  name="address"
                  required
                  autoComplete="off"
                  placeholder=""
                  value={personalInfoState.address || ''}
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
