import React, { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// MAPEO DE IMÁGENES LOCALES (Carpeta imagenes/)
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
Actúa como el Concierge de Artesano, el servicio de Chef Privado de lujo.
Personalidad: Asistente educado, apasionado y calmado. Transmite control total.
REGLAS:
- Precios: 50-100 GBP/persona. Cubre comida y tiempo; desplazamientos aparte.
- Alergias: "No hay ningún problema, nos adaptamos rápidamente para ajustar el menú sin sacrificar la excelencia".
- Logística: Uso de menaje propio o del cliente. Limpieza impecable incluida.
- Cancelaciones: 20% depósito. Reembolso total (14+ días), 50% (7 días), no reembolsable (<48h).
`;

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'model', text: 'Bienvenido a Artesano. ¿Cómo puedo ayudarle con su reserva hoy?' }]);
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
      setMessages(prev => [...prev, { role: 'model', text: response.text || "Lo lamento, hubo un error técnico." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Servicio no disponible. Contacte a charliechef13@gmail.com." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!isOpen ? (
        <button onClick={() => setIsOpen(true)} className="bg-gold text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-all">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        </button>
      ) : (
        <div className="bg-bone w-80 md:w-96 h-[500px] rounded-3xl shadow-2xl flex flex-col border border-gold/10 overflow-hidden animate-fade-up">
          <div className="bg-charcoal p-5 text-bone flex justify-between items-center italic">Concierge Artesano <button onClick={() => setIsOpen(false)}>&times;</button></div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-[85%] text-xs ${m.role === 'user' ? 'bg-gold text-white rounded-tr-none' : 'bg-white border text-charcoal shadow-sm rounded-tl-none'}`}>{m.text}</div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-white border-t flex gap-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} className="flex-1 text-xs outline-none px-4 py-3 bg-bone rounded-full" placeholder="Su mensaje..." />
            <button onClick={handleSend} className="text-gold font-bold">Enviar</button>
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
    setTimeout(() => setFormStatus('success'), 1500); // Simulación para el ejemplo
  };

  return (
    <div className="min-h-screen">
      <nav className={`fixed w-full z-40 transition-all duration-700 py-6 px-8 md:px-20 flex justify-between items-center ${isScrolled ? 'glass-nav py-4' : 'bg-transparent text-white'}`}>
        <div className="flex items-center gap-4">
          <img src={IMAGES.LOGO} className="h-10" alt="Artesano Logo" />
          <h1 className="font-serif text-2xl tracking-[0.4em] uppercase">Artesano</h1>
        </div>
        <div className="hidden md:flex gap-12 text-[10px] font-bold tracking-[0.3em] uppercase items-center">
          <a href="#philosophy">Filosofía</a><a href="#menus">Menús</a><a href="#enquire" className="bg-gold text-white px-10 py-3 rounded-full">Reserva</a>
        </div>
      </nav>

      {/* Hero */}
      <header className="h-screen relative flex items-center justify-center text-white text-center">
        <div className="absolute inset-0 bg-charcoal">
          <img src={IMAGES.HERO} className="w-full h-full object-cover opacity-40" alt="Main Dish" />
        </div>
        <div className="relative z-10 space-y-12 animate-fade-up">
          <p className="uppercase tracking-[0.8em] text-gold text-[10px] font-bold">Alta Cocina Mediterránea</p>
          <h2 className="text-6xl md:text-8xl font-serif italic">El Sabor de <br/> lo Auténtico.</h2>
        </div>
      </header>

      {/* Filosofía */}
      <section id="philosophy" className="py-40 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <img src={IMAGES.PHILOSOPHY} className="rounded-3xl shadow-2xl grayscale-[0.2] hover:grayscale-0 transition-all duration-700" alt="Chef Charlie" />
        <div className="space-y-8">
          <h3 className="text-5xl font-serif text-charcoal leading-tight">Materia Prima <br/> y Respeto.</h3>
          <p className="text-charcoal/60 text-lg leading-relaxed italic">
            "Mi cocina no busca la estridencia, sino la perfección en el detalle. Selecciono personalmente cada ingrediente para crear memorias en su propia mesa."
          </p>
        </div>
      </section>

      {/* Menús */}
      <section id="menus" className="py-40 bg-[#F2F1EE] px-6">
        <h3 className="text-center text-5xl font-serif mb-24">Experiencias de Temporada</h3>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          {[
            { n: 'Esencia', p: '£65', img: IMAGES.MENU_1, d: 'Producto de lonja y huerto local.' },
            { n: 'Herencia', p: '£85', img: IMAGES.MENU_2, d: 'Técnica moderna, raíces clásicas.' },
            { n: 'Firma', p: '£100', img: IMAGES.MENU_3, d: 'Nuestro menú degustación de 8 pasos.' }
          ].map((m, i) => (
            <div key={i} className="bg-bone rounded-[3rem] overflow-hidden shadow-lg group hover:shadow-2xl transition-all">
              <div className="h-64 overflow-hidden">
                <img src={m.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={m.n} />
              </div>
              <div className="p-12 text-center">
                <h5 className="font-serif text-3xl mb-4">{m.n}</h5>
                <p className="text-gold font-bold text-xl mb-4 tracking-widest">{m.p}</p>
                <p className="text-[10px] uppercase tracking-widest text-charcoal/40 mb-8 leading-loose">{m.d}</p>
                <a href="#enquire" className="block py-4 border border-gold/30 text-gold rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-gold hover:text-white transition-all">Solicitar</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Logística */}
      <section className="py-40 px-6 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
        <div className="space-y-12">
          <h3 className="text-5xl font-serif text-charcoal">Control y Calma.</h3>
          <p className="text-charcoal/50 text-sm leading-relaxed tracking-wide">
            Nos encargamos de todo. Desde la compra selecta hasta la limpieza final. Usted solo debe preocuparse de disfrutar con sus invitados.
          </p>
          <div className="border-l border-gold/20 pl-8 space-y-4">
            <p className="text-xs uppercase tracking-widest font-bold">● Limpieza Impecable</p>
            <p className="text-xs uppercase tracking-widest font-bold">● Vajilla Adaptable</p>
            <p className="text-xs uppercase tracking-widest font-bold">● Servicio Personalizado</p>
          </div>
        </div>
        <img src={IMAGES.LOGISTICS} className="rounded-3xl shadow-xl" alt="Impeccable Service" />
      </section>

      {/* Contacto */}
      <section id="enquire" className="py-40 bg-charcoal text-white relative flex items-center min-h-[800px]">
        <div className="absolute inset-0 opacity-10">
          <img src={IMAGES.FORM_BG} className="w-full h-full object-cover" alt="Background Texture" />
        </div>
        <div className="max-w-3xl mx-auto relative z-10 w-full px-6 text-center">
          {formStatus === 'success' ? (
            <div className="animate-fade-up"><h3 className="text-5xl font-serif">Solicitud Recibida.</h3><p className="mt-6 opacity-50 uppercase tracking-widest text-xs">El Chef Charlie le contactará pronto.</p></div>
          ) : (
            <form className="space-y-12" onSubmit={handleFormSubmit}>
              <h3 className="text-6xl font-serif italic mb-12">Asegure su Fecha.</h3>
              <div className="grid md:grid-cols-2 gap-10">
                <input required className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full text-xs tracking-widest uppercase" placeholder="Nombre" />
                <input required type="email" className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full text-xs tracking-widest uppercase" placeholder="Email" />
              </div>
              <textarea className="bg-transparent border-b border-white/20 py-5 outline-none focus:border-gold w-full h-32 text-xs tracking-widest uppercase resize-none" placeholder="Detalles de su evento..."></textarea>
              <button disabled={formStatus === 'submitting'} className="w-full bg-gold py-8 rounded-full font-bold uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-charcoal transition-all">
                {formStatus === 'submitting' ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="py-20 text-center text-[10px] uppercase tracking-widest opacity-20">&copy; 2024 ARTESANO | BESPOKE PRIVATE CHEF</footer>
      <Chatbot />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}