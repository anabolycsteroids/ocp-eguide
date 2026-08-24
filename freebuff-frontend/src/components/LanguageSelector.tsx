"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import type { Lang } from "@/i18n";

const languages: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "ar", label: "عربي", flag: "🇲🇦" },
];

export default function LanguageSelector({ variant = "dark" }: { variant?: "dark" | "light" }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const current = languages.find((l) => l.code === lang) ?? languages[0];

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function select(code: Lang) {
    setLang(code);
    setOpen(false);
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case "Escape":
        setOpen(false);
        break;
      case "ArrowDown":
        event.preventDefault();
        if (!open) { setOpen(true); }
        else {
          const idx = languages.findIndex((l) => l.code === lang);
          select(languages[(idx + 1) % languages.length].code);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!open) { setOpen(true); }
        else {
          const idx = languages.findIndex((l) => l.code === lang);
          select(languages[(idx - 1 + languages.length) % languages.length].code);
        }
        break;
      case "Enter":
      case " ":
        if (!open) { event.preventDefault(); setOpen(true); }
        break;
    }
  }

  const isDark = variant === "dark";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
          isDark
            ? "text-white/90 bg-white/10 backdrop-blur-md border-white/20 hover:bg-white/20"
            : "text-ocp-navy bg-ocp-gray border-ocp-border hover:bg-gray-200"
        }`}
      >
        <span className="text-sm">{current.flag}</span>
        <span>{current.label}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Languages"
          className={`absolute end-0 top-full mt-2 w-36 rounded-xl overflow-hidden shadow-xl z-50 border ${
            isDark
              ? "bg-white/10 backdrop-blur-xl border-white/20"
              : "bg-white border-ocp-border"
          }`}
        >
          {languages.map((l) => (
            <li key={l.code} role="option" aria-selected={l.code === lang}>
              <button
                type="button"
                onClick={() => select(l.code)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm transition-colors cursor-pointer ${
                  l.code === lang
                    ? isDark
                      ? "bg-ocp-green/30 text-white font-semibold"
                      : "bg-ocp-green-lighter text-ocp-green font-semibold"
                    : isDark
                      ? "text-white/80 hover:bg-white/10"
                      : "text-ocp-navy hover:bg-ocp-gray"
                }`}
              >
                <span className="text-base">{l.flag}</span>
                <span>{l.label}</span>
                {l.code === lang && (
                  <span
                    className={`ms-auto w-1.5 h-1.5 rounded-full ${
                      isDark ? "bg-ocp-green" : "bg-ocp-green"
                    }`}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
