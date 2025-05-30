"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import PersonalInfo from "@/components/preview/PersonalInfoPreview";
import SummaryPreview from "@/components/preview/SummaryPreview";
import ExperiencePreview from "@/components/preview/ExperiencePreview";
import EducationPreview from "@/components/preview/EducationPreview";
import SkillPreview from "@/components/preview/SkillPreview";
import ProjectPreview from "@/components/preview/ProjectPreview";
import useGetDocument from "@/features/document/use-get-document-by-id";
import useUpdateDocument from "@/features/document/use-update-document";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveUp, MoveDown } from "lucide-react";

const RESUME_STYLES = `
  #resume-preview-id ul, #resume-preview-id ol {
    list-style: none;
    padding-left: 0;
    margin-left: 0;
  }
  #resume-preview-id ul li {
    list-style-type: none;
  }
 
  #resume-preview-id ol li {
    counter-increment: item;
  }
  #resume-preview-id ol li::before {
    content: counter(item) ". ";
    font-size: 1.1em;
    margin-right: 6px;
    color: #333;
  }
  #resume-preview-id ol {
    counter-reset: item;
  }
  @media print {
    #resume-preview-id ul {
      list-style-position: inside;
      padding-left: 18px;
      margin-left: 0;
    }
    #resume-preview-id li {
      // list-style-type: disc;
      margin-left: 0;
      padding-left: 0;
    }
  }
`;

const DEFAULT_PAGES_ORDER = ['personal-info', 'summary', 'experience', 'education', 'projects', 'skills'];

const SECTION_COMPONENTS = {
  'personal-info': PersonalInfo,
  'summary': SummaryPreview,
  'experience': ExperiencePreview,
  'education': EducationPreview,
  'projects': ProjectPreview,
  'skills': SkillPreview,
};

function normalizeResumeData(data: any) {
  if (!data) return data;
  if (data.projectsSectionTitle === null) {
    const { projectsSectionTitle, ...rest } = data;
    return rest;
  }
  return data;
}

const ResumePreview = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocument(documentId);
  const { mutate: updateDocument } = useUpdateDocument();
  const fixedResumeInfo = normalizeResumeData(data?.data);
  
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<string[]>(
    fixedResumeInfo?.pagesOrder || DEFAULT_PAGES_ORDER
  );

  React.useEffect(() => {
    if (fixedResumeInfo?.pagesOrder) {
      setCurrentOrder(fixedResumeInfo.pagesOrder);
    }
  }, [fixedResumeInfo?.pagesOrder]);

  const updatePagesOrder = (newOrder: string[]) => {
    updateDocument({
      pagesOrder: newOrder,
    });
    setCurrentOrder(newOrder);
  };

  const moveSection = (direction: 'up' | 'down') => {
    if (!selectedSection) return;
    
    const currentIndex = currentOrder.indexOf(selectedSection);
    if (currentIndex === -1) return;
    
    const newOrder = [...currentOrder];
    
    if (direction === 'up' && currentIndex > 0) {
      [newOrder[currentIndex], newOrder[currentIndex - 1]] = [newOrder[currentIndex - 1], newOrder[currentIndex]];
    } else if (direction === 'down' && currentIndex < newOrder.length - 1) {
      [newOrder[currentIndex], newOrder[currentIndex + 1]] = [newOrder[currentIndex + 1], newOrder[currentIndex]];
    } else {
      return;
    }
    
    updatePagesOrder(newOrder);
  };

  const canMoveUp = selectedSection && currentOrder.indexOf(selectedSection) > 0;
  const canMoveDown = selectedSection && currentOrder.indexOf(selectedSection) < currentOrder.length - 1;

  const renderSection = (sectionKey: string) => {
    const Component = SECTION_COMPONENTS[sectionKey as keyof typeof SECTION_COMPONENTS];
    if (!Component) return null;
    
    return (
      <div
        key={sectionKey}
        className={cn(
          "section-wrapper cursor-pointer transition-all duration-200 rounded-md",
          selectedSection === sectionKey && "ring-2 ring-blue-500 ring-opacity-50 bg-blue-50 dark:bg-blue-950 dark:ring-blue-400 p-2"
        )}
        onClick={() => setSelectedSection(selectedSection === sectionKey ? null : sectionKey)}
        title={`Нажмите для выбора секции "${sectionKey}"`}
      >
        <Component isLoading={isLoading} resumeInfo={fixedResumeInfo} />
      </div>
    );
  };

  return (
    <div
      id="resume-preview-id"
      className={cn(`
        shadow-lg bg-white w-full flex-[1.02]
        h-full px-10 py-4 !font-open-sans
        dark:border dark:bg-card 
        dark:border-b-gray-800 
        dark:border-x-gray-800
        relative
        `)}
      style={{
        borderTop: `13px solid ${fixedResumeInfo?.themeColor}`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: RESUME_STYLES }} />
      
      {selectedSection && (
        <div className="absolute top-4 left-4 text-xs text-gray-500 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm">
          Выбрана секция: {selectedSection}
        </div>
      )}
      
      {currentOrder.map(renderSection)}
      
      <div id="sort-pages" className="absolute top-0 right-0 flex flex-col gap-1 p-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className={cn(
            "size-8 hover:bg-gray-100 dark:hover:bg-gray-700",
            !canMoveUp && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => moveSection('up')}
          disabled={!canMoveUp}
          title="Переместить секцию вверх"
        >
          <MoveUp size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className={cn(
            "size-8 hover:bg-gray-100 dark:hover:bg-gray-700",
            !canMoveDown && "opacity-50 cursor-not-allowed"
          )}
          onClick={() => moveSection('down')}
          disabled={!canMoveDown}
          title="Переместить секцию вниз"
        >
          <MoveDown size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ResumePreview;
