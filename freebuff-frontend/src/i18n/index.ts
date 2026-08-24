"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  createElement,
  ReactNode,
} from "react";
import en from "./en.json";
import fr from "./fr.json";
import ar from "./ar.json";

export type Lang = "en" | "fr" | "ar";

const translations: Record<Lang, Record<string, unknown>> = { en, fr, ar };

const LANG_KEY = "ocp-eguide-lang";

function isLang(value: string | null): value is Lang {
  return value === "en" || value === "fr" || value === "ar";
}

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(LANG_KEY);
  return isLang(stored) ? stored : "en";
}

function resolve(
  dict: Record<string, unknown>,
  key: string
): string | undefined {
  const value = key
    .split(".")
    .reduce<unknown>(
      (acc, part) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[part]
          : undefined,
      dict
    );
  return typeof value === "string" ? value : undefined;
}

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

export const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: (key: string) => key,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_KEY, l);
    }
  }, []);

  useEffect(() => {
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      const value = resolve(translations[lang], key) ?? key;
      if (!params) return value;
      return Object.entries(params).reduce<string>(
        (str, [k, v]) => str.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
        value
      );
    },
    [lang]
  );

  const dir: "ltr" | "rtl" = lang === "ar" ? "rtl" : "ltr";

  return createElement(
    I18nContext.Provider,
    { value: { lang, setLang, t, dir } },
    children
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
