'use client';
import React, { CSSProperties, forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import {
  BtnBold,
  BtnBulletList,
  BtnItalic,
  BtnNumberedList,
  BtnStrikeThrough,
  BtnUnderline,
  createButton,
  Editor,
  EditorProvider,
  Separator,
  Toolbar,
} from 'react-simple-wysiwyg';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader, Sparkles, Wand2 } from 'lucide-react';
import { toast } from '@/hooks';
import { getAIChatSession } from '@/lib/google-ai-model';
import { AIResultObjectType, ParsedAIResult } from '@/types/resume.type';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';

const BtnAlignLeft = createButton('Align left', 'L', 'justifyLeft');
const BtnAlignCenter = createButton('Align center', 'C', 'justifyCenter');
const BtnAlignRight = createButton('Align right', 'R', 'justifyRight');

// Apply line height using custom function
const applyLineHeight = (height: string) => () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  // Extract contents and wrap in span
  const contents = range.extractContents();
  const span = document.createElement('span');
  span.style.lineHeight = height;
  span.appendChild(contents);
  range.insertNode(span);

  // Restore selection
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  selection.addRange(newRange);
};

// Apply paragraph spacing (margin between paragraphs)
const applyParagraphSpacing = (spacing: string) => () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  // Extract contents and wrap in div with margin
  const contents = range.extractContents();
  const div = document.createElement('div');
  div.style.marginTop = spacing;
  div.style.marginBottom = spacing;
  div.appendChild(contents);
  range.insertNode(div);

  // Restore selection
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(div);
  selection.addRange(newRange);
};

// Apply exact font size in pixels
const applyFontSizePixels = (size: string) => () => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  // Extract contents and wrap in span
  const contents = range.extractContents();
  const span = document.createElement('span');
  span.style.fontSize = size;
  span.appendChild(contents);
  range.insertNode(span);

  // Restore selection
  selection.removeAllRanges();
  const newRange = document.createRange();
  newRange.selectNodeContents(span);
  selection.addRange(newRange);
};

// Font size buttons with exact pixel values
const BtnFontSize10 = createButton('Font size 10px', '10', applyFontSizePixels('10px'));
const BtnFontSize11 = createButton('Font size 11px', '11', applyFontSizePixels('11px'));
const BtnFontSize12 = createButton('Font size 12px', '12', applyFontSizePixels('12px'));
const BtnFontSize13 = createButton('Font size 13px', '13', applyFontSizePixels('13px'));
const BtnFontSize14 = createButton('Font size 14px', '14', applyFontSizePixels('14px'));
const BtnFontSize15 = createButton('Font size 15px', '15', applyFontSizePixels('15px'));
const BtnFontSize16 = createButton('Font size 16px', '16', applyFontSizePixels('16px'));
const BtnFontSize18 = createButton('Font size 18px', '18', applyFontSizePixels('18px'));
const BtnFontSize20 = createButton('Font size 20px', '20', applyFontSizePixels('20px'));

// Line height buttons
const BtnLineHeightTight = createButton('Tight line spacing', 'LH-', applyLineHeight('1.2'));
const BtnLineHeightNormal = createButton('Normal line spacing', 'LH', applyLineHeight('1.5'));
const BtnLineHeightLoose = createButton('Loose line spacing', 'LH+', applyLineHeight('2.0'));

// Paragraph spacing buttons
const BtnParagraphSpacingTight = createButton('Tight paragraph spacing', 'PS-', applyParagraphSpacing('2px'));
const BtnParagraphSpacingNormal = createButton('Normal paragraph spacing', 'PS', applyParagraphSpacing('8px'));
const BtnParagraphSpacingLoose = createButton('Loose paragraph spacing', 'PS+', applyParagraphSpacing('16px'));

// Text color buttons using foreColor command
const BtnTextColorBlack = createButton('Black text', 'B', () => {
  document.execCommand('foreColor', false, '#000000');
});
const BtnTextColorRed = createButton('Red text', 'R', () => {
  document.execCommand('foreColor', false, '#ff0000');
});
const BtnTextColorBlue = createButton('Blue text', 'B', () => {
  document.execCommand('foreColor', false, '#0000ff');
});

interface ImproveFormattingOptions {
  list?: boolean;
  font_size?: number;
  button_styles?: CSSProperties | undefined;
  button_text?: string | undefined;
}

interface RichTextEditorProps {
  jobTitle?: string | null;
  initialValue?: string;
  value?: string;
  onEditorChange: (value: string) => void;
  onBlur?: (value: string) => void;
  prompt?: string;
  showBullets?: boolean;
  title?: string;
  onGenerate?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showLineLengthSelector?: boolean;
  resumeLocale?: string;
  improve_formatting_options?: ImproveFormattingOptions;
}

export function parseAIResult(value: string): ParsedAIResult {
  let htmlValue = value;
  const responseText = value;
  let parsed: AIResultObjectType = {};
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else if (responseText.trim().startsWith('{')) {
      parsed = JSON.parse(responseText);
    } else if (responseText.trim().startsWith('[')) {
      parsed = JSON.parse(responseText);
    } else {
      parsed = {};
    }
  } catch {
    // Ignore parsing errors
  }
  if (parsed && typeof parsed === 'object' && (parsed.fresher || parsed.mid || parsed.experienced)) {
    return {
      fresher: parsed.fresher || '',
      mid: parsed.mid || '',
      experienced: parsed.experienced || '',
    };
  }
  if (parsed && typeof parsed === 'object' && parsed.workSummary) {
    htmlValue = parsed.workSummary;
  } else if (parsed && typeof parsed === 'object' && parsed.html) {
    htmlValue = parsed.html;
  } else if (parsed && typeof parsed === 'object' && Array.isArray(parsed.experience)) {
    htmlValue = `<ul>${parsed.experience.map((item: string) => `<li>${item}</li>`).join('')}</ul>`;
  } else if (Array.isArray(parsed)) {
    htmlValue = parsed.filter(x => typeof x === 'string').join('\n');
  }

  htmlValue = htmlValue.trim();
  if (htmlValue.startsWith('"') && htmlValue.endsWith('"')) {
    htmlValue = htmlValue.slice(1, -1);
  }
  htmlValue = htmlValue.replace(/\\n/g, '').replace(/\n/g, '');

  return htmlValue;
}

export interface RichTextEditorRef {
  setValue: (value: string) => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
  (
    {
      jobTitle = null,
      initialValue = '',
      value: controlledValue,
      onEditorChange,
      onBlur,
      prompt,
      showBullets = true,
      title,
      onGenerate,
      placeholder: _placeholder = '',
      disabled = false,
      showLineLengthSelector = true,
      resumeLocale,
      improve_formatting_options,
    },
    ref
  ) => {
    const [value, setValue] = useState(initialValue || '');
    const [loading, setLoading] = useState(false);
    const [isFormattingDialogOpen, setIsFormattingDialogOpen] = useState(false);
    const [additionalPrompt, setAdditionalPrompt] = useState('');
    const [isFormattingLoading, setIsFormattingLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      setValue: (newValue: string) => {
        setValue(newValue);
        onEditorChange(newValue);
        if (onBlur) {
          onBlur(newValue);
        }
      },
    }));

    const getBulletCount = (val: string) => {
      const match = val.match(/<li>/g);
      return match && match.length > 0 ? match.length : 7;
    };
    const [bulletCount, setBulletCount] = useState(getBulletCount(initialValue));
    const [lineLength, setLineLength] = useState(80);

    useEffect(() => {
      if (controlledValue !== undefined && controlledValue !== value) {
        setValue(controlledValue);
      }
    }, [controlledValue, value]);

    const handleGenerate = async () => {
      try {
        if (!jobTitle && !prompt) {
          toast({
            title: 'Must provide Job Position or prompt',
            variant: 'destructive',
          });
          return;
        }
        setLoading(true);
        let usedPrompt = prompt;
        if (!usedPrompt) {
          usedPrompt = `Given the job title "${jobTitle}", create ${bulletCount} concise and personal bullet points in HTML stringify format that highlight my key skills, relevant technologies, and significant contributions in that role. Do not include the job title itself in the output. Provide only the bullet points inside an unordered list.`;
        }
        if (showBullets) {
          usedPrompt = usedPrompt.replace('{bulletCount}', String(bulletCount));
        }
        if (showLineLengthSelector) {
          if (usedPrompt.includes('{maxLineLength}')) {
            usedPrompt = usedPrompt.replace('{maxLineLength}', String(lineLength));
          } else {
            usedPrompt += ` Each <li> must not exceed ${lineLength} characters. Each <li> should be as close as possible to ${lineLength} characters, but not exceed it. Make each bullet point detailed and use the maximum allowed length.`;
          }
        }

        // Add Hebrew language instruction if locale is Hebrew
        if (resumeLocale === 'he') {
          usedPrompt +=
            ' Generate all content in Hebrew language. Use proper Hebrew grammar, vocabulary, and sentence structure. Ensure the content is natural and professional in Hebrew.';
        }

        const chat = getAIChatSession();
        const result = await chat.sendMessage({ message: usedPrompt });
        const responseText = result.text || '';

        const parsedResult = parseAIResult(responseText);
        if (typeof parsedResult === 'string') {
          setValue(parsedResult);
          onEditorChange(parsedResult);
          if (onBlur) onBlur(parsedResult);
          if (onGenerate) onGenerate(parsedResult);
        } else {
          setValue(responseText);
          onEditorChange(responseText);
          if (onBlur) onBlur(responseText);
          if (onGenerate) onGenerate(responseText);
        }
      } catch (error) {
        console.error('error in handleGenerate in summary:', error);
        toast({
          title: 'Failed to generate summary',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    const handleGenerateClick = useCallback(() => {
      void handleGenerate();
    }, [handleGenerate]);

    const handleImproveFormatting = async () => {
      try {
        if (!value || value.trim().length === 0) {
          toast({
            title: 'No content to improve',
            variant: 'destructive',
          });
          return;
        }

        setIsFormattingLoading(true);
        setIsFormattingDialogOpen(false);

        // Determine list formatting instruction based on improve_formatting_options
        let listInstruction = '';
        if (improve_formatting_options?.list === false) {
          listInstruction =
            '2. Do NOT add or use bullet lists (<ul>, <li>). If bullet lists already exist in the content, remove them and convert the content to regular paragraphs or text';
        } else if (improve_formatting_options?.list === true) {
          listInstruction =
            '2. You MUST add bullet lists (<ul>, <li>) to structure the content appropriately. Convert existing text into well-organized bullet points where applicable';
        } else {
          listInstruction =
            '2. Add or improve bullet lists (<ul>, <li>) where it makes logical sense based on the context';
        }

        // Determine font size to use
        const fontSize = improve_formatting_options?.font_size ?? 13;

        let improvementPrompt = `You are a professional resume formatting expert. Your task is to improve ONLY the formatting and styling of the following HTML content WITHOUT changing the actual text content or meaning.

Current HTML content:
${value}

Instructions:
1. Fix any incorrect indentation and spacing
${listInstruction}
3. Highlight key words and phrases in bold (<strong> or <b>) that would stand out in a resume, such as:
   - Job titles and positions
   - Company names
   - Skills and technologies
   - Achievements and metrics
   - Years of experience
   - Certifications
4. Set the default font size to ${fontSize}px for all text (using inline styles or span tags with style="font-size: ${fontSize}px") unless user specifies a different size in additional instructions
5. Ensure proper HTML structure and formatting
6. Keep the exact same text content - do not add, remove, or modify any words
7. Return ONLY the improved HTML without any explanations or wrapper text
8. Do not use JSON format, return only raw HTML`;

        if (additionalPrompt && additionalPrompt.trim().length > 0) {
          improvementPrompt += `\n\nAdditional formatting instructions from user:\n${additionalPrompt}`;
        }

        // Add Hebrew language instruction if locale is Hebrew
        if (resumeLocale === 'he') {
          improvementPrompt += ' Maintain Hebrew text direction and ensure proper RTL formatting.';
        }

        const chat = getAIChatSession();
        const result = await chat.sendMessage({ message: improvementPrompt });
        let responseText = result.text || '';

        // Clean up the response - remove any JSON wrapper if present
        responseText = responseText.trim();
        if (responseText.startsWith('```html')) {
          responseText = responseText.replace(/```html\n?/, '').replace(/```$/, '');
        } else if (responseText.startsWith('```')) {
          responseText = responseText.replace(/```\n?/, '').replace(/```$/, '');
        }

        // Remove any JSON wrapper
        const jsonMatch = responseText.match(/\{[\s\S]*"html"[\s\S]*:[\s\S]*"([\s\S]*)"[\s\S]*\}/);
        if (jsonMatch && jsonMatch[1]) {
          responseText = jsonMatch[1];
        }

        responseText = responseText.trim();

        setValue(responseText);
        onEditorChange(responseText);
        if (onBlur) onBlur(responseText);

        setAdditionalPrompt('');
        toast({
          title: 'Formatting improved successfully',
          variant: 'default',
        });
      } catch (error) {
        console.error('error in handleImproveFormatting:', error);
        toast({
          title: 'Failed to improve formatting',
          variant: 'destructive',
        });
      } finally {
        setIsFormattingLoading(false);
      }
    };

    const handleOpenFormattingDialog = () => {
      setIsFormattingDialogOpen(true);
    };

    const handleFormattingDialogSubmit = useCallback(() => {
      void handleImproveFormatting();
    }, [handleImproveFormatting]);

    return (
      <div>
        <div className="my-2 flex items-center justify-between">
          {title && <Label>{title}</Label>}
          <div className="flex items-center gap-2">
            {showBullets && (
              <select
                className="rounded border px-2 py-1 text-sm"
                value={bulletCount}
                onChange={e => setBulletCount(Number(e.target.value))}
                disabled={disabled}
              >
                {[3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>
                    {n} bullet{n > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            )}
            {showLineLengthSelector && (
              <select
                className="rounded border px-2 py-1 text-sm"
                value={lineLength}
                onChange={e => setLineLength(Number(e.target.value))}
                disabled={disabled}
              >
                {[
                  30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 240,
                  250, 260, 270, 280, 290, 300,
                ].map(n => (
                  <option key={n} value={n}>
                    {n} chars/line
                  </option>
                ))}
              </select>
            )}
            {prompt && (
              <Button
                variant="outline"
                type="button"
                className="gap-1"
                disabled={loading || disabled}
                onClick={handleGenerateClick}
              >
                <Sparkles size="15px" className="text-purple-500" />
                Generate with AI
                {loading && <Loader size="13px" className="animate-spin" />}
              </Button>
            )}
            <Button
              variant="outline"
              type="button"
              className="gap-1"
              disabled={isFormattingLoading || disabled || !value || value.trim().length === 0}
              onClick={handleOpenFormattingDialog}
              style={improve_formatting_options?.button_styles ?? {}}
            >
              <Wand2 size="15px" className="text-blue-500" />
              {improve_formatting_options?.button_text ?? 'Improve Formatting'}
              {isFormattingLoading && <Loader size="13px" className="animate-spin" />}
            </Button>
          </div>
        </div>
        <EditorProvider>
          <Editor
            id="rich-text-editor"
            value={value}
            containerProps={{
              style: {
                resize: 'vertical',
                lineHeight: 1.2,
                fontSize: '13.5px',
              },
            }}
            onChange={e => {
              const parsedValue = parseAIResult(e.target.value);
              if (typeof parsedValue === 'string') {
                setValue(parsedValue);
                onEditorChange(parsedValue);
              }
            }}
            onBlur={() => {
              if (onBlur) {
                onBlur(value);
              }
            }}
            disabled={disabled}
          >
            <Toolbar>
              <BtnBold />
              <BtnItalic />
              <BtnUnderline />
              <BtnStrikeThrough />
              <Separator />
              <BtnNumberedList />
              <BtnBulletList />
              <Separator />
              <BtnAlignLeft />
              <BtnAlignCenter />
              <BtnAlignRight />
              <Separator />
              <BtnFontSize10 />
              <BtnFontSize11 />
              <BtnFontSize12 />
              <BtnFontSize13 />
              <BtnFontSize14 />
              <BtnFontSize15 />
              <BtnFontSize16 />
              <BtnFontSize18 />
              <BtnFontSize20 />
              <Separator />
              <BtnLineHeightTight />
              <BtnLineHeightNormal />
              <BtnLineHeightLoose />
              <Separator />
              <BtnParagraphSpacingTight />
              <BtnParagraphSpacingNormal />
              <BtnParagraphSpacingLoose />
              <Separator />
              <BtnTextColorBlack />
              <BtnTextColorRed />
              <BtnTextColorBlue />
            </Toolbar>
          </Editor>
        </EditorProvider>

        <Dialog open={isFormattingDialogOpen} onOpenChange={setIsFormattingDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Improve Text Formatting</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="additional-prompt">Additional Instructions (Optional)</Label>
                <Textarea
                  id="additional-prompt"
                  placeholder="Add any specific formatting instructions here..."
                  value={additionalPrompt}
                  onChange={e => setAdditionalPrompt(e.target.value)}
                  className="mt-2 min-h-[100px]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsFormattingDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleFormattingDialogSubmit} disabled={isFormattingLoading}>
                {isFormattingLoading && <Loader size="13px" className="mr-2 animate-spin" />}
                {isFormattingLoading ? 'Processing...' : 'Improve'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

export default RichTextEditor;
