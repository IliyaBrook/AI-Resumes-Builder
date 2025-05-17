"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ChevronDown, Loader, Moon, Sun, Home } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "next-themes";

const MODELS = [
  { label: "Gemini 1.5 Flash", value: "gemini-1.5-flash" },
  { label: "Gemini 2.0 Flash", value: "gemini-2.0-flash" },
  { label: "Gemini 2.0 Flash-Lite", value: "gemini-2.0-flash-lite" }
];

const THEMES = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const Header = () => {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const { setTheme, resolvedTheme = 'light' } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    fetch("/api/llm-model")
      .then((res) => res.json())
      .then((data) => {
        if (data.modelName) setSelectedModel(data.modelName);
      });
  }, []);

  const handleSelect = (value: string) => {
    setSelectedModel(value);
    fetch("/api/llm-model", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ modelName: value }),
    });
  };

  const handleThemeSelect = (value: string) => {
    setTheme(value);
    fetch("/api/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ theme: value }),
    });
  };

  return (
    <div
      className="shadow-sm w-full sticky
    top-0 bg-white dark:bg-gray-900 z-[9]
        "
    >
      <div
        className="w-full mx-auto max-w-7xl
        py-2 px-5 flex items-center justify-between
        "
      >
        <div
          className="flex items-center
            flex-1 gap-9
            "
        >
          <div className="flex items-center gap-2">
            <Home className="w-5 h-5 text-primary" />
            <Link
              href="/dashboard"
              className="font-black text-[20px]
                      text-primary
                          "
            >
              Home
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="ml-4 px-3 py-1 border rounded text-sm flex items-center gap-2"
                  type="button"
                >
                  {MODELS.find((m) => m.value === selectedModel)?.label}
                  <ChevronDown className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {MODELS.map((model) => (
                  <DropdownMenuItem
                    key={model.value}
                    onClick={() => handleSelect(model.value)}
                  >
                    {model.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`relative flex items-center justify-center h-8 w-8 rounded border transition-colors ${resolvedTheme === "dark" ? "border-white" : "border-gray-300"}`}
              >
                {isMounted && (resolvedTheme === "dark" ? (
                  <Moon className="h-[1.2rem] w-[1.2rem] text-white" />
                ) : (
                  <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
                ))}
                <span className="sr-only">Toggle theme</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {THEMES.map((t) => (
                <DropdownMenuItem
                  key={t.value}
                  onClick={() => handleThemeSelect(t.value)}
                >
                  {t.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
