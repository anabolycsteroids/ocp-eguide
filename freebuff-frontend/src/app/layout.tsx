import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { I18nProvider } from "@/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCP eGuide",
  description:
    "OCP eGuide - Site navigation and visitor management system for OCP Group",
};

export default function RootLayout({
  children,
}: LayoutProps<"/">) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const lang = localStorage.getItem('ocp-eguide-lang');
                if (lang === 'ar') {
                  document.documentElement.setAttribute('dir', 'rtl');
                  document.documentElement.setAttribute('lang', 'ar');
                } else if (lang === 'fr') {
                  document.documentElement.setAttribute('lang', 'fr');
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <I18nProvider>
          <AuthProvider>{children}</AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
