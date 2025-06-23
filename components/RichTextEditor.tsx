'use client';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  EditorProvider,
  Editor,
  Toolbar,
  BtnBold,
  BtnItalic,
  BtnUnderline,
  BtnStrikeThrough,
  Separator,
  BtnNumberedList,
  BtnBulletList,
  BtnLink,
  createButton,
} from 'react-simple-wysiwyg';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Loader, Sparkles } from 'lucide-react';
import { toast } from '@/hooks';
import { getAIChatSession } from '@/lib/google-ai-model';
import { AIResultObjectType, ParsedAIResult } from '@/types/resume.type';

const BtnAlignLeft = createButton('Align left', 'L', 'justifyLeft');
const BtnAlignCenter = createButton('Align center', 'C', 'justifyCenter');
const BtnAlignRight = createButton('Align right', 'R', 'justifyRight');

const applyFontSize = (size: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;

  const wrapTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim()) {
      const span = document.createElement('span');
      span.style.fontSize = size;
      span.textContent = node.textContent;
      node.parentNode?.replaceChild(span, node);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        wrapTextNodes(child);
      }
    }
  };

  const contents = range.cloneContents();
  wrapTextNodes(contents);

  range.deleteContents();
  range.insertNode(contents);
};

const applyHeading = (tag: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;
  const el = document.createElement(tag);
  range.surroundContents(el);
};

const applyTextColor = (color: string) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (range.collapsed) return;
  const span = document.createElement('span');
  span.style.color = color;
  range.surroundContents(span);
};

const BtnFontSizeSmall = createButton('Small text', 'A-', () => applyFontSize('12px'));
const BtnFontSizeNormal = createButton('Normal text', 'A', () => applyFontSize('16px'));
const BtnFontSizeLarge = createButton('Large text', 'A+', () => applyFontSize('20px'));
const BtnHeading1 = createButton('Heading 1', 'H1', () => applyHeading('h1'));
const BtnHeading2 = createButton('Heading 2', 'H2', () => applyHeading('h2'));
const BtnTextColorRed = createButton('Red text', 'Red', () => applyTextColor('red'));
const BtnTextColorBlue = createButton('Blue text', 'Blue', () => applyTextColor('blue'));

interface RichTextEditorProps {
  jobTitle?: string | null;
  initialValue?: string;
  value?: string;
  onEditorChange: (value: string) => void;
  prompt?: string;
  showBullets?: boolean;
  title?: string;
  onGenerate?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  showLineLengthSelector?: boolean;
}

export function parseAIResult(value: string): ParsedAIResult {
  let htmlValue = value;
  const responseText = value;
  let parsed: AIResultObjectType = {};
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
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
    // Ignore parsing errors and use empty object
  }
  if (
    parsed &&
    typeof parsed === 'object' &&
    (parsed.fresher || parsed.mid || parsed.experienced)
  ) {
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
  } else if (typeof parsed === 'string') {
    htmlValue = parsed;
  }
  if (typeof htmlValue === 'string') {
    htmlValue = htmlValue.trim();
    if (htmlValue.startsWith('"') && htmlValue.endsWith('"')) {
      htmlValue = htmlValue.slice(1, -1);
    }
    htmlValue = htmlValue.replace(/\\n/g, '').replace(/\n/g, '');
  }

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
      prompt,
      showBullets = true,
      title,
      onGenerate,
      placeholder: _placeholder = '',
      disabled = false,
      showLineLengthSelector = true,
    },
    ref
  ) => {
    const [value, setValue] = useState(initialValue || '');
    const [loading, setLoading] = useState(false);

    useImperativeHandle(ref, () => ({
      setValue: (newValue: string) => {
        setValue(newValue);
        onEditorChange(newValue);
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
    }, [controlledValue]);

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
        const chat = getAIChatSession();
        const result = await chat.sendMessage({ message: usedPrompt });
        const responseText = result.text || '';
        const resultValue = responseText;
        const parsedResult = parseAIResult(resultValue);
        if (typeof parsedResult === 'string') {
          setValue(parsedResult);
          onEditorChange(parsedResult);
          if (onGenerate) onGenerate(parsedResult);
        } else {
          setValue(responseText);
          onEditorChange(responseText);
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

    return (
      <div>
        <div className="flex items-center justify-between my-2">
          {title && <Label>{title}</Label>}
          <div className="flex items-center gap-2">
            {showBullets && (
              <select
                className="border rounded px-2 py-1 text-sm"
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
                className="border rounded px-2 py-1 text-sm"
                value={lineLength}
                onChange={e => setLineLength(Number(e.target.value))}
                disabled={disabled}
              >
                {[
                  30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200,
                  210, 220, 230, 240, 250, 260, 270, 280, 290, 300,
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
                onClick={handleGenerate}
              >
                <>
                  <Sparkles size="15px" className="text-purple-500" />
                  Generate with AI
                </>
                {loading && <Loader size="13px" className="animate-spin" />}
              </Button>
            )}
          </div>
        </div>
        <EditorProvider>
          <Editor
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
              <BtnLink />
              <Separator />
              <BtnAlignLeft />
              <BtnAlignCenter />
              <BtnAlignRight />
              <Separator />
              <BtnFontSizeSmall />
              <BtnFontSizeNormal />
              <BtnFontSizeLarge />
              <Separator />
              <BtnHeading1 />
              <BtnHeading2 />
              <Separator />
              <BtnTextColorRed />
              <BtnTextColorBlue />
            </Toolbar>
          </Editor>
        </EditorProvider>
      </div>
    );
  }
);

export default RichTextEditor;
