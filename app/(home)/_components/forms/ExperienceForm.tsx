import RichTextEditor from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useCreateExperience from "@/features/document/use-create-experience";
import useDeleteExperience from "@/features/document/use-delete-experience";
import useGetDocument from "@/features/document/use-get-document-by-id";
import useUpdateDocument from "@/features/document/use-update-document";
import useDebounce from "@/hooks/use-debounce";
import { ExperienceType } from "@/types/resume.type";
import { Plus, X, MoveUp, MoveDown } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { parseAIResult } from "@/components/editor";

const ExperienceForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const { mutate: deleteExperience, isPending: isDeleting } =
    useDeleteExperience();
  const { mutateAsync: createExperience } = useCreateExperience();

  const [localExperiences, setLocalExperiences] = React.useState<
    ExperienceType[]
  >(resumeInfo?.experiences || []);
  const debouncedExperiences = useDebounce(localExperiences, 500);

  React.useEffect(() => {
    const sorted = (resumeInfo?.experiences || [])
      .slice()
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    setLocalExperiences(sorted);
  }, [resumeInfo?.experiences]);

  React.useEffect(() => {
    if (
      debouncedExperiences &&
      debouncedExperiences !== resumeInfo?.experiences
    ) {
      const sanitized = debouncedExperiences.map((exp) => ({
        ...exp,
        endDate: exp.currentlyWorking ? null : exp.endDate,
      }));
      setResumeInfo({ experience: sanitized });
    }
  }, [debouncedExperiences]);

  const handleChange = (
    e: { target: { name: string; value: string } },
    index: number
  ) => {
    const { name, value } = e.target;
    setLocalExperiences((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [name]: value } : item
      )
    );
  };

  const addNewExperience = async () => {
    const newExp = {
      title: "",
      companyName: "",
      city: "",
      state: "",
      startDate: "",
      endDate: "",
      workSummary: "",
      currentlyWorking: false,
      order: localExperiences.length,
    };
    const created = await createExperience(newExp);
    setLocalExperiences((prev) => [...prev, created]);
  };

  const removeExperience = (id?: number) => {
    if (!id) return;
    deleteExperience({ experienceId: id });
  };

  const handEditor = (value: string, name: string, index: number) => {
    setLocalExperiences((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [name]: value } : item
      )
    );
  };

  const moveExperience = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localExperiences.length) return;

    setLocalExperiences((prev) => {
      const newExperiences = [...prev];
      const [movedItem] = newExperiences.splice(fromIndex, 1);
      newExperiences.splice(toIndex, 0, movedItem);

      return newExperiences.map((exp, idx) => ({
        ...exp,
        order: idx,
      }));
    });
  };

  const experiences = localExperiences;

  const buildExperiencePrompt = (item: ExperienceType) => {
    let prompt = `Based on the following experience: Position title: ${
      item.title || ""
    }. Company: ${item.companyName || ""}. City: ${item.city || ""}. State: ${
      item.state || ""
    }. Summary: ${item.workSummary || ""}.`;
    prompt += ` Generate and return ONLY a single HTML string (not JSON, not array, not object, not wrapped in quotes) with a <ul> list and <li> items describing key achievements and responsibilities for this experience. The list must contain exactly {bulletCount} items. Do not return an array or object, only a single HTML string. Do not include job title, company name, city, state, dates, or any headings, divs, borders, or extra wrappers. Do not repeat information already provided. Inside each <li> you MUST highlight key skills, technologies, and achievements using <b> or <strong> tags. You may also use <i>, <u>, <span style> for emphasis. Do not use placeholders. Use only the provided information, do not invent or assume any data. The list should be personal, engaging, and easy to read. Your response must be a valid HTML string only. Each <li> must not exceed {maxLineLength} characters. Each <li> should be as close as possible to {maxLineLength} characters, but not exceed it. Make each bullet point detailed and use the maximum allowed length.`;
    return prompt;
  };

  return (
    <div>
      <div className="w-full">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-bold text-lg">Professional Experience</h2>
            <p className="text-sm">Add previous job experience</p>
          </div>
          {experiences.length > 1 && (
            <div className="text-sm text-muted-foreground">
              Use arrows to reorder experiences
            </div>
          )}
        </div>
      </div>
      <form>
        <div className="border w-full h-auto divide-y-[1px] rounded-md px-3 pb-4 my-5">
          {experiences.length === 0 && (
            <Button
              className="gap-1 mt-1 text-primary border-primary/50"
              variant="outline"
              type="button"
              onClick={addNewExperience}
            >
              <Plus size="15px" />
              Add More Experience
            </Button>
          )}
          {experiences.map((item, index) => (
            <div key={item.id || index}>
              <div className="relative grid grid-cols-2 mb-5 pt-4 gap-3">
                { experiences.length > 1 && <div className="absolute -left-8 top-4 flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="size-6"
                    onClick={() => moveExperience(index, index - 1)}
                    disabled={index === 0}
                  >
                    <MoveUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="size-6"
                    onClick={() => moveExperience(index, index + 1)}
                    disabled={index === experiences.length - 1}
                  >
                    <MoveDown size={14} />
                  </Button>
                </div>}
                {experiences.length > 1 && item.id && (
                  <Button
                    variant="secondary"
                    type="button"
                    className="size-[20px] text-center rounded-full absolute -top-3 -right-5 !bg-black dark:!bg-gray-600 text-white"
                    size="icon"
                    disabled={isDeleting}
                    onClick={() => removeExperience(item.id)}
                  >
                    <X size="13px" />
                  </Button>
                )}
                <div>
                  <Label className="text-sm">Position title</Label>
                  <Input
                    name="title"
                    placeholder=""
                    required
                    value={item?.title || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Company Name</Label>
                  <Input
                    name="companyName"
                    placeholder=""
                    required
                    value={item?.companyName || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">City</Label>
                  <Input
                    name="city"
                    placeholder=""
                    required
                    value={item?.city || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">State</Label>
                  <Input
                    name="state"
                    placeholder=""
                    required
                    value={item?.state || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div>
                  <Label className="text-sm">Start Date</Label>
                  <Input
                    name="startDate"
                    type="date"
                    placeholder=""
                    required
                    value={item?.startDate || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Label className="text-sm">End Date</Label>
                    <Input
                      name="endDate"
                      type="date"
                      placeholder=""
                      required={!item?.currentlyWorking}
                      value={item?.endDate || ""}
                      onChange={(e) => handleChange(e, index)}
                      disabled={item?.currentlyWorking}
                    />
                  </div>
                  <div className="flex items-center h-full mt-6">
                    <input
                      type="checkbox"
                      id={`present-checkbox-${index}`}
                      checked={item?.currentlyWorking || false}
                      onChange={(e) => {
                        setLocalExperiences((prev) =>
                          prev.map((exp, idx) =>
                            idx === index
                              ? {
                                  ...exp,
                                  currentlyWorking: e.target.checked,
                                  endDate: e.target.checked ? "" : exp.endDate,
                                }
                              : exp
                          )
                        );
                      }}
                      className="mr-1"
                    />
                    <Label
                      htmlFor={`present-checkbox-${index}`}
                      className="text-xs select-none cursor-pointer"
                    >
                      Present
                    </Label>
                  </div>
                </div>
                <div className="col-span-2 mt-1">
                  <RichTextEditor
                    jobTitle={item.title}
                    initialValue={item.workSummary || ""}
                    onEditorChange={(value) =>
                      handEditor(
                        String(parseAIResult(value)),
                        "workSummary",
                        index
                      )
                    }
                    prompt={buildExperiencePrompt(item)}
                    title={undefined}
                    showBullets={true}
                    showLineLengthSelector={true}
                  />
                </div>
              </div>
              {index === experiences.length - 1 && experiences.length < 5 && (
                <Button
                  className="gap-1 mt-1 text-primary border-primary/50"
                  variant="outline"
                  type="button"
                  onClick={addNewExperience}
                >
                  <Plus size="15px" />
                  Add More Experience
                </Button>
              )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default ExperienceForm;
