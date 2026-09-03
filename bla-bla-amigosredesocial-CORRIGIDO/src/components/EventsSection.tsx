import { useState, FormEvent } from 'react';
import { User, Event } from '../types';
import { Calendar, Plus, MapPin, Clock, CheckCircle, Ticket, Compass, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface EventsSectionProps {
  currentUser: User;
  events: Event[];
  onCreateEvent: (inputs: {
    title: string;
    description: string;
    date: string;
    time: string;
    location: string;
    category: string;
    image: string;
  }) => void;
  onToggleRSVP: (eventId: string, rsvpType: 'going' | 'maybe') => void;
}

export default function EventsSection({
  currentUser,
  events,
  onCreateEvent,
  onToggleRSVP
}: EventsSectionProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  const [selCategory, setSelCategory] = useState<string>('all');

  // Creator state
  const [eTitle, setETitle] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eDate, setEDate] = useState('');
  const [eTime, setETime] = useState('');
  const [eLoc, setELoc] = useState('');
  const [eCat, setECat] = useState('Social/Cultural');

  const presetEventImages = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=400'
  ];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!eTitle.trim()) return;

    onCreateEvent({
      title: eTitle,
      description: eDesc,
      date: eDate || '2026-07-30',
      time: eTime || '18:00',
      location: eLoc,
      category: eCat,
      image: presetEventImages[Math.floor(Math.random() * presetEventImages.length)]
    });

    setETitle('');
    setEDesc('');
    setELoc('');
    setEDate('');
    setETime('');
    setActiveTab('browse');
    alert(`Parabéns! Evento '${eTitle}' cadastrado.`);
  };

  const filteredEvents = selCategory === 'all'
    ? events
    : events.filter(e => e.category.toLowerCase() === selCategory.toLowerCase());

  return (
    <div className="flex-1 space-y-6" id="events-section-console">
      
      {/* SECONDARY ACTION SWITCH */}
      <div className="flex bg-[#121225] border border-white/10 p-1.5 rounded-2xl gap-1.5 shadow-xl">
        <button
          onClick={() => setActiveTab('browse')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-[#0A0A14] text-[#00E5FF] border border-[#00E5FF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Explorar Eventos
        </button>
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'create'
              ? 'bg-[#0A0A14] text-[#00E5FF] border border-[#00E5FF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Plus className="w-4.5 h-4.5" /> Criar Lançamento/Evento
        </button>
      </div>

      {activeTab === 'browse' && (
        <div className="space-y-6" id="events-browser-view">
          
          {/* Categories Selector list */}
          <div className="flex bg-[#0A0A14] p-2 border border-white/10 rounded-xl overflow-x-auto gap-2 scrollbar-none">
            {['all', 'Social/Cultural', 'Tecnologia/Educação', 'Corporativo', 'Festa/Show'].map(cat => (
              <button
                key={cat}
                onClick={() => setSelCategory(cat)}
                className={`text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-all ${
                  selCategory === cat 
                    ? 'bg-gradient-to-r from-[#FF5722] via-[#FF1744] to-[#7C4DFF] text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white bg-[#121225] border border-white/5'
                }`}
              >
                {cat === 'all' ? 'Ver Todos' : cat}
              </button>
            ))}
          </div>

          {/* Grid display cards */}
          <div className="space-y-6">
            {filteredEvents.map(ev => {
              const goingList = ev.going || [];
              const maybeList = ev.maybe || [];
              
              const isGoing = goingList.includes(currentUser.id);
              const isMaybe = maybeList.includes(currentUser.id);

              return (
                <div key={ev.id} className="bg-[#121225] border border-white/10 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row group transition-all duration-300">
                  <div className="w-full md:w-56 h-48 md:h-auto bg-[#0A0A14] relative shrink-0">
                    <img src={ev.image} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A14]/70 to-transparent" />
                    
                    {/* Floating Date Badge */}
                    <div className="absolute top-3 left-3 bg-[#0A0A14]/90 backdrop-blur border border-white/10 rounded-xl p-2.5 text-center min-w-[55px]">
                      <span className="block text-xs font-extrabold text-[#00E5FF] font-mono">
                        {new Date(ev.date).getDate()}
                      </span>
                      <span className="block text-[8px] uppercase tracking-wider text-gray-500 font-mono font-bold mt-0.5">
                        {new Date(ev.date).toLocaleDateString('pt-BR', { month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Tag className="w-3.5 h-3.5 text-[#FF5722]" />
                        <span className="text-[9px] uppercase font-mono tracking-wider font-bold text-[#FF5722]/95">{ev.category}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-base text-white group-hover:text-[#00E5FF] transition-colors uppercase tracking-tight">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed font-sans">
                        {ev.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-[11px] text-gray-400 font-mono">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#7C4DFF]" />
                          <span>Horário: {ev.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-4 h-4 text-[#00E5FF] shrink-0" />
                          <span className="truncate">{ev.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Metric confirmations */}
                      <div className="text-[11px] font-mono text-gray-400 flex gap-3">
                        <span>⭐ <strong className="text-[#00E5FF]">{goingList.length}</strong> Confirmados</span>
                        <span>❔ <strong className="text-gray-300">{maybeList.length}</strong> Talvez</span>
                      </div>

                      {/* RSVP Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => onToggleRSVP(ev.id, 'going')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                            isGoing
                              ? 'bg-gradient-to-r from-[#FF5722] to-[#FF1744] text-white shadow-lg'
                              : 'bg-[#0A0A14] hover:bg-[#0A0A14]/80 border border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          <Ticket className="w-3.5 h-3.5" /> Vou Participar
                        </button>
                        <button
                          onClick={() => onToggleRSVP(ev.id, 'maybe')}
                          className={`px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
                            isMaybe
                              ? 'bg-gradient-to-r from-[#7C4DFF] to-[#00E5FF] text-white shadow-lg'
                              : 'bg-[#0A0A14] hover:bg-[#0A0A14]/85 border border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          Talvez
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {activeTab === 'create' && (
        <form onSubmit={handleCreate} className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl space-y-4 animate-fade-in-up" id="events-creation-panel">
          <div className="pb-1 border-b border-white/10">
            <h3 className="font-extrabold text-sm text-white uppercase tracking-widest text-[#00E5FF] font-mono">
              Registrar Novo Evento
            </h3>
            <p className="text-[11px] text-gray-500 mt-1">Organize festivais, workshops, lives de lançamento, palestras virtuais ou encontros físicos!</p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Título do Evento</label>
            <input
              type="text"
              required
              placeholder="Ex: Encontro Mensal Bla Bla SP, Oficina Prática Figma"
              value={eTitle}
              onChange={(e) => setETitle(e.target.value)}
              className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 font-sans"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Agenda / Descrição Completa</label>
            <textarea
              required
              maxLength={600}
              placeholder="Descreva a programação completa, atrações confirmadas e instruções de acesso ou credenciamento."
              value={eDesc}
              onChange={(e) => setEDesc(e.target.value)}
              className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] focus:ring-1 focus:ring-[#00E5FF]/20 resize-none min-h-[90px] font-sans"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Data do Evento</label>
              <input
                type="date"
                required
                value={eDate}
                onChange={(e) => setEDate(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none font-mono focus:border-[#00E5FF]"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Horário Inicial</label>
              <input
                type="text"
                required
                placeholder="Ex: 14:00, 19:30"
                value={eTime}
                onChange={(e) => setETime(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none font-mono focus:border-[#00E5FF]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location or online slot URL */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Localização ou URL de Live</label>
              <input
                type="text"
                required
                placeholder="Ex: Av. Paulista 1000 SP ou Sala Virtual Bla Bla"
                value={eLoc}
                onChange={(e) => setELoc(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] font-sans"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase font-mono text-gray-400 mb-1.5">Categoria</label>
              <select
                value={eCat}
                onChange={(e) => setECat(e.target.value)}
                className="w-full bg-[#0A0A14] border border-white/10 text-gray-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#00E5FF] font-sans cursor-pointer"
              >
                <option value="Social/Cultural">Social/Cultural</option>
                <option value="Tecnologia/Educação">Tecnologia/Educação</option>
                <option value="Corporativo">Corporativo</option>
                <option value="Festa/Show">Festa/Show</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className="flex-1 bg-[#0A0A14] border border-white/10 text-xs font-bold py-2.5 rounded-xl uppercase text-gray-400 hover:text-white cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#FF5722] via-[#FF1744] to-[#7C4DFF] hover:brightness-110 text-white font-extrabold text-xs py-2.5 rounded-xl shadow-lg uppercase tracking-wider cursor-pointer transition-all"
            >
              Lançar Evento
            </button>
          </div>
        </form>
      )}

    </div>
  );
}
