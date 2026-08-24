"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  Mail,
  MessageSquare,
  Phone,
  Send,
} from "lucide-react";
import OcpLogo from "@/components/OcpLogo";
import { useI18n } from "@/i18n";

const NAV_LINKS = [
  { href: "/", key: "nav.home" },
  { href: "/about", key: "nav.about" },
  { href: "/services", key: "nav.services" },
  { href: "/contact", key: "nav.contact" },
];

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const EMPTY_FORM: ContactForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ContactPage() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [form, setForm] = useState<ContactForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<ContactForm>>({});
  const [sent, setSent] = useState(false);

  const updateField = (field: keyof ContactForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): Partial<ContactForm> => {
    const nextErrors: Partial<ContactForm> = {};
    if (!form.name.trim()) nextErrors.name = "Name is required.";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!form.subject.trim()) nextErrors.subject = "Subject is required.";
    if (!form.message.trim()) nextErrors.message = "Message is required.";
    return nextErrors;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSent(true);
      setForm(EMPTY_FORM);
    }
  };

  const inputClassName = (hasError?: string) =>
    `w-full px-4 py-3 bg-white border rounded-xl text-sm text-ocp-navy placeholder:text-ocp-gray-dark/60 outline-none transition-colors focus:ring-2 focus:ring-ocp-green/20 focus:border-ocp-green ${
      hasError ? "border-red-400" : "border-ocp-border"
    }`;

  return (
    <div className="min-h-screen bg-ocp-background flex flex-col">
      <header className="sticky top-0 z-20 bg-white/85 backdrop-blur-md border-b border-ocp-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm font-medium text-ocp-gray-dark hover:text-ocp-green transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </Link>
            <span className="hidden md:block h-6 w-px bg-ocp-border" />
            <span className="hidden md:block">
              <OcpLogo size="md" glass={false} />
            </span>
          </div>
          <nav className="flex items-center gap-1 sm:gap-2">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-ocp-green/10 text-ocp-green"
                      : "text-ocp-gray-dark hover:text-ocp-navy hover:bg-ocp-gray"
                  }`}
                >
                  {t(link.key)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="md:hidden px-4 pb-3 flex justify-center">
          <OcpLogo size="md" glass={false} />
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ocp-green-lighter via-white to-ocp-green-light" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-ocp-navy">
            {t("contact.title")}
          </h1>
          <p className="mt-3 text-base md:text-lg text-ocp-gray-dark max-w-2xl mx-auto leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>
      </section>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 md:py-14">
        <section className="bg-white rounded-xl border border-ocp-border p-6 md:p-8 shadow-sm mb-8 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-ocp-green/10 flex items-center justify-center flex-shrink-0">
            <HelpCircle size={24} className="text-ocp-green" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-ocp-navy">
              {t("contact.needHelp")}
            </h2>
            <p className="mt-1 text-sm text-ocp-gray-dark leading-relaxed">
              {t("contact.needHelpText")}
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <section className="lg:col-span-2 bg-white rounded-xl border border-ocp-border p-6 md:p-8 shadow-sm h-fit">
            <div className="w-12 h-12 rounded-xl bg-ocp-green/10 flex items-center justify-center mb-4">
              <Phone size={24} className="text-ocp-green" />
            </div>
            <h2 className="text-lg font-semibold text-ocp-navy">
              {t("contact.contactReception")}
            </h2>
            <p className="mt-1 text-sm text-ocp-gray-dark leading-relaxed">
              {t("contact.contactReceptionDesc")}
            </p>
            <div className="mt-5 pt-5 border-t border-ocp-border space-y-3">
              <div className="flex items-center gap-3 text-sm text-ocp-gray-dark">
                <Phone size={16} className="text-ocp-green flex-shrink-0" />
                <span>Reception contact information</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ocp-gray-dark">
                <Mail size={16} className="text-ocp-green flex-shrink-0" />
                <span>Reception contact information</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-ocp-gray-dark">
                <MessageSquare
                  size={16}
                  className="text-ocp-green flex-shrink-0"
                />
                <span>{t("dashboard.campusAssistance")}</span>
              </div>
            </div>
          </section>

          <section className="lg:col-span-3 bg-white rounded-xl border border-ocp-border p-6 md:p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-ocp-navy mb-6">
              {t("contact.contactForm")}
            </h2>

            {sent && (
              <div className="mb-6 flex items-center gap-3 p-4 rounded-xl bg-ocp-green/10 border border-ocp-green/20">
                <CheckCircle
                  size={20}
                  className="text-ocp-green flex-shrink-0"
                />
                <p className="text-sm font-medium text-ocp-navy">
                  {t("contact.messageSent")}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-medium text-ocp-navy mb-1.5"
                  >
                    {t("contact.name")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className={inputClassName(errors.name)}
                    placeholder={t("contact.name")}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-medium text-ocp-navy mb-1.5"
                  >
                    {t("contact.email")} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className={inputClassName(errors.email)}
                    placeholder={t("contact.email")}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-sm font-medium text-ocp-navy mb-1.5"
                >
                  {t("contact.subject")} <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={form.subject}
                  onChange={(e) => updateField("subject", e.target.value)}
                  className={inputClassName(errors.subject)}
                  placeholder={t("contact.subject")}
                />
                {errors.subject && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-sm font-medium text-ocp-navy mb-1.5"
                >
                  {t("contact.message")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  className={`${inputClassName(errors.message)} resize-y`}
                  placeholder={t("contact.message")}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-ocp-green text-white rounded-xl text-sm font-semibold hover:bg-ocp-green-dark transition-colors shadow-lg shadow-ocp-green/20"
              >
                <Send size={16} />
                {t("contact.sendMessage")}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
