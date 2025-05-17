import React, { useCallback, useState } from "react";
import { DownloadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { formatFileName } from "@/lib/helper";
import { StatusType } from "@/types/resume.type";
import dynamic from "next/dynamic";

const Download = (props: {
  title: string;
  isLoading: boolean;
  status?: StatusType;
}) => {
  const { title, status, isLoading } = props;
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    const resumeElement = document.getElementById("resume-preview-id");
    if (!resumeElement) {
      toast({
        title: "Error",
        description: "Could not download",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const fileName = formatFileName(title);
    try {
      resumeElement.classList.add("pdf-export");
      const html2pdf = (await import("html2pdf.js")).default;
      await html2pdf()
        .set({
          margin: 0,
          filename: fileName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"] },
        })
        .from(resumeElement)
        .save();
    } catch (error) {
      toast({
        title: "Error",
        description: "Error generating PDF",
        variant: "destructive",
      });
    } finally {
      resumeElement.classList.remove("pdf-export");
      setLoading(false);
    }
  }, [title]);

  return (
    <Button
      disabled={isLoading || loading || status === "archived" ? true : false}
      variant="secondary"
      className="bg-white border gap-1 dark:bg-gray-800 !p-1 min-w-9 lg:min-w-auto lg:p-4"
      onClick={handleDownload}
    >
      <div className="flex items-center gap-1">
        <DownloadCloud size="17px" />
        <span className="hidden lg:flex">
          {loading ? "Generating PDF" : "Download Resume"}
        </span>
      </div>
    </Button>
  );
};

export default dynamic(() => Promise.resolve(Download), {
  ssr: false
});
