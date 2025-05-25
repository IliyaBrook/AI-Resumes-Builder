"use client";
import RichTextEditor, { parseAIResult, RichTextEditorRef } from "@/components/editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useGetDocument from "@/features/document/use-get-document-by-id";
import useUpdateDocument from "@/features/document/use-update-document";
import useDebounce from "@/hooks/use-debounce";
import { toast } from "@/hooks/use-toast";
import { getAIChatSession, getCurrentModel } from "@/lib/google-ai-model";
import { ResumeDataType } from "@/types/resume.type";
import { Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";

interface GeneratesSummaryType {
  fresher: string;
  mid: string;
  experienced: string;
}

const buildPrompt = (
  resumeInfo: ResumeDataType,
  summarySize: string = "default"
) => {
  const jobTitle = resumeInfo?.personalInfo?.jobTitle || "";
  let promptParts = [];
  promptParts.push(`Job Title: ${jobTitle}`);

  if (resumeInfo.summary && resumeInfo.summary.trim().length > 0) {
    promptParts.push(`Current Summary: ${resumeInfo.summary}`);
  }

  if (Array.isArray(resumeInfo.skills) && resumeInfo.skills.length > 0) {
    const skillMap = new Map<string, number>();
    resumeInfo.skills.forEach((skill) => {
      const name = skill.name ? String(skill.name) : "";
      const rating = typeof skill.rating === "number" ? skill.rating : 0;
      if (!skillMap.has(name) || rating > (skillMap.get(name) || 0)) {
        skillMap.set(name, rating);
      }
    });
    const sortedSkills = Array.from(skillMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
    promptParts.push(`Key Skills: ${sortedSkills.join(", ")}`);
  }

  if (
    Array.isArray(resumeInfo.experiences) &&
    resumeInfo.experiences.length > 0
  ) {
    const sortedExp = [...resumeInfo.experiences].sort((a, b) =>
      (b.endDate || "")?.localeCompare(a.endDate || "")
    );
    const expShort = sortedExp.slice(0, 3).map((exp) => {
      return `Title: ${exp.title}, Company: ${exp.companyName}, Summary: ${
        exp.workSummary
          ? exp.workSummary
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 200)
          : ""
      }`;
    });
    promptParts.push(`Key Experiences: ${expShort.join(" | ")}`);
  }

  if (summarySize === "large") {
    promptParts.push(
      "Make each summary more detailed and longer, up to 6-8 lines."
    );
  } else if (summarySize === "extra_large") {
    promptParts.push(
      "Make each summary very detailed and as long as possible, up to 10-12 lines."
    );
  } else if (summarySize === "short") {
    promptParts.push("Make each summary concise and short, 2-3 lines.");
  }

  promptParts.push(
    `Based on the provided information, generate three resume summaries for the following experience levels: fresher, mid, and experienced. Return the result as a JSON object with keys 'fresher', 'mid', and 'experienced', where each value is a summary in HTML format. Use any suitable HTML tags (such as <b>, <strong>, <i>, <em>, <u>, <span style>, <p>, etc.) to make the text visually attractive, highlight key skills, technologies, and achievements, and structure the summary. Do not use <ul> or <li> tags and do not use lists. Use only the information provided by the user, do not invent or assume any data, and do not use any hardcoded examples. Each summary should be 3-4 lines (or according to the selected size), personal, engaging, and easy to read. Do not use placeholders. Do not use lists. Each summary should be visually structured, personal, and engaging.`
  );

  return promptParts.join(". ");
};

const SummaryForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocument(documentId);
  const resumeInfo = data?.data as ResumeDataType | undefined;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummary, setAiGeneratedSummary] =
    useState<GeneratesSummaryType | null>(null);
  const [summary, setSummary] = useState("");
  const [summarySize, setSummarySize] = useState("default");
  const editorRef = React.useRef<RichTextEditorRef>(null);

  useEffect(() => {
    if (resumeInfo?.summary !== undefined) {
      setSummary(resumeInfo.summary ?? "");
    }
  }, [resumeInfo?.summary]);

  const debouncedSummary = useDebounce(summary, 600);

  useEffect(() => {
    if (!resumeInfo) return;
    setResumeInfo({ summary: debouncedSummary });
  }, [debouncedSummary]);

  const handleChange = (value: string) => {
    setSummary(value);
  };

  const GenerateSummaryFromAI = async () => {
    try {
      if (!data?.data) return;
      setLoading(true);
      const { projectsSectionTitle, ...rest } = data.data;
      const resumeData = projectsSectionTitle === null
        ? { ...rest, skills: rest.skills.map(skill => ({ ...skill, hideRating: !!skill.hideRating })) }
        : { ...rest, projectsSectionTitle, skills: rest.skills.map(skill => ({ ...skill, hideRating: !!skill.hideRating })) };
      const promptText = buildPrompt(resumeData, summarySize);
      const modelName = await getCurrentModel();
      const chat = getAIChatSession(modelName);
      const result = await chat.sendMessage(promptText);
      let responseText = "";
      if (
        result.response.candidates &&
        result.response.candidates[0]?.content?.parts[0]?.text
      ) {
        responseText = result.response.candidates[0].content.parts[0].text;
      } else if (typeof result.response.text === "function") {
        responseText = await result.response.text();
      } else if (typeof result.response.text === "string") {
        responseText = result.response.text;
      }
      let parsed: any = parseAIResult(responseText);
      if (parsed && typeof parsed === 'object' && (parsed.fresher || parsed.mid || parsed.experienced)) {
        setAiGeneratedSummary({
          fresher: parsed.fresher || "",
          mid: parsed.mid || "",
          experienced: parsed.experienced || "",
        });
      } else {
        setAiGeneratedSummary(null);
      }
    } catch (error) {
      toast({
        title: "Failed to generate summary",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback(
    (summary: string) => {
      if (editorRef.current) {
        editorRef.current.setValue(summary);
      }
      setSummary(summary);
    },
    []
  );
  

  return (
    <div>
      <div className="w-full">
        <h2 className="font-bold text-lg">Summary</h2>
        <p className="text-sm">Add summary for your resume</p>
      </div>
      <div className="mb-2 flex gap-2 items-center">
        <span className="text-sm">Summary size:</span>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={summarySize}
          onChange={(e) => setSummarySize(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="short">Short</option>
          <option value="large">Large</option>
          <option value="extra_large">Extra Large</option>
        </select>
      </div>
      <div>
        <form>
          <div className="flex items-end justify-between">
            <div />
            <Button
              variant="outline"
              type="button"
              className="gap-1"
              disabled={loading || isLoading}
              onClick={() => GenerateSummaryFromAI()}
            >
              <Sparkles size="15px" className="text-purple-500" />
              Generate with AI
            </Button>
          </div>
          <div className="mt-5 min-h-36">
            <RichTextEditor
              ref={editorRef}
              jobTitle={resumeInfo?.personalInfo?.jobTitle || null}
              initialValue={summary}
              value={summary}
              onEditorChange={handleChange}
              showBullets={false}
              disabled={false}
              showLineLengthSelector={false}
            />
          </div>
          {aiGeneratedSummary && (
            <div>
              <h5 className="font-semibold text-[15px] my-4">Suggestions</h5>
              {Object.entries(aiGeneratedSummary)
                .filter(([, summary]) => summary && summary.trim() !== "")
                .map(([experienceType, summary], index) => (
                  <Card
                    role="button"
                    key={index}
                    className="my-4 bg-primary/5 shadow-none border-primary/30"
                    onClick={() => handleSelect(summary)}
                  >
                    <CardHeader className="py-2">
                      <CardTitle className="font-semibold text-md">
                        {experienceType.charAt(0).toUpperCase() +
                          experienceType.slice(1)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div dangerouslySetInnerHTML={{ __html: summary }} />
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SummaryForm;
