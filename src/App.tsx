/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, PenTool, Home, Ghost, Heart, Star, Upload, ChevronRight, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface Biography {
  id: string;
  name: string;
  subject: string;
  content: string;
  images: string[];
  videos: string[];
  collaborator?: string;
  createdAt: string;
}

// Components
function Button({ className, variant = "primary", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "outline" | "black" }) {
  const variants = {
    primary: "bento-button",
    secondary: "bento-button bg-bento-yellow text-bento-ink",
    outline: "bento-button bg-white text-bento-ink",
    black: "bento-button-black",
  };
  return (
    <button
      className={cn(variants[variant], className)}
      {...props}
    />
  );
}

function Card({ children, className, variant = "default" }: { children: React.ReactNode; className?: string; variant?: "default" | "yellow" | "dark" | "emerald" }) {
  const variants = {
    default: "bento-card",
    yellow: "bento-card-yellow",
    dark: "bento-card-dark",
    emerald: "bento-card bg-bento-emerald",
  };
  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

// Pages
function HomePage() {
  const [bios, setBios] = useState<Biography[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/bios")
      .then(res => res.json())
      .then(data => {
        setBios(data);
        setLoading(false);
      });
  }, []);

  const filteredBios = (bios || []).filter(bio => {
    const nameMatch = (bio.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = (bio.subject || "").toLowerCase().includes(searchQuery.toLowerCase());
    const contentMatch = (bio.content || "").toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || subjectMatch || contentMatch;
  });

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-8 font-sans">
      <header className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-bento-accent rounded-lg flex items-center justify-center text-white font-black text-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] border-2 border-bento-ink">B</div>
          <span className="text-3xl font-black tracking-tighter">bio.licious.us</span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-bold items-center">
          <Link to="/" className="text-bento-accent border-b-4 border-bento-accent pb-1">My Archive</Link>
          <a href="#" className="text-neutral-500 hover:text-bento-ink transition-colors">Inspiration</a>
          <Link to="/create">
            <Button variant="black" className="ml-4">Start New Biography</Button>
          </Link>
        </nav>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]">
        {/* Main Hero Card */}
        <Card className="md:col-span-2 md:row-span-2 flex flex-col justify-center relative overflow-hidden group">
          <div className="relative z-10">
            <span className="text-xs font-black uppercase tracking-widest text-bento-accent mb-3 block">Welcome back</span>
            <h1 className="text-5xl font-serif font-black mb-6 leading-[0.9] italic">The Archive of Human Stories.</h1>
            <p className="text-neutral-600 text-lg leading-relaxed max-w-sm font-medium">
              Preserve memories in a beautiful bento-style grid. Your legacy, organized.
            </p>
            <div className="mt-8">
              <Link to="/create">
                <Button>Create a Legacy</Button>
              </Link>
            </div>
          </div>
          <motion.div 
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute -bottom-12 -right-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"
          >
            <BookOpen size={300} />
          </motion.div>
        </Card>

        {/* Search Card */}
        <Card className="md:col-span-1 md:row-span-1 flex flex-col justify-between">
           <div className="text-xs uppercase tracking-widest text-neutral-400 font-bold mb-2">Search Library</div>
           <div className="relative">
             <input 
               id="search-bios"
               type="text" 
               placeholder="Find a soul..."
               className="w-full bg-bento-bg border-2 border-bento-ink rounded-xl p-3 pl-10 focus:outline-none focus:ring-4 focus:ring-bento-accent/10 font-bold text-sm"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
             <div className="absolute left-3 top-3 text-bento-ink/50">
               <BookOpen size={16} />
             </div>
           </div>
           <p className="text-[10px] text-neutral-400 font-bold italic mt-2">
             {filteredBios.length === 0 ? "Nothing found..." : `Showing ${filteredBios.length} results`}
           </p>
        </Card>

        {/* Action Card - Yellow */}
        <Card variant="yellow" className="md:col-span-1 md:row-span-1 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 bg-white border-2 border-black rounded-xl flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] transition-transform">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="font-black text-xl leading-tight">Shared Artifacts</h3>
            <p className="text-sm text-neutral-800 font-medium">{bios.length} stories chronicled.</p>
          </div>
        </Card>

        {/* Bio Cards */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="md:col-span-1 md:row-span-1 bg-white/50 border-2 border-dashed border-neutral-300 rounded-[2rem] animate-pulse" />
          ))
        ) : (
          filteredBios.map((bio, index) => (
            <motion.div
              key={bio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="md:col-span-1 md:row-span-1"
            >
              <Link to={`/bio/${bio.id}`} className="block h-full">
                <Card className="h-full flex flex-col justify-between p-5 group">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black italic leading-tight group-hover:text-bento-accent transition-colors">{bio.name}</h3>
                    <ChevronRight size={20} className="text-neutral-300 group-hover:text-bento-ink transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tighter text-neutral-400 truncate mb-1">
                      {bio.subject}
                    </p>
                    <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">
                      {new Date(bio.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))
        )}

        {/* Stats Card - Dark */}
        <Card variant="dark" className="md:col-span-1 md:row-span-1 flex flex-col justify-between order-last md:order-none">
          <p className="text-xs uppercase tracking-widest text-neutral-400 font-bold">Collaborators</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex -space-x-3">
              <div className="w-8 h-8 rounded-full border-2 border-bento-ink bg-indigo-200"></div>
              <div className="w-8 h-8 rounded-full border-2 border-bento-ink bg-emerald-200"></div>
              <div className="w-8 h-8 rounded-full border-2 border-bento-ink bg-yellow-200 flex items-center justify-center text-[10px] font-black text-bento-ink">+</div>
            </div>
            <span className="text-xs font-bold text-neutral-400">Invite Family</span>
          </div>
        </Card>

        {/* Inspiration/Quote Card */}
        <Card variant="emerald" className="md:col-span-2 md:row-span-1 flex items-center gap-8">
           <div className="text-8xl text-emerald-200/50 font-serif leading-none select-none">“</div>
           <div className="pr-8">
             <p className="text-2xl italic font-serif text-neutral-700 leading-tight mb-3">
               Every life is a masterpiece waiting to be told.
             </p>
             <p className="text-xs font-black text-neutral-400 uppercase tracking-widest">— Editorial Prompt</p>
           </div>
        </Card>
      </div>
    </div>
  );
}

function CreatePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    collaborator: "",
    images: [] as string[],
    videos: [] as string[],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (file.type.startsWith("image/")) {
        setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      } else {
        setFormData(prev => ({ ...prev, videos: [...prev.videos, data.url] }));
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const generateBio = async () => {
    if (!formData.name || !formData.subject) return;
    setIsGenerating(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        alert("GEMINI_API_KEY is not defined. Please set it in your environment variables to use AI features.");
        setIsGenerating(false);
        return;
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Subject Name: ${formData.name}. Relation/Topic: ${formData.subject}. Write a 300-word introduction to their biography.`,
        config: {
          systemInstruction: "You are an elite biographer. Write a professional, moving, and descriptive biography section based on the details provided. Use a narrative, elegant style.",
        }
      });
      setFormData(prev => ({ ...prev, content: prev.content + "\n\n" + response.text }));
    } catch (err) {
      console.error("AI Generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveBio = async () => {
    if (!formData.name || !formData.content) return;
    
    try {
      const res = await fetch("/api/bios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to save biography");
      navigate("/");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save biography. Please try again.");
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-8 py-12 font-sans">
      <div className="mb-12 flex justify-between items-end">
        <div>
          <Link to="/" className="text-bento-accent hover:underline flex items-center gap-1 font-black text-xs uppercase tracking-widest mb-4">
            <ChevronRight size={14} className="rotate-180" /> Back to Archive
          </Link>
          <h1 className="text-5xl italic font-black leading-tight">Draft a Legacy</h1>
        </div>
        <div className="hidden md:block w-24 h-24 bg-bento-yellow rounded-full border-2 border-bento-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center rotate-12">
           <PenTool className="text-bento-ink" size={32} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <Card className="p-0 overflow-hidden">
            <div className="bg-bento-ink text-white p-4 font-black uppercase text-xs tracking-widest flex justify-between items-center">
               <span>1. Core Details</span>
               <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-red-400"></div>
                 <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                 <div className="w-2 h-2 rounded-full bg-green-400"></div>
               </div>
            </div>
            <div className="p-8 space-y-6">
              <input
                id="bio-name-input"
                type="text"
                placeholder="Full Name of Subject"
                className="w-full bg-bento-bg border-2 border-bento-ink rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-bento-accent/10 font-serif text-3xl italic font-black"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  id="bio-subject-input"
                  type="text"
                  placeholder="Relationship / Description"
                  className="w-full bg-bento-bg border-2 border-bento-ink rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-bento-accent/10 font-bold"
                  value={formData.subject}
                  onChange={e => setFormData({ ...formData, subject: e.target.value })}
                />
                <input
                  id="bio-collaborator-input"
                  type="text"
                  placeholder="Your Name (Collaborator)"
                  className="w-full bg-bento-bg border-2 border-bento-ink rounded-xl p-4 focus:outline-none focus:ring-4 focus:ring-bento-accent/10 font-bold"
                  value={formData.collaborator}
                  onChange={e => setFormData({ ...formData, collaborator: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="bg-bento-ink text-white p-4 font-black uppercase text-xs tracking-widest flex justify-between items-center">
               <span>2. The Narrative</span>
               <Button
                variant="secondary"
                className="py-1 px-3 text-[10px] m-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] uppercase tracking-tighter"
                onClick={generateBio}
                disabled={isGenerating || !formData.name}
              >
                {isGenerating ? "Consulting Spirits..." : "Gemini AI Assist"}
              </Button>
            </div>
            <textarea
              placeholder="Start chronicling their journey..."
              className="w-full h-96 p-8 focus:outline-none font-serif text-xl leading-relaxed resize-none bg-white"
              value={formData.content}
              onChange={e => setFormData({ ...formData, content: e.target.value })}
            />
          </Card>
        </div>

        <div className="space-y-8">
           <Card className="p-0 overflow-hidden h-fit">
              <div className="bg-bento-accent text-white p-4 font-black uppercase text-xs tracking-widest">
                 3. Artifacts
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {formData.images.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-bento-ink shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {formData.videos.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-bento-ink flex items-center justify-center text-white border-2 border-bento-ink shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <VideoIcon />
                    </div>
                  ))}
                  <label className="aspect-square rounded-xl border-2 border-dashed border-bento-ink/20 flex flex-col items-center justify-center cursor-pointer hover:bg-bento-accent/5 transition-colors group">
                    <Upload className="text-bento-accent mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase text-bento-accent">Add media</span>
                    <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                  </label>
                </div>
                <p className="text-[10px] text-neutral-400 font-bold uppercase text-center italic">Supported: JPG, PNG, MP4</p>
              </div>
           </Card>

           <div className="pt-4">
             <Button 
               className="w-full py-6 text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
               onClick={saveBio} 
               disabled={!formData.name || !formData.content}
             >
               Finalize Archive
             </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

function BioPage() {
  const { id } = useParams<{ id: string }>();
  const [bio, setBio] = useState<Biography | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("/api/bios")
      .then(res => res.json())
      .then((data: Biography[]) => {
        const found = data.find(b => b.id === id);
        setBio(found || null);
      });
  }, [id]);

  if (!bio) return (
    <div className="p-24 text-center">
      <div className="font-black uppercase text-neutral-300 tracking-[0.2em] mb-8 animate-pulse text-2xl">Entry Not Found in Archive</div>
      <Link to="/">
        <Button variant="black">Return to Library</Button>
      </Link>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-12 font-sans">
      <Link to="/" className="text-bento-accent hover:underline flex items-center gap-1 font-black text-xs uppercase tracking-widest mb-12">
        <ChevronRight size={14} className="rotate-180" /> My Archive
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6">
           <Card variant="dark">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Subject</span>
              <h2 className="text-3xl font-serif italic mb-4 leading-tight">{bio.name}</h2>
              <div className="h-0.5 bg-neutral-800 w-full mb-4"></div>
              <p className="text-sm text-neutral-400 font-medium mb-1 uppercase tracking-tighter">Relation</p>
              <p className="text-lg font-bold mb-4">{bio.subject}</p>
              {bio.collaborator && (
                <>
                  <p className="text-sm text-neutral-400 font-medium mb-1 uppercase tracking-tighter">Collaborator</p>
                  <p className="text-lg font-bold mb-4">{bio.collaborator}</p>
                </>
              )}
              <p className="text-[10px] text-neutral-400 font-bold tracking-widest">{new Date(bio.createdAt).toDateString()}</p>
           </Card>

           {bio.images.length > 0 && (
             <div className="grid grid-cols-2 gap-3">
               {bio.images.map((img, i) => (
                 <div key={i} className="aspect-square rounded-2xl border-2 border-bento-ink overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <img src={img} className="w-full h-full object-cover" />
                 </div>
               ))}
             </div>
           )}
        </aside>

        <article className="md:col-span-3 space-y-8">
           <Card className="p-12 min-h-[600px] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-bento-accent"></div>
              <div className="absolute top-8 right-8 text-6xl text-neutral-50 font-serif font-black select-none opacity-50">HISTORY</div>
              <div className="relative z-10 prose prose-2xl max-w-none">
                <div className="whitespace-pre-wrap font-serif text-2xl leading-relaxed text-bento-ink italic first-letter:text-6xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-bento-accent">
                  {bio.content}
                </div>
              </div>
           </Card>

           {bio.videos.length > 0 && (
             <div className="space-y-4">
                <h3 className="font-black uppercase tracking-widest text-xs text-neutral-400">Media Archives</h3>
                {bio.videos.map((vid, i) => (
                  <div key={i}>
                    <Card className="p-0 overflow-hidden border-4">
                      <video controls className="w-full h-auto">
                        <source src={vid} />
                      </video>
                    </Card>
                  </div>
                ))}
             </div>
           )}
        </article>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/bio/:id" element={<BioPage />} />
          </Routes>
        </AnimatePresence>
      </div>
    </BrowserRouter>
  );
}
