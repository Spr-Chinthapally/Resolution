import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  UploadCloud,
  Ruler,
  Wand2,
  Building2,
  Flag,
  Image as ImageIcon,
  Store,
  Presentation,
  Sparkles,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const USE_CASES = [
  { icon: Building2, label: "Billboards" },
  { icon: Flag, label: "Banners" },
  { icon: ImageIcon, label: "Posters" },
  { icon: Store, label: "Signs" },
  { icon: Presentation, label: "Trade Show Displays" },
  { icon: Sparkles, label: "AI Artwork" },
];

const STEPS = [
  { icon: UploadCloud, n: "1", title: "Upload", desc: "Upload your image or artwork." },
  { icon: Ruler, n: "2", title: "Set Print Size", desc: "Tell us how large you want to print it." },
  { icon: Wand2, n: "3", title: "Enhance", desc: "Prepare the image for large-format printing." },
];

const FAQ = [
  {
    q: "How much resolution do I really need?",
    a: "It depends on the final print size and how close viewers will stand. A billboard viewed from far away needs far fewer pixels-per-inch than a poster viewed up close. LargePrint AI calculates a recommended target for you.",
  },
  {
    q: "What does the enhancement do?",
    a: "It prepares your image for the required print resolution while preserving the original composition. It cannot invent detail that was never in the source — a higher-resolution original always prints better.",
  },
  {
    q: "Which files are supported?",
    a: "JPG, JPEG, PNG and WEBP for this version. TIFF, PDF and CMYK output are on the roadmap.",
  },
];

const SAMPLE_BILLBOARD =
  "https://images.unsplash.com/photo-1560196327-cca0a731441b?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxsYXJnZSUyMGZvcm1hdCUyMHByaW50aW5nJTIwYmlsbGJvYXJkJTIwYmFubmVyJTIwdHJhZGUlMjBzaG93JTIwcG9zdGVyfGVufDB8fHx8MTc4OTY1NDk1Mnww&ixlib=rb-4.1.0&q=85";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="lp-fade-up">
              <span className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-3 py-1">
                <Gauge className="h-3.5 w-3.5" />
                Large-Format Print Preparation
              </span>
              <h1 className="mt-6 font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.05]">
                Make Any Image Ready for Large-Format Printing
              </h1>
              <p className="mt-6 text-lg text-slate-600 leading-relaxed max-w-xl">
                Upload your photo, artwork, or AI-generated image. Enter your desired print size and
                LargePrint AI calculates the resolution you need and prepares your image for banners,
                billboards, posters, signs, and displays.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => navigate("/app")}
                  className="h-12 px-7 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-base font-semibold"
                  data-testid="hero-upload-cta"
                >
                  <UploadCloud className="mr-2 h-5 w-5" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                  className="h-12 px-7 rounded-lg border-slate-300 text-slate-700 hover:bg-slate-50 text-base font-medium"
                  data-testid="hero-how-cta"
                >
                  See How It Works
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="lp-fade-up" style={{ animationDelay: "0.1s" }}>
              <div className="relative rounded-2xl border border-slate-200 bg-slate-100 overflow-hidden shadow-xl">
                <img src={SAMPLE_BILLBOARD} alt="Large-format billboard" className="w-full h-[380px] object-cover" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl bg-white/95 backdrop-blur border border-slate-200 px-4 py-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Target</div>
                    <div className="font-mono font-bold text-slate-900">12,000 × 6,000 px</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Print</div>
                    <div className="font-mono font-bold text-slate-900">20 × 10 ft</div>
                  </div>
                  <div className="h-8 w-px bg-slate-200" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Target PPI</div>
                    <div className="font-mono font-bold text-sky-700">50 PPI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section id="use-cases" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-center font-heading text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
          Built for every large-format job
        </h2>
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {USE_CASES.map((c) => (
            <div
              key={c.label}
              className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col items-center text-center hover:shadow-md hover:border-sky-200 transition-all duration-200"
              data-testid={`use-case-${c.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <div className="h-11 w-11 rounded-lg bg-sky-50 flex items-center justify-center mb-3">
                <c.icon className="h-5 w-5 text-sky-600" strokeWidth={1.9} />
              </div>
              <span className="text-sm font-medium text-slate-700">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-mono uppercase tracking-widest text-sky-600">How It Works</span>
            <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900">
              Three simple steps to print-ready
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <div key={s.n} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-8">
                <div className="absolute top-6 right-6 font-mono text-5xl font-bold text-slate-100">{s.n}</div>
                <div className="h-12 w-12 rounded-xl bg-sky-600 flex items-center justify-center">
                  <s.icon className="h-6 w-6 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="mt-5 font-heading text-xl font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-sky-600">Resolution Guide</span>
          <h2 className="mt-3 font-heading text-2xl sm:text-4xl font-semibold tracking-tight text-slate-900">
            Understanding print resolution
          </h2>
        </div>
        <div className="mt-10 space-y-4">
          {FAQ.map((f, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6">
              <h3 className="font-heading text-lg font-semibold text-slate-900">{f.q}</h3>
              <p className="mt-2 text-slate-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-slate-900 p-10 text-center">
          <h3 className="font-heading text-2xl sm:text-3xl font-semibold text-white">Ready to prepare your image?</h3>
          <p className="mt-3 text-slate-300">Upload an image and see your resolution requirements in seconds.</p>
          <Button
            onClick={() => navigate("/app")}
            className="mt-6 h-12 px-8 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-base font-semibold"
            data-testid="footer-cta"
          >
            <UploadCloud className="mr-2 h-5 w-5" />
            Upload Image
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
