"use client";
// components
import { Textarea, Label, Input, Button } from "@/components";
import { Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect } from "react";
//hooks
import {
  useCreateEducation,
  useDebounce,
  useUpdateDocument,
  useGetDocumentById,
  useDeleteEducation,
} from "@/hooks";
import { Education } from "@/types/resume.type";

const getToday = () => {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const day = d.getDate().toString().padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
};

const initialState = {
  id: undefined,
  docId: undefined,
  universityName: "",
  startDate: getToday(),
  endDate: getToday(),
  degree: "",
  major: "",
  description: "",
};

const EducationForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocumentById(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo, isPending } = useUpdateDocument();
  const { mutate: deleteEducation, isPending: isDeleting } =
    useDeleteEducation();
  const { mutateAsync: createEducation } = useCreateEducation();

  const normalizeData = (item: Education) => ({
    ...item,
    docId: item.docId ?? undefined,
    universityName: item.universityName || "",
    startDate: item.startDate || "",
    endDate: item.endDate || "",
    degree: item.degree || "",
    major: item.major || "",
    description: item.description || "",
  });

  const [educationList, setEducationList] = React.useState<
    {
      id?: number;
      docId?: string;
      universityName: string;
      startDate: string;
      endDate: string;
      degree: string;
      major: string;
      description: string;
      currentlyStudying?: boolean;
      skipDates?: boolean;
      yearsOnly?: boolean;
    }[]
  >(() => {
    return resumeInfo?.educations?.length
      ? resumeInfo.educations.map(normalizeData)
      : [
          {
            ...initialState,
            currentlyStudying: false,
            skipDates: false,
            yearsOnly: false,
          },
        ];
  });

  const debouncedEducationList = useDebounce(educationList, 600);

  useEffect(() => {
    const educations = (resumeInfo?.educations || []).map(normalizeData);
    setEducationList(
      resumeInfo?.educations || []
        ? educations
        : [{ ...initialState, currentlyStudying: false, skipDates: false }]
    );
  }, [resumeInfo?.educations]);

  useEffect(() => {
    if (!resumeInfo) return;
    const sanitized = debouncedEducationList.map((edu) => ({
      ...edu,
      startDate: edu.skipDates
        ? null
        : edu.startDate === ""
        ? null
        : edu.startDate,
      endDate:
        edu.skipDates || edu.currentlyStudying
          ? null
          : edu.endDate === ""
          ? null
          : edu.endDate,
      yearsOnly: edu.yearsOnly ?? false,
    }));
    setResumeInfo({ education: sanitized });
  }, [debouncedEducationList]);

  const handleChange = (
    e: { target: { name: string; value: string } },
    index: number
  ) => {
    const { name, value } = e.target;
    setEducationList((prevState) => {
      const newEducationList = [...prevState];
      newEducationList[index] = {
        ...newEducationList[index],
        [name]: value,
      };
      return newEducationList;
    });
  };

  const addNewEducation = async () => {
    const newEdu = {
      universityName: "",
      startDate: getToday(),
      endDate: getToday(),
      degree: "",
      major: "",
      description: "",
      yearsOnly: false,
    };
    const created = await createEducation(newEdu);
    setEducationList((prev) => [...prev, created]);
  };

  const removeEducation = (id?: number) => {
    if (!id) return;
    deleteEducation({ educationId: id });
    setEducationList((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Education</h2>
        <p className="text-sm">Add your education details</p>
      </div>
      <form>
        <div
          className="border w-full h-auto
              divide-y-[1px] rounded-md px-3 pb-4 my-3
              "
        >
          {educationList?.map((item, index) => (
            <div key={item.id || index}>
              <div
                className="relative grid gride-cols-2
                  mb-5 pt-4 gap-3
                  "
              >
                {educationList?.length > 1 && (
                  <Button
                    variant="secondary"
                    type="button"
                    disabled={isPending || isDeleting}
                    className="size-[20px] text-center
                rounded-full absolute -top-3 -right-5
                !bg-black dark:!bg-gray-600 text-white
                "
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
                    value={item?.universityName || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Degree</Label>
                  <Input
                    name="degree"
                    placeholder=""
                    required
                    value={item?.degree || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Major</Label>
                  <Input
                    name="major"
                    placeholder=""
                    required
                    value={item?.major || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    name="startDate"
                    type="date"
                    placeholder=""
                    required={!item?.skipDates}
                    value={item?.startDate || ""}
                    onChange={(e) => handleChange(e, index)}
                    disabled={item?.skipDates}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-sm">End Date</Label>
                    <Input
                      name="endDate"
                      type="date"
                      placeholder=""
                      required={!item?.skipDates && !item?.currentlyStudying}
                      value={item?.endDate || ""}
                      onChange={(e) => handleChange(e, index)}
                      disabled={item?.skipDates || item?.currentlyStudying}
                    />
                  </div>
                  <div className="flex flex-col h-full gap-1">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`present-checkbox-${index}`}
                        checked={item?.currentlyStudying || false}
                        onChange={(e) => {
                          setEducationList((prev) =>
                            prev.map((edu, idx) =>
                              idx === index
                                ? {
                                    ...edu,
                                    currentlyStudying: e.target.checked,
                                    endDate: e.target.checked
                                      ? ""
                                      : edu.endDate,
                                  }
                                : edu
                            )
                          );
                        }}
                        className="mr-1"
                        disabled={item?.skipDates}
                      />
                      <Label
                        htmlFor={`present-checkbox-${index}`}
                        className="text-xs select-none cursor-pointer"
                      >
                        Present
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`skipdates-checkbox-${index}`}
                        checked={item?.skipDates || false}
                        onChange={(e) => {
                          setEducationList((prev) =>
                            prev.map((edu, idx) =>
                              idx === index
                                ? {
                                    ...edu,
                                    skipDates: e.target.checked,
                                    startDate: e.target.checked
                                      ? ""
                                      : edu.startDate,
                                    endDate: e.target.checked
                                      ? ""
                                      : edu.endDate,
                                    currentlyStudying: e.target.checked
                                      ? false
                                      : edu.currentlyStudying,
                                  }
                                : edu
                            )
                          );
                        }}
                        className="mr-1"
                      />
                      <Label
                        htmlFor={`skipdates-checkbox-${index}`}
                        className="text-xs select-none cursor-pointer"
                      >
                        Do not show dates
                      </Label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`yearsonly-checkbox-${index}`}
                        checked={item?.yearsOnly || false}
                        onChange={(e) => {
                          setEducationList((prev) =>
                            prev.map((edu, idx) =>
                              idx === index
                                ? { ...edu, yearsOnly: e.target.checked }
                                : edu
                            )
                          );
                        }}
                        className="mr-1"
                      />
                      <Label
                        htmlFor={`yearsonly-checkbox-${index}`}
                        className="text-xs select-none cursor-pointer"
                      >
                        Years Only
                      </Label>
                    </div>
                  </div>
                </div>
                <div className="col-span-2 mt-1">
                  <Label className="text-sm">Description</Label>
                  <Textarea
                    name="description"
                    placeholder=""
                    required
                    value={item.description || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
              </div>

              {index === educationList.length - 1 &&
                educationList.length < 5 && (
                  <Button
                    className="gap-1 mt-1 text-primary border-primary/50"
                    variant="outline"
                    type="button"
                    disabled={isPending}
                    onClick={addNewEducation}
                  >
                    <Plus size="15px" />
                    Add More Education
                  </Button>
                )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default EducationForm;
