import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// LOCAL IMAGE MAPPING (imagenes/ folder)
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
- Pricing: Menus range from £50 to £100 per person. This covers ingredients and the chef's time. Travel and accommodation expenses are calculated separately based on distance.
- Allergies: For any dietary restriction mentioned, respond with absolute confidence: "That is no problem at all; we adapt swiftly to adjust the menu without sacrificing excellence."
- Logistics: The Chef can use the client's own tableware for a warmer feel or bring professional equipment if preferred. Always emphasize that the Chef ensures the kitchen is left impeccable (cleaning is included).
- Cancellations: A 20% deposit is required to secure the date. Full refund for 14+ days notice; 50% of the deposit for 7 days notice; non-refundable with less than 48h notice.
- Language: Respond in sophisticated British English.
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
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userMsg,
        config: { systemInstruction: SYSTEM_INSTRUCTION, temperature: 0.6 },
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "I apologize, but I encountered a technical difficulty. How else may I assist you?" }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Service temporarily unavailable. Please contact us at charliechef13@gmail.com." }]);
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
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed ${m.role === 'user' ? 'bg-gold text-white rounded-tr-none' : 'bg-white border text-charcoal shadow-sm rounded-tl-none'}`}>{m.text}</div>
              </div>
            ))}
            {loading && (
               <div className="flex justify-start">
                 <div className="bg-white border p-4 rounded-2xl rounded-tl-none shadow-sm text-xs italic text-charcoal/40 tracking-widest">Assistant is typing...</div>
               </div>
            )}
          </div>
          <div className="p-5 bg-white border-t flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="flex-1 text-xs outline-none px-4 py-3 bg-bone rounded-full" placeholder="Type your message..." />
            <button onClick={handleSend} className="text-gold font-bold text-xs uppercase tracking-widest">Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

const App = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormStatus('submitting');
    setTimeout(() => setFormStatus('success'), 1500); 
  };

  return (
    <div className="min-h-screen selection:bg-gold selection:text-white">
      <nav className={`fixed w-full z-40 transition-all duration-700 py-6 px-8 md:px-20 flex justify-between items-center ${isScrolled ? 'glass-nav py-4' : 'bg-transparent text-white'}`}>
        <div className="flex items-center gap-4">
          <img src={IMAGES.LOGO} className="h-10 w-auto" alt="Artesano Logo" />
          <h1 className={`font-serif text-2xl tracking-[0.4em] uppercase transition-colors duration-500 ${isScrolled ? 'text-charcoal' : 'text-white'}`}>Artesano</h1>
        </div>
        <div className={`hidden md:flex gap-12 text-[10px] font-bold tracking-[0.3em] uppercase items-center ${isScrolled ? 'text-charcoal' : 'text-white'}`}>
          <a href="#philosophy" className="hover:text-gold transition-colors">Philosophy</a>
          <a href="#menus" className="hover:text-gold transition-colors">Menus</a>
          <a href="#enquire" className="bg-gold text-white px-10 py-3 rounded-full hover:bg-olive transition-all transform hover:scale-105">Enquire</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="h-screen relative flex items-center justify-center text-white text-center">
        <div className="absolute inset-0 bg-charcoal">
          <img src={IMAGES.HERO} className="w-full h-full object-cover opacity-40" alt="Exquisite culinary creation" />
        </div>
        <div className="relative z-10 space-y-12 animate-fade-up">
          <p className="uppercase tracking-[0.8em] text-gold text-[10px] font-bold">Haute Mediterranean Cuisine</p>
          <h2 className="text-6xl md:text-8xl font-serif italic leading-tight">The Taste of <br/> Authenticity.</h2>
          <div className="flex justify-center pt-8">
            <div className="w-px h-24 bg-gold/50 animate-pulse"></div>
          </div>
        </div>
      </header>

      {/* Philosophy */}
      <section id="philosophy" className="py-40 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="relative group">
          <div className="absolute -inset-4 bg-gold/5 rounded-3xl blur-2xl group-hover:bg-gold/10 transition-all duration-700"></div>
          <img src={IMAGES.PHILOSOPHY} className="relative rounded-3xl shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-1000 object-cover w-full h-[600px]" alt="Chef profile" />
        </div>
        <div className="space-y-8 px-4">
          <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Our Philosophy</span>
          <h3 className="text-5xl font-serif text-charcoal leading-tight">Raw Ingredients <br/> & Respect.</h3>
          <p className="text-charcoal/60 text-lg leading-relaxed italic font-light">
            "My cuisine does not seek extravagance, but rather perfection in detail. I personally select every ingredient to create lasting memories directly at your table."
          </p>
          <p className="text-charcoal/40 text-sm leading-loose tracking-wide font-light">
            From the sun-drenched orchards to the morning catch of the day, every dish is a tribute to the Mediterranean spirit, refined for the most discerning palates.
          </p>
        </div>
      </section>

      {/* Menus */}
      <section id="menus" className="py-40 bg-[#F2F1EE] px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 space-y-4">
            <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">The Collection</span>
            <h3 className="text-5xl font-serif text-charcoal">Seasonal Experiences</h3>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: 'Essence', p: '£65', img: IMAGES.MENU_1, d: 'Local market selection and fresh garden produce.' },
              { n: 'Heritage', p: '£85', img: IMAGES.MENU_2, d: 'Modern technique meets classical Mediterranean roots.' },
              { n: 'Signature', p: '£100', img: IMAGES.MENU_3, d: 'Our exclusive 8-course curated tasting menu.' }
            ].map((m, i) => (
              <div key={i} className="bg-bone rounded-[3rem] overflow-hidden shadow-lg group hover:shadow-2xl transition-all duration-700 flex flex-col h-full">
                <div className="h-72 overflow-hidden relative">
                   <div className="absolute inset-0 bg-charcoal/20 group-hover:bg-charcoal/0 transition-all duration-700 z-10"></div>
                  <img src={m.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={m.n} />
                </div>
                <div className="p-12 text-center flex-1 flex flex-col justify-between">
                  <div>
                    <h5 className="font-serif text-3xl mb-4 group-hover:text-gold transition-colors">{m.n}</h5>
                    <p className="text-gold font-bold text-xl mb-4 tracking-widest">{m.p}</p>
                    <p className="text-[10px] uppercase tracking-widest text-charcoal/40 mb-8 leading-loose h-12 flex items-center justify-center">{m.d}</p>
                  </div>
                  <a href="#enquire" className="block py-4 border border-gold/30 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all transform group-hover:-translate-y-1">Request Experience</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Logistics */}
      <section className="py-40 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-12 order-2 md:order-1">
          <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Seamless Service</span>
          <h3 className="text-5xl font-serif text-charcoal">Control & Calm.</h3>
          <p className="text-charcoal/50 text-sm leading-relaxed tracking-wide font-light">
            We handle every detail. From the procurement of rare ingredients to the final restoration of your kitchen. You simply need to focus on your guests.
          </p>
          <div className="border-l border-gold/20 pl-8 space-y-6">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest font-bold text-charcoal">Impeccable Cleanliness</p>
              <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">The kitchen is left exactly as found.</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest font-bold text-charcoal">Versatile Tableware</p>
              <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">Professional equipment or your own fine china.</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-widest font-bold text-charcoal">Bespoke Hosting</p>
              <p className="text-[10px] text-charcoal/40 uppercase tracking-widest">Tailored pacing for your unique evening.</p>
            </div>
          </div>
        </div>
        <div className="relative order-1 md:order-2">
           <img src={IMAGES.LOGISTICS} className="rounded-3xl shadow-2xl h-[500px] w-full object-cover" alt="Service logistics" />
           <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border border-gold/10 bg-bone/80 backdrop-blur flex items-center justify-center text-center p-6 hidden md:flex">
              <p className="text-[8px] uppercase tracking-widest text-gold font-bold">Cleanliness <br/> Guaranteed</p>
           </div>
        </div>
      </section>

      {/* Contacto */}
      <section id="enquire" className="py-40 bg-charcoal text-white relative flex items-center min-h-[900px]">
        <div className="absolute inset-0 opacity-10">
          <img src={IMAGES.FORM_BG} className="w-full h-full object-cover" alt="Background pattern" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10 w-full px-6 text-center">
          {formStatus === 'success' ? (
            <div className="animate-fade-up space-y-8">
              <h3 className="text-5xl font-serif italic">Enquiry Received.</h3>
              <p className="opacity-50 uppercase tracking-widest text-xs leading-loose max-w-sm mx-auto">
                Chef Charlie will personally reach out to you within the next 24 hours to curate your experience.
              </p>
              <button onClick={() => setFormStatus('idle')} className="text-gold text-[10px] uppercase tracking-[0.4em] font-bold border-b border-gold pb-2">New Enquiry</button>
            </div>
          ) : (
            <form className="space-y-16" onSubmit={handleFormSubmit}>
              <div className="space-y-4">
                <span className="text-gold uppercase tracking-[0.4em] text-[10px] font-bold">Reservation</span>
                <h3 className="text-6xl font-serif italic">Secure Your Date.</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
                <div className="relative group">
                  <input required className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full text-xs tracking-widest uppercase transition-colors" placeholder="Name" />
                  <div className="absolute bottom-0 left-0 w-0 h-px bg-gold group-focus-within:w-full transition-all duration-500"></div>
                </div>
                <div className="relative group">
                  <input required type="email" className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full text-xs tracking-widest uppercase transition-colors" placeholder="Email" />
                   <div className="absolute bottom-0 left-0 w-0 h-px bg-gold group-focus-within:w-full transition-all duration-500"></div>
                </div>
              </div>
              <div className="relative group">
                <textarea className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full h-32 text-xs tracking-widest uppercase resize-none transition-colors" placeholder="Details of your event (Date, guests, preferences)..."></textarea>
                 <div className="absolute bottom-0 left-0 w-0 h-px bg-gold group-focus-within:w-full transition-all duration-500"></div>
              </div>
              <button disabled={formStatus === 'submitting'} className="w-full bg-gold py-8 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-charcoal transition-all duration-500 transform hover:-translate-y-1">
                {formStatus === 'submitting' ? 'Submitting...' : 'Send Enquiry'}
              </button>
              <p className="text-[8px] uppercase tracking-[0.3em] opacity-30 mt-8">By submitting, you agree to our 20% deposit policy for reservations.</p>
            </form>
          )}
        </div>
      </section>

      <footer className="py-24 text-center bg-bone">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
           <img src={IMAGES.LOGO} className="h-12 mx-auto grayscale opacity-50" alt="Artesano Monogram" />
           <div className="flex flex-wrap justify-center gap-12 text-[10px] uppercase tracking-[0.4em] font-bold text-charcoal/40">
             <a href="#philosophy" className="hover:text-gold transition-colors">Philosophy</a>
             <a href="#menus" className="hover:text-gold transition-colors">Menus</a>
             <a href="#enquire" className="hover:text-gold transition-colors">Enquire</a>
             <span className="hidden md:inline">|</span>
             <a href="mailto:charliechef13@gmail.com" className="hover:text-gold transition-colors">Contact</a>
           </div>
           <p className="text-[10px] uppercase tracking-[0.5em] opacity-20">&copy; 2024 ARTESANO | BESPOKE PRIVATE CHEF EXPERIENCE</p>
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