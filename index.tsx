import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// Images are served from the /public folder in Vite/Vercel
const IMAGES = {
  LOGO: "imagenes/Logo-definitivo.png",
  HERO: "imagenes/Tournedo-de-rabo-de-toro.jpg",
  PHILOSOPHY: "imagenes/Foto-de-perfil.jpg",
  LOGISTICS: "imagenes/Canelon-con-salsa-ligera.jpg",
  FORM_BG: "imagenes/Aperitivos-glaseados.jpg",
  MENU_1: "imagenes/Gambones-con-mango-y-aguacate.jpg",
  MENU_2: "imagenes/Carrillera-glaseada.jpg",
  MENU_3: "imagenes/Pastel-de-chocolate.jpg",
  SECONDARY: "imagenes/Bacalao-con-ratatouille.jpg"
};

const SYSTEM_INSTRUCTION = `
Act as the Concierge for Artesano, a luxury bespoke Private Chef service specializing in Spanish and Mediterranean haute cuisine.
Personality: Polite, passionate, calm, and highly professional. Convey a sense of "everything is under control."
STRICT RULES:
- Pricing: Menus range from £50 to £100 per person. This covers ingredients and the chef's time. Travel/accommodation extra based on distance.
- Allergies: Respond with: "That is no problem at all; we adapt swiftly to adjust the menu without sacrificing excellence."
- Logistics: Chef can use client's tableware or bring professional gear. Chef leaves the kitchen impeccable (cleaning included).
- Cancellations: 20% deposit. Full refund (14+ days), 50% deposit (7 days), non-refundable (<48h).
- Language: British English.
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'model', text: 'Welcome to Artesano. How may I assist you with your bespoke dining experience today?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Using simpler structure to avoid 400 Bad Request
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: { 
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7 
        },
      });
      
      const text = response.text;
      setMessages(prev => [...prev, { role: 'model', text: text || "I am at your service. How else can I help?" }]);
    } catch (e: any) {
      console.error("Gemini Error:", e);
      setMessages(prev => [...prev, { role: 'model', text: "My apologies, I am currently attending to another guest. Please contact us at charliechef13@gmail.com for immediate assistance." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-gold text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all focus:outline-none">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      ) : (
        <div className="bg-bone w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl flex flex-col border border-gold/10 overflow-hidden animate-fade-up">
          <div className="bg-charcoal p-5 text-bone flex justify-between items-center italic">
            <span className="font-serif">Artesano Concierge</span>
            <button onClick={() => setIsOpen(false)} className="text-2xl leading-none">&times;</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-bone/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${m.role === 'user' ? 'bg-gold text-white rounded-tr-none shadow-md' : 'bg-white border text-charcoal shadow-sm rounded-tl-none'}`}>{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border p-3 rounded-2xl rounded-tl-none shadow-sm text-[10px] italic text-gold/60">Chef is thinking...</div>
              </div>
            )}
          </div>
          <div className="p-5 bg-white border-t flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="flex-1 text-xs outline-none px-4 py-3 bg-bone rounded-full border border-gold/5 focus:border-gold/30 transition-colors" placeholder="Type your inquiry..." />
            <button onClick={handleSend} className="text-gold font-bold text-xs uppercase tracking-widest px-2">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => setFormStatus('success'), 1500);
  };

  return (
    <div className="min-h-screen selection:bg-gold selection:text-white bg-bone">
      {/* Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-700 py-6 px-8 md:px-20 flex justify-between items-center ${isScrolled ? 'glass-nav py-4' : 'bg-transparent text-white'}`}>
        <div className="flex items-center gap-4">
          <img src={IMAGES.LOGO} className="h-10 w-auto" alt="Artesano Monogram" />
          <h1 className={`font-serif text-2xl tracking-[0.4em] uppercase transition-colors ${isScrolled ? 'text-charcoal' : 'text-white'}`}>Artesano</h1>
        </div>
        <div className={`hidden md:flex gap-12 text-[10px] font-bold tracking-[0.3em] uppercase items-center ${isScrolled ? 'text-charcoal' : 'text-white'}`}>
          <a href="#philosophy" className="hover:text-gold transition-colors">Philosophy</a>
          <a href="#menus" className="hover:text-gold transition-colors">Menus</a>
          <a href="#enquire" className="bg-gold text-white px-10 py-3 rounded-full hover:bg-olive transition-all transform hover:scale-105">Enquire</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="h-screen relative flex items-center justify-center text-white text-center">
        <div className="absolute inset-0 bg-charcoal overflow-hidden">
          <img src={IMAGES.HERO} className="w-full h-full object-cover opacity-50 scale-105 animate-[pulse_10s_infinite_alternate]" alt="Haute Cuisine" />
        </div>
        <div className="relative z-10 space-y-12 animate-fade-up px-4">
          <p className="uppercase tracking-[0.8em] text-gold text-[10px] font-bold">Haute Mediterranean Cuisine</p>
          <h2 className="text-6xl md:text-8xl font-serif italic leading-tight">The Art of <br/> Fine Dining.</h2>
          <div className="flex justify-center pt-8">
            <div className="w-px h-24 bg-gold/50"></div>
          </div>
        </div>
      </header>

      {/* Philosophy Section */}
      <section id="philosophy" className="py-40 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gold/5 blur-2xl rounded-3xl transition-all group-hover:bg-gold/10"></div>
          <img src={IMAGES.PHILOSOPHY} className="relative rounded-3xl shadow-2xl object-cover w-full h-[600px] grayscale-[0.3] hover:grayscale-0 transition-all duration-1000" alt="The Chef" />
        </div>
        <div className="space-y-8 px-4">
          <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">The Vision</span>
          <h3 className="text-5xl font-serif text-charcoal leading-tight">Respect for <br/> the Ingredient.</h3>
          <p className="text-charcoal/60 text-lg leading-relaxed italic font-light">
            "My cuisine does not seek extravagance, but rather the perfection of the simple. Every dish tells a story of the soil and the sea."
          </p>
          <p className="text-charcoal/40 text-sm leading-loose tracking-wide font-light">
            Each experience is curated personally, ensuring that every flavour is authentic and every moment is unforgettable.
          </p>
        </div>
      </section>

      {/* Menus Section */}
      <section id="menus" className="py-40 bg-[#F2F1EE] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">The Collection</span>
            <h3 className="text-5xl font-serif text-charcoal">Curated Tasting Menus</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: 'Essence', p: 'From £65', img: IMAGES.MENU_1, d: 'Focusing on seasonal market treasures.' },
              { n: 'Heritage', p: 'From £85', img: IMAGES.MENU_2, d: 'A journey through classical Mediterranean roots.' },
              { n: 'Signature', p: 'From £100', img: IMAGES.MENU_3, d: 'The Chef\'s ultimate 8-course curated selection.' }
            ].map((m, i) => (
              <div key={i} className="bg-bone rounded-[3rem] overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-700 flex flex-col h-full">
                <div className="h-80 overflow-hidden relative">
                  <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-transparent transition-all duration-700 z-10"></div>
                  <img src={m.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={m.n} />
                </div>
                <div className="p-12 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif text-3xl mb-4 group-hover:text-gold transition-colors">{m.n}</h5>
                    <p className="text-gold font-bold text-xl mb-4 tracking-widest">{m.p}</p>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 mb-8 leading-relaxed h-10">{m.d}</p>
                  </div>
                  <a href="#enquire" className="block py-4 border border-gold/30 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all transform group-hover:-translate-y-1 shadow-sm">Reserve Experience</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics Section */}
      <section className="py-40 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-12 order-2 md:order-1">
          <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Private Logistics</span>
          <h3 className="text-5xl font-serif text-charcoal leading-tight">Discretion <br/> & Excellence.</h3>
          <p className="text-charcoal/50 text-sm leading-relaxed tracking-wide font-light">
            We manage the entire process, from sourcing the finest ingredients to leaving your kitchen in pristine condition.
          </p>
          <ul className="space-y-4 text-[10px] uppercase tracking-[0.2em] text-charcoal/60 font-medium">
            <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-gold rounded-full"></span> Impeccable Post-Service Cleaning</li>
            <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-gold rounded-full"></span> Professional Grade Equipment Provided</li>
            <li className="flex items-center gap-4"><span className="w-1.5 h-1.5 bg-gold rounded-full"></span> Bespoke Table Setting & Styling</li>
          </ul>
        </div>
        <div className="order-1 md:order-2">
           <img src={IMAGES.LOGISTICS} className="rounded-3xl shadow-2xl h-[550px] w-full object-cover" alt="Service Logistics" />
        </div>
      </section>

      {/* Enquiry Form */}
      <section id="enquire" className="py-40 bg-charcoal text-white relative flex items-center min-h-[800px]">
        <div className="absolute inset-0 opacity-10">
          <img src={IMAGES.FORM_BG} className="w-full h-full object-cover" alt="Background Texture" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10 w-full px-6 text-center">
          {formStatus === 'success' ? (
            <div className="space-y-8 animate-fade-up">
              <h3 className="text-5xl font-serif italic">Inquiry Sent.</h3>
              <p className="opacity-50 text-xs uppercase tracking-widest">Chef Charlie will personally contact you shortly.</p>
              <button onClick={() => setFormStatus('idle')} className="text-gold text-[10px] uppercase tracking-widest border-b border-gold pb-1 mt-4">Send another enquiry</button>
            </div>
          ) : (
            <form className="space-y-16" onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Reservations</span>
                <h3 className="text-6xl font-serif italic">Secure Your Date.</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <input required className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full text-xs uppercase tracking-widest transition-all" placeholder="Full Name" />
                <input required type="email" className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full text-xs uppercase tracking-widest transition-all" placeholder="Email Address" />
              </div>
              <textarea required className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full h-32 text-xs uppercase tracking-widest resize-none transition-all" placeholder="Tell us about your event..."></textarea>
              <button className="w-full bg-gold py-8 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-charcoal transition-all duration-500 shadow-xl transform hover:-translate-y-1">
                {formStatus === 'submitting' ? 'Submitting Inquiry...' : 'Send Inquiry'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-24 text-center bg-bone border-t border-gold/5">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <img src={IMAGES.LOGO} className="h-12 mx-auto grayscale opacity-40 mb-8" alt="Artesano" />
          <div className="flex justify-center gap-12 text-[10px] uppercase tracking-[0.3em] font-bold text-charcoal/40">
            <a href="#philosophy" className="hover:text-gold transition-colors">Philosophy</a>
            <a href="#menus" className="hover:text-gold transition-colors">Menus</a>
            <a href="mailto:charliechef13@gmail.com" className="hover:text-gold transition-colors">Contact</a>
          </div>
          <p className="text-[10px] uppercase tracking-[0.5em] opacity-20">&copy; 2024 ARTESANO | LUXURY PRIVATE DINING</p>
        </div>
      </footer>
      <Chatbot />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}