import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useGetDocument from "@/features/document/use-get-document-by-id";
import useUpdateDocument from "@/features/document/use-update-document";
import useDebounce from "@/hooks/use-debounce";
import { Plus, X, MoveUp, MoveDown } from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";
import { ProjectType } from "@/types/resume.type";
import useDeleteProject from "@/features/document/use-delete-project";
import RichTextEditor from "@/components/editor";

const ProjectForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data } = useGetDocument(documentId);
  const resumeInfo = data?.data;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const { mutate: deleteProject } = useDeleteProject();

  const [sectionTitle, setSectionTitle] = React.useState(resumeInfo?.projectsSectionTitle || "Projects");
  const [localProjects, setLocalProjects] = React.useState<ProjectType[]>(
    resumeInfo?.projects || []
  );
  const debouncedProjects = useDebounce(localProjects, 500);
  const debouncedSectionTitle = useDebounce(sectionTitle, 500);

  React.useEffect(() => {
    setLocalProjects(
      (resumeInfo?.projects || [])
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
    );
  }, [resumeInfo?.projects]);

  React.useEffect(() => {
    setSectionTitle(resumeInfo?.projectsSectionTitle || "Projects");
  }, [resumeInfo?.projectsSectionTitle]);

  React.useEffect(() => {
    setResumeInfo({ projects: debouncedProjects });
  }, [debouncedProjects]);

  React.useEffect(() => {
    if (debouncedSectionTitle !== (resumeInfo?.projectsSectionTitle || "Projects")) {
      setResumeInfo({ projectsSectionTitle: debouncedSectionTitle });
    }
  }, [debouncedSectionTitle]);

  const handleChange = (
    e: { target: { name: string; value: string } },
    index: number
  ) => {
    const { name, value } = e.target;
    setLocalProjects((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [name]: value } : item
      )
    );
  };

  const addNewProject = () => {
    setLocalProjects((prev) => [
      ...prev,
      { name: "", url: "", description: "", order: prev.length },
    ]);
  };

  const removeProject = (index: number, id?: number) => {
    if (id) {
      deleteProject({ projectId: id });
    }
    setLocalProjects((prev) => prev.filter((_, idx) => idx !== index));
  };

  const moveProject = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= localProjects.length) return;
    setLocalProjects((prev) => {
      const newProjects = [...prev];
      const [movedItem] = newProjects.splice(fromIndex, 1);
      newProjects.splice(toIndex, 0, movedItem);
      return newProjects.map((proj, idx) => ({ ...proj, order: idx }));
    });
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {localProjects.length > 1 && (
          <div className="text-sm text-muted-foreground">
            Use arrows to reorder experiences
          </div>
        )}
      </div>
      <div className="w-full flex items-center gap-2 mb-2">
        <Input
          className="font-bold text-lg flex-1"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
        />
      </div>
      <form>
        <div className="border w-full h-auto divide-y-[1px] rounded-md px-3 pb-4 my-3">
          {localProjects.length === 0 && (
            <Button
              className="gap-1 mt-1 text-primary border-primary/50"
              variant="outline"
              type="button"
              onClick={addNewProject}
            >
              <Plus size="15px" />
              Add More Project
            </Button>
          )}
          {localProjects.map((item, index) => (
            <div key={item.id || index}>
              <div className="relative grid grid-cols-2 mb-5 pt-4 gap-3">
                {localProjects.length > 1 && <div className="absolute -left-8 top-4 flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="size-6"
                    onClick={() => moveProject(index, index - 1)}
                    disabled={index === 0}
                  >
                    <MoveUp size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    className="size-6"
                    onClick={() => moveProject(index, index + 1)}
                    disabled={index === localProjects.length - 1}
                  >
                    <MoveDown size={14} />
                  </Button>
                </div>}
                <Button
                  variant="secondary"
                  type="button"
                  className="size-[20px] text-center rounded-full absolute -top-3 -right-5 !bg-black dark:!bg-gray-600 text-white"
                  size="icon"
                  onClick={() => removeProject(index, item.id)}
                >
                  <X size="13px" />
                </Button>
                <div className="col-span-2">
                  <Label className="text-sm">Project Name</Label>
                  <Input
                    name="name"
                    placeholder="Project name"
                    required
                    value={item?.name || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">Project URL</Label>
                  <Input
                    name="url"
                    placeholder="https://project-url.com"
                    value={item?.url || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div className="col-span-2">
                  <Label className="text-sm">Git Repository</Label>
                  <Input
                    name="git"
                    placeholder="https://github.com/user/repo"
                    value={item?.git || ""}
                    onChange={(e) => handleChange(e, index)}
                  />
                </div>
                <div className="col-span-2 mt-1">
                  <Label className="text-sm">Description</Label>
                  <RichTextEditor
                    value={item?.description || ""}
                    onEditorChange={(val) =>
                      handleChange(
                        { target: { name: "description", value: val } },
                        index
                      )
                    }
                    placeholder="Project description"
                  />
                </div>
              </div>
              {index === localProjects.length - 1 &&
                localProjects.length < 10 && (
                  <Button
                    className="gap-1 mt-1 text-primary border-primary/50"
                    variant="outline"
                    type="button"
                    onClick={addNewProject}
                  >
                    <Plus size="15px" />
                    Add More Project
                  </Button>
                )}
            </div>
          ))}
        </div>
      </form>
    </div>
  );
};

export default ProjectForm;
