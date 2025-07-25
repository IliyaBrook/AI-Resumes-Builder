'use client';
// components
import {
  Button,
  CardContent,
  CardHeader,
  CardTitle,
  Card,
  RichTextEditor,
  RichTextEditorRef,
  parseAIResult,
} from '@/components';
import { toast, useDebounce, useUpdateDocument, useGetDocumentById } from '@/hooks';
import { getAIChatSession } from '@/lib/google-ai-model';
import { Sparkles } from 'lucide-react';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { AIGeneratedSummariesType, ResumeDataType, SkillType } from '@/types/resume.type';

const buildPrompt = (resumeInfo: ResumeDataType, summarySize: string = 'default') => {
  const jobTitle = resumeInfo?.personalInfo?.jobTitle || '';
  const promptParts = [];
  promptParts.push(`Job Title: ${jobTitle}`);

  if (resumeInfo.summary && resumeInfo.summary.trim().length > 0) {
    promptParts.push(`Current Summary: ${resumeInfo.summary}`);
  }

  if (Array.isArray(resumeInfo.skills) && resumeInfo.skills.length > 0) {
    const skillMap = new Map<string, number>();
    resumeInfo.skills.forEach(skill => {
      const name = skill.name ? String(skill.name) : '';
      const rating = typeof skill.rating === 'number' ? skill.rating : 0;
      if (!skillMap.has(name) || rating > (skillMap.get(name) || 0)) {
        skillMap.set(name, rating);
      }
    });
    const sortedSkills = Array.from(skillMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name]) => name);
    promptParts.push(`Key Skills: ${sortedSkills.join(', ')}`);
  }

  if (Array.isArray(resumeInfo.experiences) && resumeInfo.experiences.length > 0) {
    const sortedExp = [...resumeInfo.experiences].sort((a, b) => (b.endDate || '')?.localeCompare(a.endDate || ''));
    const expShort = sortedExp.slice(0, 3).map(exp => {
      return `Title: ${exp.title}, Company: ${exp.companyName}, Summary: ${
        exp.workSummary
          ? exp.workSummary
              .replace(/<[^>]+>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 200)
          : ''
      }`;
    });
    promptParts.push(`Key Experiences: ${expShort.join(' | ')}`);
  }

  if (summarySize === 'large') {
    promptParts.push('Make each summary more detailed and longer, up to 6-8 lines.');
  } else if (summarySize === 'extra_large') {
    promptParts.push('Make each summary very detailed and as long as possible, up to 10-12 lines.');
  } else if (summarySize === 'short') {
    promptParts.push('Make each summary concise and short, 2-3 lines.');
  }

  promptParts.push(
    `Based on the provided information, generate three resume summaries for the following experience levels: fresher, mid, and experienced. Return the result as a JSON object with keys 'fresher', 'mid', and 'experienced', where each value is a summary in HTML format. Use any suitable HTML tags (such as <b>, <strong>, <i>, <em>, <u>, <span style>, <p>, etc.) to make the text visually attractive, highlight key skills, technologies, and achievements, and structure the summary. Do not use <ul> or <li> tags and do not use lists. Use only the information provided by the user, do not invent or assume any data, and do not use any hardcoded examples. Each summary should be 3-4 lines (or according to the selected size), personal, engaging, and easy to read. Do not use placeholders. Do not use lists. Each summary should be visually structured, personal, and engaging.`
  );

  return promptParts.join('. ');
};

const SummaryForm = () => {
  const param = useParams();
  const documentId = param.documentId as string;
  const { data, isLoading } = useGetDocumentById(documentId);
  const resumeInfo = data?.data as ResumeDataType | undefined;
  const { mutate: setResumeInfo } = useUpdateDocument();
  const [loading, setLoading] = useState(false);
  const [aiGeneratedSummary, setAiGeneratedSummary] = useState<AIGeneratedSummariesType | null>(null);
  const [localSummary, setLocalSummary] = useState(resumeInfo?.summary || '');
  const [summarySize, setSummarySize] = useState('default');
  const editorRef = React.useRef<RichTextEditorRef>(null);

  const debouncedSummary = useDebounce(localSummary, 500);

  useEffect(() => {
    if (debouncedSummary && debouncedSummary !== resumeInfo?.summary) {
      setResumeInfo({ summary: debouncedSummary });
    }
  }, [debouncedSummary, resumeInfo?.summary, setResumeInfo]);

  const handleChange = (value: string) => {
    setLocalSummary(value);
  };

  const GenerateSummaryFromAI = async () => {
    try {
      if (!data?.data) return;
      setLoading(true);
      const { projectsSectionTitle, ...rest } = data.data;
      const resumeData =
        projectsSectionTitle === null
          ? {
              ...rest,
              skills: rest.skills.map((skill: SkillType) => ({
                ...skill,
                hideRating: !!skill.hideRating,
              })),
            }
          : {
              ...rest,
              projectsSectionTitle,
              skills: rest.skills.map((skill: SkillType) => ({
                ...skill,
                hideRating: !!skill.hideRating,
              })),
            };
      const promptText = buildPrompt(resumeData as ResumeDataType, summarySize);
      const chat = getAIChatSession();
      const result = await chat.sendMessage({ message: promptText });
      const responseText = result.text || '';
      const parsed = parseAIResult(responseText);
      if (parsed && typeof parsed === 'object' && (parsed.fresher || parsed.mid || parsed.experienced)) {
        setAiGeneratedSummary({
          fresher: parsed.fresher || '',
          mid: parsed.mid || '',
          experienced: parsed.experienced || '',
        });
      } else {
        setAiGeneratedSummary(null);
      }
    } catch (error) {
      console.error('error in summary:', error);
      toast({
        title: 'Failed to generate summary',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = useCallback((summary: string) => {
    if (editorRef.current) {
      editorRef.current.setValue(summary);
    }
    setLocalSummary(summary);
  }, []);

  const handleGenerateAI = useCallback(() => {
    void GenerateSummaryFromAI();
  }, [GenerateSummaryFromAI]);

  return (
    <div>
      <div className="w-full">
        <h2 className="text-lg font-bold">Summary</h2>
        <p className="text-sm">Add summary for your resume</p>
      </div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-sm">Summary size:</span>
        <select
          className="rounded border px-2 py-1 text-sm"
          value={summarySize}
          onChange={e => setSummarySize(e.target.value)}
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
              onClick={handleGenerateAI}
            >
              <Sparkles size="15px" className="text-purple-500" />
              Generate with AI
            </Button>
          </div>
          <div className="mt-5 min-h-36">
            <RichTextEditor
              ref={editorRef}
              jobTitle={resumeInfo?.personalInfo?.jobTitle || null}
              initialValue={localSummary}
              value={localSummary}
              onEditorChange={handleChange}
              showBullets={false}
              disabled={false}
              showLineLengthSelector={false}
            />
          </div>
          {aiGeneratedSummary && (
            <div>
              <h5 className="my-4 text-[15px] font-semibold">Suggestions</h5>
              {Object.entries(aiGeneratedSummary)
                .filter(([, summary]) => summary && summary.trim() !== '')
                .map(([experienceType, summary], index) => (
                  <Card
                    role="button"
                    key={index}
                    className="my-4 border-primary/30 bg-primary/5 shadow-none"
                    onClick={() => handleSelect(summary)}
                  >
                    <CardHeader className="py-2">
                      <CardTitle className="text-md font-semibold">
                        {experienceType.charAt(0).toUpperCase() + experienceType.slice(1)}
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
