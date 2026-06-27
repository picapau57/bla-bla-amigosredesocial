import { useState, useEffect, useRef } from 'react';
import { User, Story } from '../types';
import { Plus, X, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StoriesSectionProps {
  currentUser: User;
  users: User[];
  stories: Story[];
  onAddStory: (mediaUrl: string, text?: string) => void;
}

export default function StoriesSection({
  currentUser,
  users,
  stories,
  onAddStory
}: StoriesSectionProps) {
  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create state for new story Inputs
  const [newStoryText, setNewStoryText] = useState('');
  const [newStoryImage, setNewStoryImage] = useState('');

  // Scroll controls for the horizontal carousel
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Sample static high resolution stories images that user can choose from quickly
  const sampleStoryImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1513829096900-ee825ee22591?auto=format&fit=crop&q=80&w=400'
  ];

  // We show ALL stories without aggressive mock user filtering, so everything is visible!
  const filteredStories = stories.filter(s => !!s.mediaUrl);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      checkScroll();
      
      const observer = new ResizeObserver(() => checkScroll());
      observer.observe(el);

      // Timeout helper to verify after rendering completes
      const t = setTimeout(checkScroll, 100);

      return () => {
        el.removeEventListener('scroll', checkScroll);
        observer.disconnect();
        clearTimeout(t);
      };
    }
  }, [stories, filteredStories.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // When story is active, implement automatic advance logic
  useEffect(() => {
    if (activeStoryIdx === null) return;

    const timer = setTimeout(() => {
      if (activeStoryIdx < filteredStories.length - 1) {
        setActiveStoryIdx(activeStoryIdx + 1);
      } else {
        setActiveStoryIdx(null);
      }
    }, 4500); // 4.5 seconds auto-advance

    return () => clearTimeout(timer);
  }, [activeStoryIdx, filteredStories.length]);

  const handlePostStory = () => {
    const finalImage = newStoryImage.trim() || sampleStoryImages[0];
    onAddStory(finalImage, newStoryText);
    setNewStoryText('');
    setNewStoryImage('');
    setShowCreateModal(false);
  };

  return (
    <div className="bg-[#121124] border border-white/10 rounded-2xl p-4 shadow-xl mb-6 relative" id="applet-stories-section">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF] font-mono">
          Stories Diários (24h)
        </span>
        <span className="text-[10px] text-gray-500 font-mono font-bold">Total: {filteredStories.length}</span>
      </div>

      <div className="relative group/tray">
        
        {/* LEFT CAROUSEL ARROW */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-[#1E1D3A] text-gray-700 dark:text-gray-200 w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-[#25244C]"
            aria-label="Anterior"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300 stroke-[2.5]" />
          </button>
        )}

        {/* RIGHT CAROUSEL ARROW */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-white dark:bg-[#1E1D3A] text-gray-700 dark:text-gray-200 w-9 h-9 rounded-full flex items-center justify-center shadow-md border border-gray-200 dark:border-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-[#25244C]"
            aria-label="Próximo"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300 stroke-[2.5]" />
          </button>
        )}

        {/* STORIES LIST CONTAINER */}
        <div 
          ref={scrollRef}
          className="flex items-center gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none snap-x" 
          id="stories-bubbles-container"
        >
          
          {/* CREATE STORY CARD */}
          <div 
            onClick={() => setShowCreateModal(true)}
            className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden bg-white dark:bg-[#1A1932] border border-gray-200 dark:border-white/10 shadow-lg cursor-pointer shrink-0 select-none group transition-all duration-300 hover:shadow-[#00E5FF]/20 hover:border-[#00E5FF]/40 hover:-translate-y-1 flex flex-col snap-start"
            id="create-story-card"
          >
            {/* Top image section: current user's avatar */}
            <div className="w-full h-[70%] overflow-hidden relative bg-gray-100 dark:bg-[#0D0C1D]">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 brightness-95"
              />
              <div className="absolute inset-0 bg-black/5" />
            </div>
            
            {/* Bottom text section */}
            <div className="w-full h-[30%] bg-white dark:bg-[#0A0A14] flex flex-col items-center justify-end pb-3 relative create-story-footer">
              {/* Overlapping circular blue plus button */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 p-[2px] rounded-full bg-white dark:bg-[#0A0A14]">
                <div className="w-8 h-8 rounded-full bg-[#007eff] flex items-center justify-center text-white shadow-md shadow-[#007eff]/30 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-4 h-4 stroke-[3px]" />
                </div>
              </div>
              <span className="text-[10px] sm:text-[11px] text-gray-800 dark:text-white font-sans font-extrabold tracking-wide">
                Criar story
              </span>
            </div>
          </div>

          {/* ACTIVE STORIES CARDS */}
          {filteredStories.map((story, index) => {
            const user = users.find(u => u.id === story.userId) || {
              fullName: 'Usuário',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
              id: story.userId,
              isVerified: false
            };
            const isCurrentUser = user.id === currentUser.id;

            return (
              <div 
                key={story.id} 
                onClick={() => setActiveStoryIdx(index)}
                className="user-story-card relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden bg-[#0A0A14] border border-white/10 shadow-lg cursor-pointer shrink-0 select-none group transition-all duration-300 hover:shadow-[#007eff]/25 hover:border-[#007eff]/50 hover:-translate-y-1 snap-start"
              >
                {/* Background Story Image */}
                <img 
                  src={story.mediaUrl} 
                  alt={`${user.fullName}'s story`}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                
                {/* Dark Gradient Overlay for optimal legibility */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/85" />

                {/* User Circular Avatar Badge in the top-left (matches screenshot: thick vibrant blue border) */}
                <div className="absolute top-2.5 left-2.5 z-10 w-9 h-9 rounded-full border-[2.5px] border-[#007eff] bg-white flex items-center justify-center shadow-md">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full rounded-full object-cover p-[1px]"
                  />
                </div>

                {/* User Name and Caption snippet at the bottom */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex flex-col">
                  <span className="text-[10px] sm:text-[11px] text-white font-sans font-bold tracking-wide truncate flex items-center gap-1 drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                    {isCurrentUser ? 'Seu story' : user.fullName}
                    {user.isVerified && (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#007eff] inline-flex items-center justify-center text-[7px] text-white font-black shrink-0">✓</span>
                    )}
                  </span>
                  {story.text && (
                    <span className="text-[8px] text-gray-200 font-medium truncate font-sans mt-0.5 opacity-90 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                      {story.text}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STORY LIGHTBOX MODAL */}
      <AnimatePresence>
        {activeStoryIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0A0A14]/98 flex items-center justify-center p-4 backdrop-blur-md"
          >
            {/* Top Bar inside modal */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
              <div className="flex items-center gap-2.5">
                {(() => {
                  const s = filteredStories[activeStoryIdx];
                  const author = users.find(u => u.id === s.userId);
                  return author ? (
                    <>
                      <img
                        src={author.avatar}
                        alt={author.fullName}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full border border-white/10 object-cover"
                      />
                      <div>
                        <div className="text-sm font-extrabold text-white flex items-center gap-1 uppercase tracking-tight">
                          {author.fullName}
                          {author.isVerified && <CheckCircle className="w-3.5 h-3.5 text-[#00E5FF] fill-[#00E5FF]/10 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono font-bold">ID: {author.username}</div>
                      </div>
                    </>
                  ) : null;
                })()}
              </div>
              <button
                onClick={() => setActiveStoryIdx(null)}
                className="text-gray-400 hover:text-white p-2 bg-[#121124]/80 rounded-full border border-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* NAVIGATION CONTROLS */}
            <div className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20">
              <button
                disabled={activeStoryIdx === 0}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStoryIdx(activeStoryIdx - 1);
                }}
                className="p-3 rounded-full bg-[#121124]/80 border border-white/10 text-gray-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

            <div className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20">
              <button
                disabled={activeStoryIdx === filteredStories.length - 1}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveStoryIdx(activeStoryIdx + 1);
                }}
                className="p-3 rounded-full bg-[#121124]/80 border border-white/10 text-gray-300 hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* CENTRAL MEDIA */}
            <div className="relative w-full max-w-sm aspect-[9/16] bg-[#0A0A14] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              
              {/* TIMELINE TIMER BAR */}
              <div className="absolute top-18 left-3 right-3 flex gap-1 z-20">
                {filteredStories.map((st, i) => (
                  <div key={st.id} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] rounded-full transition-all duration-4500 ease-linear ${
                        i < activeStoryIdx ? 'w-full' : i === activeStoryIdx ? 'animate-story-bar' : 'w-0'
                      }`} 
                    />
                  </div>
                ))}
              </div>

              <img
                src={filteredStories[activeStoryIdx].mediaUrl}
                alt="Story Media"
                className="w-full h-full object-cover"
              />
              
              {/* Overlay Gradient for subtitles */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0A0A14] via-[#0A0A14]/20 to-transparent p-6 pt-16 flex items-end">
                {filteredStories[activeStoryIdx].text && (
                  <p className="text-white text-center w-full font-bold text-sm tracking-wide drop-shadow-md">
                    {filteredStories[activeStoryIdx].text}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CREATE STORY DIALOG MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0A14]/80 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#121124] border border-white/10 rounded-2xl w-full max-w-md p-6 relative text-gray-200 shadow-2xl"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-sm font-extrabold text-white uppercase tracking-widest text-[#00E5FF] mb-4 font-mono">
                Criar Novo Story Diário
              </h3>

              <div className="space-y-4">
                {/* Story text caption */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase font-mono mb-1.5 font-bold">
                    Legenda do Story
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Treino concluído! 🏋️‍♂️ ou Café + Código!"
                    value={newStoryText}
                    onChange={(e) => setNewStoryText(e.target.value)}
                    className="w-full bg-[#0A0A14] text-gray-200 p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#00E5FF] text-xs font-semibold"
                  />
                </div>

                {/* Cover Image link option */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase font-mono mb-1.5 font-bold">
                    URL da Imagem
                  </label>
                  <input
                    type="text"
                    placeholder="Insira uma URL externa ou use sugestões abaixo"
                    value={newStoryImage}
                    onChange={(e) => setNewStoryImage(e.target.value)}
                    className="w-full bg-[#0A0A14] text-gray-200 p-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-[#00E5FF] text-xs font-bold font-mono text-gray-400"
                  />
                </div>

                {/* Quick Presets Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase font-mono mb-1.5 font-bold">
                    Sugestões Rápidas:
                  </label>
                  <div className="flex gap-2">
                    {sampleStoryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setNewStoryImage(img)}
                        className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                          newStoryImage === img ? 'border-[#00E5FF] opacity-100 scale-105 shadow-md shadow-[#00E5FF]/20' : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="sample" className="w-full h-full object-cover animate-fade-in" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handlePostStory}
                    className="w-full bg-gradient-to-r from-[#7C4DFF] via-[#00E5FF] to-[#00E676] hover:brightness-110 text-white font-extrabold text-xs py-3 rounded-xl shadow-lg transition-all uppercase tracking-wider cursor-pointer"
                  >
                    Publicar Story
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
