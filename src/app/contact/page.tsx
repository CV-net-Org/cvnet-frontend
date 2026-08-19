"use client";

import Link from "next/link";
import Image from "next/image";
import MarketingNav from "@/components/MarketingNav";
import ScrollToTop from "@/components/ScrollToTop";
import {
  Mail,
  MessageSquare,
  Building2,
  Phone,
  Send
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const currentYear = new Date().getFullYear();
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    // Mock API call
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <MarketingNav />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Get in <span className="text-blue-600">touch</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Whether you have a question about our enterprise features, need technical support, or just want to say hello — our team is ready to help.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          
          {/* Contact Info */}
          <div className="space-y-10">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">How can we help?</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                    <MessageSquare size={20} className="text-blue-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Sales</h3>
                  <p className="text-sm text-slate-500 mb-3">Learn more about our enterprise pricing and features.</p>
                  <a href="mailto:sales@cvnet.com" className="text-sm font-semibold text-blue-600 hover:text-blue-700">sales@cvnet.com</a>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                    <Mail size={20} className="text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">Support</h3>
                  <p className="text-sm text-slate-500 mb-3">Get help with your account or technical issues.</p>
                  <a href="mailto:support@cvnet.com" className="text-sm font-semibold text-blue-600 hover:text-blue-700">support@cvnet.com</a>
                </div>

              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Global Offices</h2>
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center">
                    <Building2 size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">San Francisco, CA</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      100 Innovation Drive, Suite 400<br />
                      San Francisco, CA 94103
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Phone size={14} />
                      <span>+1 (555) 123-4567</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-full bg-slate-50 flex items-center justify-center">
                    <Building2 size={20} className="text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">Colombo, Sri Lanka</h3>
                    <p className="text-sm text-slate-500 mb-2">
                      No. 45, Tech Avenue, Colombo 03<br />
                      Sri Lanka
                    </p>
                    <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                      <Phone size={14} />
                      <span>+94 11 234 5678</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10">
            {status === "success" ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
                  <Send size={32} className="text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                <p className="text-slate-500 mb-6">We've received your message and will get back to you within 24 hours.</p>
                <button 
                  onClick={() => setStatus("idle")}
                  className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h3>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-semibold text-slate-700">First Name</label>
                    <input required type="text" id="firstName" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" placeholder="Jane" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-semibold text-slate-700">Last Name</label>
                    <input required type="text" id="lastName" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" placeholder="Doe" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input required type="email" id="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all" placeholder="jane@company.com" />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-slate-700">Subject</label>
                  <select id="subject" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all bg-white">
                    <option>Sales Inquiry</option>
                    <option>Technical Support</option>
                    <option>Partnership</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-slate-700">Message</label>
                  <textarea required id="message" rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all resize-none" placeholder="How can we help you?"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={status === "submitting"}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {status === "submitting" ? (
                    <span className="animate-pulse">Sending...</span>
                  ) : (
                    <>Send Message <Send size={18} /></>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-14 px-4 sm:px-6 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.jpeg"
                alt="CVNet"
                width={28}
                height={28}
                className="rounded-md object-cover"
              />
              <span className="font-bold text-white text-lg">CVNet</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Empowering the world&apos;s best HR teams with data-driven
              recruitment intelligence and skill analysis.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/features"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Features
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>&copy; {currentYear} CVNet Inc. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
      <ScrollToTop />
    </div>
  );
}
