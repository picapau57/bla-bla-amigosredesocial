import { useState, FormEvent } from 'react';
import { User, Job } from '../types';
import { 
  Briefcase, MapPin, Search, Plus, Trash2, CheckCircle, Mail, 
  Phone, Users, Filter, Sparkles, X, ChevronDown, ChevronUp, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface JobsSectionProps {
  currentUser: User;
  users: User[];
  jobs: Job[];
  onCreateJob: (inputs: {
    title: string;
    companyName: string;
    companyLogo: string;
    location: string;
    modality: 'Presencial' | 'Híbrido' | 'Remoto';
    level: 'Estágio' | 'Júnior' | 'Pleno' | 'Sênior' | 'Gerência';
    salary: string;
    description: string;
    requirements: string;
    contactEmail: string;
    contactPhone?: string;
  }) => void;
  onDeleteJob: (jobId: string) => void;
  onToggleApplyJob: (jobId: string) => void;
  onViewProfile?: (user: User) => void;
}

export default function JobsSection({
  currentUser,
  users,
  jobs,
  onCreateJob,
  onDeleteJob,
  onToggleApplyJob,
  onViewProfile
}: JobsSectionProps) {
  const [activeSubTab, setActiveSubTab] = useState<'browse' | 'create' | 'applications'>('browse');
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [selectedModality, setSelectedModality] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Creator form states
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyLogo, setCompanyLogo] = useState('');
  const [location, setLocation] = useState('Goiânia, GO');
  const [customCity, setCustomCity] = useState('');
  const [modality, setModality] = useState<'Presencial' | 'Híbrido' | 'Remoto'>('Presencial');
  const [level, setLevel] = useState<'Estágio' | 'Júnior' | 'Pleno' | 'Sênior' | 'Gerência'>('Pleno');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [contactEmail, setContactEmail] = useState(currentUser.email || '');
  const [contactPhone, setContactPhone] = useState(currentUser.phone || '');

  // Expanded Job IDs for showing details
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  const presetLogos = [
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=150', // Tech
    'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?auto=format&fit=crop&q=80&w=150', // Business
    'https://images.unsplash.com/photo-1589923188900-85dae440342b?auto=format&fit=crop&q=80&w=150', // Agro/Nature
    'https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&q=80&w=150', // Design
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=150'  // Logistics
  ];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !companyName.trim() || !description.trim() || !contactEmail.trim()) {
      alert('Por favor, preencha os campos obrigatórios (*).');
      return;
    }

    const finalLocation = location === 'Outra' ? (customCity.trim() || 'Goiás, BR') : location;
    const finalLogo = companyLogo.trim() || presetLogos[Math.floor(Math.random() * presetLogos.length)];

    onCreateJob({
      title: title.trim(),
      companyName: companyName.trim(),
      companyLogo: finalLogo,
      location: finalLocation,
      modality,
      level,
      salary: salary.trim() || 'A combinar',
      description: description.trim(),
      requirements: requirements.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim() || undefined
    });

    // Reset fields
    setTitle('');
    setCompanyName('');
    setCompanyLogo('');
    setSalary('');
    setDescription('');
    setRequirements('');
    setActiveSubTab('browse');
    alert(`Parabéns! Vaga para '${title}' cadastrada com sucesso em Goiás.`);
  };

  const handleApply = (jobId: string, jobTitle: string) => {
    onToggleApplyJob(jobId);
  };

  // Filters application
  const filteredJobs = jobs.filter(j => {
    // Search keyword
    const matchesSearch = 
      j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.requirements.toLowerCase().includes(searchTerm.toLowerCase());

    // City Filter
    let matchesCity = true;
    if (selectedCity !== 'all') {
      if (selectedCity === 'Remoto') {
        matchesCity = j.modality === 'Remoto';
      } else if (selectedCity === 'Outras') {
        matchesCity = !['Goiânia, GO', 'Aparecida de Goiânia, GO', 'Anápolis, GO', 'Rio Verde, GO'].includes(j.location) && j.modality !== 'Remoto';
      } else {
        matchesCity = j.location.toLowerCase().includes(selectedCity.toLowerCase());
      }
    }

    // Modality Filter
    const matchesModality = selectedModality === 'all' || j.modality === selectedModality;

    // Level Filter
    const matchesLevel = selectedLevel === 'all' || j.level === selectedLevel;

    return matchesSearch && matchesCity && matchesModality && matchesLevel;
  });

  // User applications
  const appliedJobs = jobs.filter(j => j.applicants.includes(currentUser.id));

  // Count active stats
  const totalGoiania = jobs.filter(j => j.location.includes('Goiânia')).length;
  const totalActive = jobs.length;
  const totalApplied = appliedJobs.length;

  return (
    <div className="flex-1 space-y-6 animate-fade-in" id="jobs-section-container">
      
      {/* PROFESSIONAL JOB BANNER */}
      <div className="relative bg-[#121225] border border-white/10 rounded-2xl p-6 overflow-hidden shadow-xl" id="jobs-header-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#00E5FF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#7C4DFF]/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-[#00E5FF]/10 border border-[#00E5FF]/20 px-2.5 py-1 rounded-full text-xs font-mono font-bold text-[#00E5FF]">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Empregos e Carreira Goiás
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight font-sans">
              Mercado de Trabalho em Goiás
            </h2>
            <p className="text-gray-450 text-gray-400 text-xs max-w-2xl leading-relaxed">
              Encontre vagas de emprego em Goiânia, Aparecida, Anápolis, Rio Verde e em todo o estado.
              Publique oportunidades, acompanhe candidaturas e conecte-se com talentos locais no modelo do LinkedIn de Goiás.
            </p>
          </div>
          
          {/* Quick Stats Block */}
          <div className="grid grid-cols-3 gap-4 shrink-0 bg-[#0A0A14] p-3 rounded-xl border border-white/5" id="jobs-stats-panel">
            <div className="text-center px-1">
              <div className="text-lg font-bold text-[#00E5FF] font-mono">{totalActive}</div>
              <div className="text-[9px] text-gray-500 uppercase font-bold tracking-tight">Vagas GO</div>
            </div>
            <div className="text-center border-l border-white/10 px-3">
              <div className="text-lg font-bold text-[#00E676] font-mono">{totalGoiania}</div>
              <div className="text-[9px] text-gray-500 uppercase font-bold tracking-tight">Goiânia</div>
            </div>
            <div className="text-center border-l border-white/10 px-1">
              <div className="text-lg font-bold text-[#7C4DFF] font-mono">{totalApplied}</div>
              <div className="text-[9px] text-gray-500 uppercase font-bold tracking-tight">Inscrito</div>
            </div>
          </div>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex bg-[#121225] border border-white/10 p-1.5 rounded-2xl gap-1.5 shadow-xl" id="jobs-tab-selector">
        <button
          onClick={() => setActiveSubTab('browse')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'browse'
              ? 'bg-[#0A0A14] text-[#00E5FF] border border-[#00E5FF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Explorar Vagas
        </button>
        <button
          onClick={() => setActiveSubTab('applications')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'applications'
              ? 'bg-[#0A0A14] text-[#7C4DFF] border border-[#7C4DFF]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <CheckCircle className="w-4 h-4" /> Minhas Candidaturas ({totalApplied})
        </button>
        <button
          onClick={() => setActiveSubTab('create')}
          className={`flex-1 text-xs py-2.5 font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSubTab === 'create'
              ? 'bg-[#0A0A14] text-[#00E676] border border-[#00E676]/20 shadow-md'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Plus className="w-4.5 h-4.5" /> Publicar Vaga
        </button>
      </div>

      {/* CONTENT BLOCKS */}
      <AnimatePresence mode="wait">
        
        {/* TAB 1: BROWSE JOBS */}
        {activeSubTab === 'browse' && (
          <motion.div
            key="browse"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-6"
          >
            {/* LEFT FILTERS RAIL */}
            <div className="bg-[#121225] border border-white/10 rounded-2xl p-4 h-fit space-y-5 shadow-lg" id="jobs-filters-rail">
              <div className="flex items-center gap-2 border-b border-white/15 pb-2.5">
                <Filter className="w-4 h-4 text-[#00E5FF]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Filtros Inteligentes</span>
              </div>

              {/* SEARCH INPUT */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Palavra-chave</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ex: React, Vendas, TI..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#1A1A32] text-xs text-white pl-8 pr-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#00E5FF]"
                  />
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                </div>
              </div>

              {/* CITY FILTER */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Cidade / Região GO</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-[#1A1A32] text-xs text-white p-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="all">Todas as Cidades</option>
                  <option value="Goiânia">Goiânia, GO</option>
                  <option value="Aparecida">Aparecida de Goiânia, GO</option>
                  <option value="Anápolis">Anápolis, GO</option>
                  <option value="Rio Verde">Rio Verde, GO</option>
                  <option value="Remoto">100% Remoto</option>
                  <option value="Outras">Outras Cidades GO</option>
                </select>
              </div>

              {/* MODALITY FILTER */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Modalidade de Trabalho</label>
                <select
                  value={selectedModality}
                  onChange={(e) => setSelectedModality(e.target.value)}
                  className="w-full bg-[#1A1A32] text-xs text-white p-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="all">Todas as Modalidades</option>
                  <option value="Presencial">Presencial</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Remoto">Remoto</option>
                </select>
              </div>

              {/* LEVEL FILTER */}
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nível de Experiência</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full bg-[#1A1A32] text-xs text-white p-2 rounded-xl border border-white/10 focus:outline-none focus:border-[#00E5FF]"
                >
                  <option value="all">Todos os Níveis</option>
                  <option value="Estágio">Estágio</option>
                  <option value="Júnior">Júnior (Entry Level)</option>
                  <option value="Pleno">Pleno (Mid Level)</option>
                  <option value="Sênior">Sênior</option>
                  <option value="Gerência">Gerência / Diretoria</option>
                </select>
              </div>

              {/* RESET FILTERS */}
              {(searchTerm || selectedCity !== 'all' || selectedModality !== 'all' || selectedLevel !== 'all') && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCity('all');
                    setSelectedModality('all');
                    setSelectedLevel('all');
                  }}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] uppercase font-bold text-gray-300 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <X className="w-3.5 h-3.5" /> Limpar Filtros
                </button>
              )}
            </div>

            {/* JOBS LIST - 3 COLS LARGE */}
            <div className="lg:col-span-3 space-y-4" id="jobs-list-feed">
              {filteredJobs.length === 0 ? (
                <div className="bg-[#121225] border border-white/10 rounded-2xl p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-[#1A1A32] border border-white/10 rounded-full flex items-center justify-center mx-auto text-gray-400">
                    <Search className="w-7 h-7" />
                  </div>
                  <h3 className="text-white font-bold text-base">Nenhuma vaga encontrada</h3>
                  <p className="text-gray-450 text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                    Não encontramos vagas correspondentes aos filtros selecionados. Tente alterar as palavras de busca ou selecionar outra cidade de Goiás.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('all');
                      setSelectedModality('all');
                      setSelectedLevel('all');
                    }}
                    className="px-4 py-2 bg-[#1A1A32] hover:bg-[#25254A] border border-white/10 rounded-xl text-xs font-semibold text-[#00E5FF] cursor-pointer"
                  >
                    Ver Todas as Vagas
                  </button>
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const isCreator = job.userId === currentUser.id;
                  const isApplied = job.applicants.includes(currentUser.id);
                  const isExpanded = expandedJobId === job.id;
                  const jobCreator = users.find(u => u.id === job.userId);

                  return (
                    <div 
                      key={job.id} 
                      className={`bg-[#121225] border ${isApplied ? 'border-[#7C4DFF]/40 bg-[#121225]/90' : 'border-white/10'} rounded-2xl overflow-hidden hover:border-[#00E5FF]/40 transition-all duration-300 shadow-md`}
                    >
                      {/* Job Main Card */}
                      <div className="p-5 flex flex-col md:flex-row gap-4 items-start">
                        {/* Company Logo */}
                        <div className="w-14 h-14 bg-[#1A1A32] border border-white/10 rounded-xl overflow-hidden shrink-0">
                          <img 
                            src={job.companyLogo} 
                            alt={job.companyName} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=150';
                            }}
                          />
                        </div>

                        {/* Text Details */}
                        <div className="flex-1 space-y-1.5 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-white font-bold text-sm md:text-base hover:text-[#00E5FF] cursor-pointer transition-colors" onClick={() => setExpandedJobId(isExpanded ? null : job.id)}>
                              {job.title}
                            </h3>
                            {isApplied && (
                              <span className="bg-[#7C4DFF]/15 border border-[#7C4DFF]/30 text-[#7C4DFF] text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded flex items-center gap-1">
                                <CheckCircle className="w-2.5 h-2.5" /> Candidatado
                              </span>
                            )}
                            {isCreator && (
                              <span className="bg-[#00E676]/15 border border-[#00E676]/30 text-[#00E676] text-[9px] font-bold font-mono uppercase px-2 py-0.5 rounded">
                                Publicada por Você
                              </span>
                            )}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-gray-400">
                            <span className="font-semibold text-gray-300">{job.companyName}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" /> {job.location}</span>
                            <span className="text-[#00E5FF] font-mono font-semibold">{job.salary}</span>
                          </div>

                          {/* Modality & Level Badges */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="bg-[#1A1A32] border border-white/5 text-gray-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg">
                              {job.modality}
                            </span>
                            <span className="bg-[#1A1A32] border border-white/5 text-gray-400 text-[10px] font-bold font-mono px-2 py-0.5 rounded-lg">
                              {job.level}
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono">
                              Postado em {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Action Buttons */}
                        <div className="flex md:flex-col gap-2 w-full md:w-auto shrink-0 pt-3 md:pt-0">
                          <button
                            onClick={() => handleApply(job.id, job.title)}
                            className={`flex-1 md:w-32 py-2 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer text-center ${
                              isApplied
                                ? 'bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/30 text-red-400 hover:from-red-500/20'
                                : 'bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] hover:opacity-95 text-white font-black shadow-md shadow-[#00E5FF]/10'
                            }`}
                          >
                            {isApplied ? 'Desistir' : 'Candidatar-se'}
                          </button>
                          
                          <button
                            onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                            className="flex-1 md:w-32 py-2 bg-[#1A1A32] hover:bg-[#25254A] border border-white/5 text-xs text-gray-300 rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {isExpanded ? (
                              <>Ocultar <ChevronUp className="w-3.5 h-3.5 text-[#00E5FF]" /></>
                            ) : (
                              <>Detalhes <ChevronDown className="w-3.5 h-3.5 text-gray-500" /></>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details section */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 'auto' }}
                            exit={{ height: 0 }}
                            className="overflow-hidden border-t border-white/10 bg-[#0A0A14]/60"
                          >
                            <div className="p-5 space-y-4">
                              
                              {/* Job description */}
                              <div className="space-y-1.5">
                                <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider text-[#00E5FF]">Descrição da Vaga</h4>
                                <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line font-sans">
                                  {job.description}
                                </p>
                              </div>

                              {/* Job requirements */}
                              {job.requirements && (
                                <div className="space-y-1.5">
                                  <h4 className="text-white text-xs font-mono font-bold uppercase tracking-wider text-[#7C4DFF]">Requisitos</h4>
                                  <p className="text-gray-300 text-xs leading-relaxed whitespace-pre-line font-mono">
                                    {job.requirements}
                                  </p>
                                </div>
                              )}

                              {/* Contact Information */}
                              <div className="bg-[#121225] p-3 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between text-xs">
                                <div className="space-y-1">
                                  <span className="text-gray-400 font-mono block text-[9px] uppercase">Contato de Candidatura</span>
                                  <div className="flex items-center gap-4">
                                    <span className="text-white font-semibold flex items-center gap-1">
                                      <Mail className="w-3.5 h-3.5 text-[#00E5FF]" /> {job.contactEmail}
                                    </span>
                                    {job.contactPhone && (
                                      <span className="text-white font-semibold flex items-center gap-1">
                                        <Phone className="w-3.5 h-3.5 text-[#00E676]" /> {job.contactPhone}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <span className="text-[10px] text-gray-500 font-mono">ID da vaga: {job.id}</span>
                              </div>

                              {/* APPLICANTS VIEWER SECTION (mirroring LinkedIn candidates tracker) */}
                              <div className="pt-3 border-t border-white/10 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-[#00E676]" />
                                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                                      Candidatos Inscritos ({job.applicants.length})
                                    </span>
                                  </div>
                                  
                                  {/* Delete listings for owner or admin */}
                                  {(isCreator || currentUser.id === 'admin') && (
                                    <button
                                      onClick={() => {
                                        if(confirm(`Tem certeza que deseja excluir permanentemente a vaga para "${job.title}"?`)){
                                          onDeleteJob(job.id);
                                        }
                                      }}
                                      className="text-red-400 hover:text-red-500 text-[10px] font-bold uppercase flex items-center gap-1 px-2.5 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" /> Excluir Vaga
                                    </button>
                                  )}
                                </div>

                                {job.applicants.length === 0 ? (
                                  <p className="text-gray-500 text-[11px] italic font-mono pl-1">
                                    Nenhum candidato inscrito ainda nesta vaga. Seja o primeiro!
                                  </p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    {job.applicants.map((applicantId) => {
                                      const appUser = users.find(u => u.id === applicantId);
                                      if (!appUser) return null;

                                      return (
                                        <div 
                                          key={applicantId}
                                          onClick={() => onViewProfile && onViewProfile(appUser)}
                                          className="bg-[#1A1A32]/80 border border-white/5 rounded-xl p-2.5 flex items-center gap-2.5 hover:border-[#00E676]/40 cursor-pointer hover:bg-[#1A1A32] transition-all group"
                                          title={`Clique para ver o perfil de ${appUser.fullName}`}
                                        >
                                          <img 
                                            src={appUser.avatar} 
                                            alt={appUser.fullName}
                                            referrerPolicy="no-referrer"
                                            className="w-8.5 h-8.5 rounded-full object-cover border border-white/10 group-hover:scale-105 transition-transform" 
                                          />
                                          <div className="min-w-0">
                                            <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                                              {appUser.fullName}
                                              {appUser.isVerified && <CheckCircle className="w-3 h-3 text-[#00E5FF] fill-[#00E5FF]/10 shrink-0" />}
                                            </div>
                                            <div className="text-[9px] text-gray-500 truncate font-mono">
                                              {appUser.city}, {appUser.state}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Publisher Info footer */}
                              {jobCreator && (
                                <div className="text-[10px] text-gray-500 text-right font-mono">
                                  Vaga publicada por <span className="text-gray-300 font-semibold">{jobCreator.fullName}</span>
                                </div>
                              )}

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: APPLICATIONS */}
        {activeSubTab === 'applications' && (
          <motion.div
            key="applications"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="bg-[#121225] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-base">Minhas Candidaturas Ativas</h3>
                <p className="text-gray-400 text-xs mt-1">Acompanhe as vagas profissionais de Goiás às quais você enviou candidatura.</p>
              </div>
              <span className="bg-[#7C4DFF]/15 border border-[#7C4DFF]/30 text-[#7C4DFF] text-xs font-mono font-bold px-3 py-1 rounded-full">
                {totalApplied} Inscritas
              </span>
            </div>

            {appliedJobs.length === 0 ? (
              <div className="bg-[#121225] border border-white/10 rounded-2xl p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-[#1A1A32] border border-white/10 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <Briefcase className="w-7 h-7" />
                </div>
                <h3 className="text-white font-bold text-base">Você não se candidatou a nenhuma vaga ainda</h3>
                <p className="text-gray-450 text-gray-400 text-xs max-w-md mx-auto leading-relaxed">
                  Navegue pelo nosso feed de empregos em Goiânia e no estado, filtre pelas suas preferências e envie suas candidaturas com apenas 1 clique!
                </p>
                <button
                  onClick={() => setActiveSubTab('browse')}
                  className="px-4 py-2 bg-gradient-to-r from-[#00E5FF] to-[#7C4DFF] hover:opacity-95 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Explorar Oportunidades
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appliedJobs.map(job => (
                  <div key={job.id} className="bg-[#121225] border border-[#7C4DFF]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex gap-3.5 items-center">
                      <div className="w-12 h-12 bg-[#1A1A32] border border-white/10 rounded-lg overflow-hidden shrink-0">
                        <img src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-sm">{job.title}</h4>
                        <div className="flex flex-wrap items-center gap-x-2.5 text-xs text-gray-400 mt-1">
                          <span className="font-semibold text-gray-300">{job.companyName}</span>
                          <span>•</span>
                          <span>{job.location}</span>
                          <span>•</span>
                          <span className="text-[#00E5FF] font-mono">{job.salary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                      <div className="bg-[#00E676]/10 border border-[#00E676]/25 text-[#00E676] text-[10px] font-bold font-mono px-2.5 py-1 rounded-lg uppercase flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Enviada
                      </div>
                      <button
                        onClick={() => handleApply(job.id, job.title)}
                        className="py-1 px-3 bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                      >
                        Retirar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: CREATE JOB */}
        {activeSubTab === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#121225] border border-white/10 rounded-2xl p-6 shadow-xl space-y-6"
          >
            <div className="border-b border-white/10 pb-4 space-y-1">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#00E676]" /> Publicar Nova Vaga de Emprego
              </h3>
              <p className="text-gray-440 text-gray-400 text-xs">
                Insira os detalhes do cargo e exiba sua vaga para profissionais qualificados de Goiás na rede.
              </p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Título do Cargo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Desenvolvedor Front-End, Gerente Comercial, Agrônomo..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] font-semibold"
                  />
                </div>

                {/* Company Name */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Nome da Empresa *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Tecnologia Goiás S.A., AgroCerrado, Estúdio Criativo..."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Location */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Cidade / Localização GO</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Goiânia, GO">Goiânia, GO</option>
                    <option value="Aparecida de Goiânia, GO">Aparecida de Goiânia, GO</option>
                    <option value="Anápolis, GO">Anápolis, GO</option>
                    <option value="Rio Verde, GO">Rio Verde, GO</option>
                    <option value="Trindade, GO">Trindade, GO</option>
                    <option value="Catalão, GO">Catalão, GO</option>
                    <option value="Itumbiara, GO">Itumbiara, GO</option>
                    <option value="Jataí, GO">Jataí, GO</option>
                    <option value="Remoto">100% Remoto</option>
                    <option value="Outra">Outra Cidade GO...</option>
                  </select>
                </div>

                {/* Custom City if "Outra" is chosen */}
                {location === 'Outra' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Escreva o Nome da Cidade *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Caldas Novas, GO"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-[#00E5FF] text-xs focus:outline-none"
                    />
                  </div>
                )}

                {/* Modality */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Modalidade</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as any)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto (Home Office)</option>
                  </select>
                </div>

                {/* Level */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Nível de Experiência</label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value as any)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                  >
                    <option value="Estágio">Estágio</option>
                    <option value="Júnior">Júnior</option>
                    <option value="Pleno">Pleno</option>
                    <option value="Sênior">Sênior</option>
                    <option value="Gerência">Gerência / Diretoria</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Salary */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Faixa Salarial / Remuneração</label>
                  <input
                    type="text"
                    placeholder="Ex: R$ 4.500 - R$ 6.000, ou R$ 8.000 + Comissões, ou A Combinar"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                  />
                </div>

                {/* Company Logo url */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Link do Logotipo da Empresa (Opcional)</label>
                  <input
                    type="url"
                    placeholder="Cole aqui a URL de imagem do logotipo ou deixe em branco para logotipo padrão"
                    value={companyLogo}
                    onChange={(e) => setCompanyLogo(e.target.value)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Requirements */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Requisitos Rápidos (Em bullet points ou uma frase)</label>
                <input
                  type="text"
                  placeholder="Ex: Formação em Agronomia, CNH B. Ou: Experiência em React, Node, Git, Inglês técnico."
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Descrição Detalhada do Cargo *</label>
                <textarea
                  required
                  placeholder="Escreva sobre as atividades, atribuições diárias, o perfil esperado e o que a empresa oferece de benefícios e diferenciais..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Email */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">E-mail para Candidatura *</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: rh@empresa.com.br"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] font-mono"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase font-mono">Telefone de Contato (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: (62) 3212-9000"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full bg-[#1A1A32] text-white p-2.5 rounded-xl border border-white/10 text-xs focus:outline-none focus:border-[#00E5FF] font-mono"
                  />
                </div>
              </div>

              {/* Form Submission Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('browse')}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#00E676] hover:bg-[#00c853] text-[#0A0A14] hover:opacity-95 font-black text-xs uppercase tracking-wide rounded-xl cursor-pointer flex items-center gap-1.5 shadow-lg shadow-[#00E676]/15"
                >
                  <CheckCircle className="w-4 h-4" /> Publicar Vaga Agora
                </button>
              </div>

            </form>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
