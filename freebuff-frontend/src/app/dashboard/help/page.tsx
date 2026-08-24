"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { HelpCircle, MessageCircle, Phone, Mail, Book, ChevronRight } from "lucide-react";

export default function HelpPage() {
  const faqs = [
    { question: "How do I register a new visitor?", answer: "Navigate to Visitors > Add Visitor and fill in the required information." },
    { question: "How do I approve a badge request?", answer: "Go to Approvals and click Approve on the pending request." },
    { question: "How do I access the site map?", answer: "Click on Site Map in the sidebar navigation." },
    { question: "How do I generate a report?", answer: "Go to Reports > Generate Report and select the report type." },
  ];

  return (
    <DashboardLayout title="Help & Support" subtitle="Get assistance with OCP eGuide">
      <div className="max-w-4xl space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: MessageCircle, title: "Live Chat", desc: "Chat with support team", color: "#00a050" },
            { icon: Phone, title: "Call Us", desc: "+212 5XX XXX XXX", color: "#3b82f6" },
            { icon: Mail, title: "Email", desc: "support@ocp.ma", color: "#f59e0b" },
          ].map((item) => (
            <button key={item.title} className="bg-white rounded-xl border border-ocp-border p-5 text-left card-hover">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: item.color + "15" }}>
                <item.icon size={20} style={{ color: item.color }} />
              </div>
              <h3 className="font-semibold text-ocp-navy text-sm">{item.title}</h3>
              <p className="text-xs text-ocp-gray-dark mt-1">{item.desc}</p>
            </button>
          ))}
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-xl border border-ocp-border p-6">
          <div className="flex items-center gap-3 mb-6">
            <Book size={20} className="text-ocp-green" />
            <h2 className="text-lg font-semibold text-ocp-navy">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <details key={i} className="group border border-ocp-border rounded-lg">
                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-ocp-gray transition-colors">
                  <span className="text-sm font-medium text-ocp-navy">{faq.question}</span>
                  <ChevronRight size={16} className="text-ocp-gray-dark group-open:rotate-90 transition-transform" />
                </summary>
                <div className="px-4 pb-3 text-sm text-ocp-gray-dark">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
