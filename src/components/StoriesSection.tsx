import { useState, useEffect } from 'react';
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

  // Sample static high resolution stories images that user can choose from quickly
  const sampleStoryImages = [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=400',
    'https://images.unsplash.com/photo-1513829096900-ee825ee22591?auto=format&fit=crop&q=80&w=400'
  ];

  // Filter out mock users' stories
  const filteredStories = stories.filter(s => !['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'admin-1'].includes(s.userId));

  // Group stories by user so each user has one main bubble in the bar
  const usersWithStories = Array.from(new Set(filteredStories.map(s => s.userId)))
    .map(uid => users.find(u => u.id === uid))
    .filter((u): u is User => !!u);

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
  }, [activeStoryIdx, filteredStories]);

  const handlePostStory = () => {
    const finalImage = newStoryImage.trim() || sampleStoryImages[0];
    onAddStory(finalImage, newStoryText);
    setNewStoryText('');
    setNewStoryImage('');
    setShowCreateModal(false);
  };

  const handleOpenUserStory = (userId: string) => {
    // Find the first story index of this specific user in the filtered stories array
    const firstIdx = filteredStories.findIndex(s => s.userId === userId);
    if (firstIdx !== -1) {
      setActiveStoryIdx(firstIdx);
    }
  };

  return (
    <div className="bg-[#121124] border border-white/10 rounded-2xl p-4 shadow-xl mb-6 relative overflow-hidden" id="applet-stories-section">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold uppercase tracking-widest text-[#00E5FF] font-mono">
          Stories Diários (24h)
        </span>
        <span className="text-[10px] text-gray-500 font-mono font-bold">Total: {filteredStories.length}</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none" id="stories-bubbles-container">
        
        {/* CREATE STORY BUBBLE */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 select-none">
          <button 
            onClick={() => setShowCreateModal(true)}
            className="group relative w-15 h-15 rounded-full bg-[#0A0A14] flex items-center justify-center border-2 border-dashed border-white/10 hover:border-[#00E5FF] transition-all duration-300 cursor-pointer"
          >
            <Plus className="w-5 h-5 text-gray-400 group-hover:text-[#00E5FF] group-hover:scale-110 transition-all" />
            <span className="absolute bottom-0 right-0 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] text-white p-0.5 rounded-full border border-[#0A0A14]">
              <Plus className="w-2.5 h-2.5" />
            </span>
          </button>
          <span className="text-[10px] text-gray-300 font-medium font-mono text-center max-w-[65px] truncate font-bold">
            Adicionar
          </span>
        </div>

        {/* ACTIVE STORIES BUBBLES */}
        {usersWithStories.map(user => {
          const isCurrentUser = user.id === currentUser.id;
          return (
            <div 
              key={user.id} 
              onClick={() => handleOpenUserStory(user.id)}
              className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer select-none group"
            >
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#00E5FF] via-[#7C4DFF] to-[#FF5722] animate-pulse-slow">
                <div className="p-0.5 rounded-full bg-[#121124]">
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    referrerPolicy="no-referrer"
                    className="w-13-5 h-13-5 rounded-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <span className="text-[10px] text-gray-300 font-medium font-mono text-center max-w-[68px] truncate font-bold">
                {isCurrentUser ? 'Seu Story' : user.fullName.split(' ')[0]}
              </span>
            </div>
          );
        })}
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
