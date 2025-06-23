'use client';
// components
import { Textarea, Label, Input, Button } from '@/components';
import { Plus, X } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useCallback } from 'react';
//hooks
import {
  useCreateEducation,
  useDebounce,
  useUpdateDocument,
  useGetDocumentById,
  useDeleteEducation,
} from '@/hooks';
import { EducationType } from '@/types/resume.type';

const getToday = () => {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
};

const EducationForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const { mutate: deleteEducation, isPending: isDeleting } = useDeleteEducation();
  const { mutateAsync: createEducation } = useCreateEducation();

  const [localEducationList, setLocalEducationList] = React.useState<EducationType[]>(
    resumeInfo?.educations || []
  );
  const debouncedEducationList = useDebounce(localEducationList, 500);

  React.useEffect(() => {
    if (debouncedEducationList && debouncedEducationList !== resumeInfo?.educations) {
      const sanitized = debouncedEducationList.map((edu: EducationType) => ({
        ...edu,
        endDate: edu.currentlyStudying ? null : edu.endDate,
        yearsOnly: edu.yearsOnly ?? false,
      }));
      setResumeInfo({ education: sanitized });
    }
  }, [debouncedEducationList]);

  const handleChange = (e: { target: { name: string; value: string } }, index: number) => {
    const { name, value } = e.target;
    setLocalEducationList((prev: EducationType[]) =>
      prev.map((item, idx) => (idx === index ? { ...item, [name]: value } : item))
    );
  };

  const addNewEducation = async () => {
    const newEdu = {
      universityName: '',
      startDate: getToday(),
      endDate: getToday(),
      degree: '',
      major: '',
      description: '',
      yearsOnly: false,
    };
    const created = await createEducation(newEdu);
    setLocalEducationList((prev: EducationType[]) => [...prev, created]);
  };

  const removeEducation = (id?: number) => {
    if (!id) return;
    deleteEducation({ educationId: id });
    setLocalEducationList((prev: EducationType[]) => prev.filter(item => item.id !== id));
  };

  const handleAddEducation = useCallback(() => {
    void addNewEducation();
  }, [addNewEducation]);

  const educations = localEducationList;

  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Education</h2>
        <p className="text-sm">Add your education details</p>
      </div>
      <form>
        <div className="border w-full h-auto divide-y-[1px] rounded-md px-3 pb-4 my-3">
          {educations.length === 0 && (
            <Button
              className="gap-1 mt-1 text-primary border-primary/50"
              variant="outline"
              type="button"
              onClick={handleAddEducation}
            >
              <Plus size="15px" />
              Add Education
            </Button>
          )}
          {educations.map((item, index) => (
            <div key={item.id || index}>
              <div className="relative grid grid-cols-2 mb-5 pt-4 gap-3">
                {educations.length > 1 && (
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={isDeleting}
                    className="size-[20px] text-center rounded-full absolute -top-3 -right-5 !bg-black dark:!bg-gray-600 text-white"
                    size="icon"
                    onClick={() => removeEducation(item.id)}
                  >
                    <X size="13px" />
                  </Button>
                )}

                <div className="col-span-2">
                  <Label className="text-sm">University Name</Label>
                  <Input
                    name="universityName"
                    placeholder=""
                    required
                    value={item?.universityName || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Degree</Label>
                  <Input
                    name="degree"
                    placeholder=""
                    required
                    value={item?.degree || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Major</Label>
                  <Input
                    name="major"
                    placeholder=""
                    required
                    value={item?.major || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    type="date"
                    name="startDate"
                    value={item?.startDate || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">End Date</Label>
                  <Input
                    type="date"
                    name="endDate"
                    value={item?.endDate || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    name="description"
                    value={item?.description || ''}
                    onChange={e => handleChange(e, index)}
                  />
                </div>
              </div>
            </div>
          ))}
          {educations.length > 0 && (
            <div className="flex justify-center">
              <Button
                className="gap-1 mt-1 text-primary border-primary/50"
                variant="outline"
                type="button"
                onClick={handleAddEducation}
              >
                <Plus size="15px" />
                Add More Education
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default EducationForm;
