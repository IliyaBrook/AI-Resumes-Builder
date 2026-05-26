'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AlertTriangle, FileText, Loader, Sparkles, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Textarea,
} from '@/components';
import {
  useCreateImportedResume,
  useParseResumeFile,
  type ImportedEducation,
  type ImportedExperience,
  type ImportedPersonalInfo,
  type ImportedProject,
  type ImportedResumeResult,
  type ImportedWarning,
} from '@/hooks';

type Stage = 'upload' | 'parsing' | 'review' | 'importing';

type WarningState = {
  dismissed: boolean;
  edited: string;
  appendToSummary: boolean;
};

interface PropTypes {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx'];
const ACCEPT_ATTR =
  'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.pdf,.docx';

const stripExtension = (name: string): string => {
  const idx = name.lastIndexOf('.');
  return idx > 0 ? name.slice(0, idx) : name;
};

const isSupported = (file: File): boolean => {
  const lower = file.name.toLowerCase();
  return SUPPORTED_EXTENSIONS.some(ext => lower.endsWith(ext));
};

const formatYearMonth = (value?: string | null): string | null => {
  if (!value) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value.slice(0, 7) : value;
};

const formatRange = (start?: string | null, end?: string | null, isCurrent?: boolean): string => {
  const startStr = formatYearMonth(start) ?? '?';
  const endStr = isCurrent ? 'Present' : (formatYearMonth(end) ?? 'Present');
  if (!start && !end && !isCurrent) return '';
  return `${startStr} — ${endStr}`;
};

const personalInfoFields: Array<{ key: keyof ImportedPersonalInfo; label: string; type?: string }> = [
  { key: 'firstName', label: 'First name' },
  { key: 'lastName', label: 'Last name' },
  { key: 'jobTitle', label: 'Job title' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'github', label: 'GitHub' },
];

const WARNING_TYPE_LABEL: Record<ImportedWarning['type'], string> = {
  unsupported_section: 'Not in this resume builder',
  uncertain_field: 'Double-check this',
  format_issue: 'Format note',
};

const ImportResumeDialog: React.FC<PropTypes> = ({ open, onOpenChange }) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [parsed, setParsed] = useState<ImportedResumeResult | null>(null);
  const [summary, setSummary] = useState('');
  const [personalInfo, setPersonalInfo] = useState<ImportedPersonalInfo>({});
  const [warningStates, setWarningStates] = useState<WarningState[]>([]);

  const parseFileMutation = useParseResumeFile();
  const createImportedMutation = useCreateImportedResume();

  const resetState = useCallback(() => {
    setStage('upload');
    setIsDragging(false);
    setUploadError(null);
    setTitle('');
    setParsed(null);
    setSummary('');
    setPersonalInfo({});
    setWarningStates([]);
    parseFileMutation.reset();
    createImportedMutation.reset();
  }, [parseFileMutation, createImportedMutation]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (stage === 'parsing' || stage === 'importing') return;
      if (!next) resetState();
      onOpenChange(next);
    },
    [stage, resetState, onOpenChange]
  );

  const startParsing = useCallback(
    async (file: File) => {
      if (!isSupported(file)) {
        setUploadError('Only .pdf and .docx files are supported');
        return;
      }
      setUploadError(null);
      setTitle(stripExtension(file.name));
      setStage('parsing');
      try {
        const result = await parseFileMutation.mutateAsync(file);
        setParsed(result);
        setSummary(result.data.summary ?? '');
        setPersonalInfo(result.data.personalInfo ?? {});
        setWarningStates(
          (result.warnings ?? []).map(warning => ({
            dismissed: false,
            edited: warning.content,
            appendToSummary: false,
          }))
        );
        setStage('review');
      } catch {
        setStage('upload');
      }
    },
    [parseFileMutation]
  );

  const onFileSelected = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      void startParsing(file);
    },
    [startParsing]
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(false);
      const file = event.dataTransfer.files?.[0];
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const counts = useMemo(() => {
    const data = parsed?.data;
    return {
      experiences: data?.experiences?.length ?? 0,
      educations: data?.educations?.length ?? 0,
      skills: data?.skills?.length ?? 0,
      projects: data?.projects?.length ?? 0,
      languages: data?.languages?.length ?? 0,
    };
  }, [parsed]);

  const updateWarning = useCallback((index: number, patch: Partial<WarningState>) => {
    setWarningStates(prev => prev.map((w, i) => (i === index ? { ...w, ...patch } : w)));
  }, []);

  const visibleWarningsCount = useMemo(() => warningStates.filter(w => !w.dismissed).length, [warningStates]);

  const handleImport = useCallback(async () => {
    if (!parsed) return;
    setStage('importing');

    const warnings = parsed.warnings ?? [];
    let mergedSummary = summary;
    warnings.forEach((warning, index) => {
      const state = warningStates[index];
      if (!state || state.dismissed) return;
      if (state.appendToSummary && state.edited.trim()) {
        const prefix = mergedSummary ? `${mergedSummary}\n\n` : '';
        mergedSummary = `${prefix}${warning.label}: ${state.edited.trim()}`;
      }
    });

    try {
      const result = await createImportedMutation.mutateAsync({
        title: title.trim() || 'Imported Resume',
        summary: mergedSummary.trim() || null,
        armyService: parsed.data.armyService ?? null,
        personalInfo,
        experiences: parsed.data.experiences,
        educations: parsed.data.educations,
        skills: parsed.data.skills,
        projects: parsed.data.projects,
        languages: parsed.data.languages,
      });
      resetState();
      onOpenChange(false);
      router.push(`/dashboard/document/${result.documentId}/${result.locale ?? 'en'}/edit`);
    } catch {
      setStage('review');
    }
  }, [parsed, summary, warningStates, personalInfo, title, createImportedMutation, resetState, onOpenChange, router]);

  const renderUpload = () => (
    <div
      onDragOver={e => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-12 transition ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary'
      }`}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
      }}
    >
      <Upload size="40px" className="text-muted-foreground" />
      <div className="text-center">
        <p className="font-medium">Drop your resume here, or click to browse</p>
        <p className="text-muted-foreground mt-1 text-xs">Supported: .pdf, .docx · max 8MB</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="hidden"
        onChange={e => onFileSelected(e.target.files?.[0] ?? undefined)}
      />
      {uploadError && <p className="text-destructive text-sm">{uploadError}</p>}
    </div>
  );

  const renderParsing = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Loader size="40px" className="text-primary animate-spin" />
      <div className="text-center">
        <p className="font-medium">Analyzing your resume…</p>
        <p className="text-muted-foreground mt-1 text-sm">The AI is mapping fields to your resume builder</p>
      </div>
    </div>
  );

  const renderImporting = () => (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <Loader size="40px" className="text-primary animate-spin" />
      <p className="font-medium">Creating your resume…</p>
    </div>
  );

  const renderReview = () => {
    if (!parsed) return null;
    const warnings = parsed.warnings ?? [];
    const data = parsed.data;

    return (
      <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
        <div className="space-y-1.5">
          <Label htmlFor="import-title">Resume title</Label>
          <Input
            id="import-title"
            aria-label="Resume title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Resume title"
          />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Personal info</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {personalInfoFields.map(field => (
              <div key={field.key} className="space-y-1">
                <Label htmlFor={`pi-${field.key}`} className="text-xs">
                  {field.label}
                </Label>
                <Input
                  aria-label={field.label}
                  id={`pi-${field.key}`}
                  type={field.type ?? 'text'}
                  value={personalInfo[field.key] ?? ''}
                  onChange={e =>
                    setPersonalInfo(prev => ({
                      ...prev,
                      [field.key]: e.target.value || null,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="import-summary">Summary</Label>
          <Textarea
            id="import-summary"
            value={summary}
            onChange={e => setSummary(e.target.value)}
            rows={4}
            placeholder="Professional summary"
          />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold">Detected sections</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <CountTile label="Experiences" value={counts.experiences} />
            <CountTile label="Educations" value={counts.educations} />
            <CountTile label="Skills" value={counts.skills} />
            <CountTile label="Projects" value={counts.projects} />
            <CountTile label="Languages" value={counts.languages} />
          </div>
          <p className="text-muted-foreground mt-2 text-xs">
            Previews below show what was extracted. Fine-tune everything in the editor after import.
          </p>
        </div>

        <SectionPreview title="Experiences" items={data.experiences ?? []} render={renderExperiencePreview} />
        <SectionPreview title="Educations" items={data.educations ?? []} render={renderEducationPreview} />
        <SectionPreview
          title="Skills"
          items={data.skills ?? []}
          render={skill => `${skill.name}${skill.category ? ` (${skill.category})` : ''}`}
          inline
        />
        <SectionPreview title="Projects" items={data.projects ?? []} render={renderProjectPreview} />
        <SectionPreview
          title="Languages"
          items={data.languages ?? []}
          render={lang => `${lang.name}${lang.level ? ` — ${lang.level}` : ''}`}
        />

        {warnings.length > 0 && (
          <div>
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400">
              <AlertTriangle size="16px" />
              {visibleWarningsCount} of {warnings.length} {warnings.length === 1 ? 'note' : 'notes'} from the AI
            </h3>
            {visibleWarningsCount === 0 ? (
              <p className="text-muted-foreground text-xs">All notes dismissed.</p>
            ) : (
              <div className="space-y-3">
                {warnings.map((warning, index) => (
                  <WarningCard
                    key={index}
                    warning={warning}
                    state={warningStates[index]}
                    onChange={patch => updateWarning(index, patch)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const isWorking = stage === 'parsing' || stage === 'importing';
  const canImport = stage === 'review' && Boolean(title.trim());

  // noinspection ShadcnComponentComposition
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-2xl sm:max-w-3xl"
        aria-describedby="import-resume-description"
        onInteractOutside={e => {
          if (isWorking) e.preventDefault();
        }}
        onEscapeKeyDown={e => {
          if (isWorking) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-primary" size="18px" />
            AI Import Resume
          </DialogTitle>
          <p id="import-resume-description" className="text-muted-foreground text-sm">
            Upload an existing resume and let AI map it into a new resume in your builder.
          </p>
        </DialogHeader>

        {stage === 'upload' && renderUpload()}
        {stage === 'parsing' && renderParsing()}
        {stage === 'review' && renderReview()}
        {stage === 'importing' && renderImporting()}

        {stage === 'review' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                void handleImport();
              }}
              disabled={!canImport}
            >
              <FileText size="16px" />
              Import Resume
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CountTile: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div className="bg-muted/30 rounded-md border p-2 text-center">
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-muted-foreground text-[11px] tracking-wide uppercase">{label}</p>
  </div>
);

interface SectionPreviewProps<T> {
  title: string;
  items: T[];
  render: (item: T) => React.ReactNode;
  inline?: boolean;
}

function SectionPreview<T>({ title, items, render, inline }: SectionPreviewProps<T>) {
  if (!items.length) return null;
  return (
    <div>
      <h4 className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">{title}</h4>
      {inline ? (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item, idx) => (
            <span key={idx} className="bg-muted rounded-full px-2 py-0.5 text-xs">
              {render(item)}
            </span>
          ))}
        </div>
      ) : (
        <ul className="space-y-1 text-sm">
          {items.map((item, idx) => (
            <li key={idx} className="border-muted-foreground/30 border-l-2 pl-2">
              {render(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const renderExperiencePreview = (exp: ImportedExperience) => {
  const range = formatRange(exp.startDate, exp.endDate, exp.currentlyWorking);
  const heading = [exp.title, exp.companyName].filter(Boolean).join(' — ');
  return (
    <div>
      <p className="font-medium">{heading || 'Untitled experience'}</p>
      <p className="text-muted-foreground text-xs">
        {[exp.city, exp.state].filter(Boolean).join(', ')}
        {range && (exp.city || exp.state) ? ' · ' : ''}
        {range}
      </p>
    </div>
  );
};

const renderEducationPreview = (edu: ImportedEducation) => {
  const range = formatRange(edu.startDate, edu.endDate, edu.currentlyStudying);
  const heading = [edu.degree, edu.major].filter(Boolean).join(', ');
  return (
    <div>
      <p className="font-medium">{heading || edu.universityName || 'Untitled education'}</p>
      <p className="text-muted-foreground text-xs">
        {edu.universityName && heading ? edu.universityName : ''}
        {range ? (edu.universityName && heading ? ' · ' : '') + range : ''}
      </p>
    </div>
  );
};

const renderProjectPreview = (project: ImportedProject) => (
  <div>
    <p className="font-medium">{project.name}</p>
    {project.description && <p className="text-muted-foreground line-clamp-2 text-xs">{project.description}</p>}
  </div>
);

interface WarningCardProps {
  warning: ImportedWarning;
  state: WarningState | undefined;
  onChange: (patch: Partial<WarningState>) => void;
}

const WarningCard: React.FC<WarningCardProps> = ({ warning, state, onChange }) => {
  if (!state || state.dismissed) return null;
  const isUnsupported = warning.type === 'unsupported_section';

  return (
    <div className="rounded-md border border-amber-300/60 bg-amber-50/40 p-3 dark:border-amber-700/50 dark:bg-amber-950/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium">{warning.label}</p>
          <p className="text-xs tracking-wide text-amber-600 uppercase dark:text-amber-400">
            {WARNING_TYPE_LABEL[warning.type]}
          </p>
        </div>
        <button
          type="button"
          aria-label="Dismiss this note"
          title="Dismiss this note"
          className="text-muted-foreground hover:bg-muted rounded p-1"
          onClick={() => onChange({ dismissed: true, appendToSummary: false })}
        >
          <X size="14px" />
        </button>
      </div>

      <p className="text-muted-foreground mt-2 text-xs">
        <span className="font-semibold">From your file:</span> {warning.content}
      </p>
      {warning.suggestion && (
        <p className="text-muted-foreground mt-1 text-xs">
          <span className="font-semibold">AI suggestion:</span> {warning.suggestion}
        </p>
      )}

      {isUnsupported ? (
        <>
          <p className="text-muted-foreground mt-2 text-xs">
            This builder has no section for this. You can paste it into the summary if you want to keep it.
          </p>
          <Textarea
            className="mt-2 text-xs"
            rows={2}
            value={state.edited}
            onChange={e => onChange({ edited: e.target.value })}
            placeholder="Edit before adding to summary"
          />
          <label className="mt-2 flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={state.appendToSummary}
              onChange={e => onChange({ appendToSummary: e.target.checked })}
            />
            Add this to my summary
          </label>
        </>
      ) : (
        <p className="text-muted-foreground mt-2 text-xs italic">
          Open the editor after import to verify or fix this field.
        </p>
      )}
    </div>
  );
};

export default ImportResumeDialog;
