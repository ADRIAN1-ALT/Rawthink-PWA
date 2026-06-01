import { useState } from 'react';
import { AITool, User } from '../types';
import { 
  Search, Filter, ExternalLink, Code, Sparkles, MessageSquare, 
  Palette, BookOpen, Tv, Briefcase, Cpu, Lock, Unlock, Zap
} from 'lucide-react';

interface ToolsDirectoryProps {
  tools: AITool[];
  hasPremiumUnlimitedAccess?: boolean;
  onUnlockTrigger?: () => void;
  currentUser?: User | null;
  showNotification?: (msg: string, type: 'success'|'error'|'info') => void;
  onUserUpdate?: (user: User) => void;
}

export default function ToolsDirectory({ tools, hasPremiumUnlimitedAccess = false, onUnlockTrigger, currentUser, showNotification, onUserUpdate }: ToolsDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [unlockingToolId, setUnlockingToolId] = useState<string | null>(null);

  const categories = ['All', 'Writing', 'Image', 'Video', 'Coding', 'Research', 'Presentation', 'Productivity'];

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Writing': return <Briefcase size={14} />;
      case 'Image': return <Palette size={14} />;
      case 'Video': return <Tv size={14} />;
      case 'Coding': return <Code size={14} />;
      case 'Research': return <BookOpen size={14} />;
      case 'Presentation': return <Sparkles size={14} />;
      default: return <Cpu size={14} />;
    }
  };

  // We unlock 'ChatGPT' and 'Perplexity AI' for free tier users, others require lock
  const isToolUnlocked = (tool: AITool) => {
    if (hasPremiumUnlimitedAccess) return true;
    const nameLower = tool.name.toLowerCase();
    if (nameLower.includes('chatgpt') || nameLower.includes('perplexity')) return true;
    if (currentUser && currentUser.unlockedTools && currentUser.unlockedTools.includes(tool.id)) return true;
    return false;
  };

  const triggerToolUnlock = async (tool: AITool) => {
    if (!currentUser) {
      showNotification && showNotification('Please login to unlock tools with coins.', 'info');
      return;
    }

    const balanceNow = (currentUser.coins ?? currentUser.points ?? 0);
    const confirmUnlock = window.confirm(`🪙 Unlock "${tool.name}" permanently for 50 Coins?\nYour current coin balance: ${balanceNow} Coins.`);
    if (!confirmUnlock) return;

    if (balanceNow < 50) {
      showNotification && showNotification('❌ Insufficient Coins! This tool costs 50 coins.', 'error');
      return;
    }

    setUnlockingToolId(tool.id);
    try {
      const resp = await fetch('/api/tools/unlock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, toolId: tool.id }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Failed to unlock tool');

      if (onUserUpdate) {
        onUserUpdate({
          ...currentUser,
          coins: data.coins ?? currentUser.coins,
          coinsInvested: data.coinsInvested ?? currentUser.coinsInvested,
          unlockedTools: data.unlockedTools ?? currentUser.unlockedTools,
          badges: data.badges ?? currentUser.badges
        });
      }

      showNotification && showNotification(`🎉 Unlocked ${tool.name} successfully!`, 'success');
    } catch (err: any) {
      showNotification && showNotification(err.message || 'Unlock failed.', 'error');
    } finally {
      setUnlockingToolId(null);
    }
  };

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tool.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-brand-cream/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Caption */}
        <div id="tools-section-caption" className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold tracking-widest text-[#C19A6B] uppercase">Academic Generative Stack</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark tracking-tight mt-1 mb-2">
            AI Tools Directory
          </h2>
          <p className="font-sans text-xs sm:text-sm text-brand-dark/70">
            Browse the curated index of artificial intelligence sandboxes. Learn prompt sequencing, video workflows, and visual asset automation.
          </p>
        </div>

        {/* GATING LOCK STATUS NOTIFICATION BOX */}
        {!hasPremiumUnlimitedAccess && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-brand-dark p-4.5 rounded-2xl max-w-3xl mx-auto mb-8 text-left space-y-2.5 shadow-sm text-xs relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="space-y-1">
                <p className="font-bold text-amber-900 flex items-center space-x-1">
                  <span className="animate-ping w-2 h-2 rounded-full bg-amber-500 inline-block mr-1" />
                  <span>⚠️ AI Tool Usage Restriction (Limited Sandbox Active)</span>
                </p>
                <p className="text-brand-dark/75 leading-relaxed text-[11px] sm:text-xs">
                  To protect server usage patterns, you are currently restricted to basic access (ChatGPT & Perplexity only). Please **Register/Enroll in at least 1 class** or **Refer 10 friends** using your invitation code to instantly unlock all 20+ advanced AI tools!
                </p>
              </div>
              {onUnlockTrigger && (
                <button
                  onClick={onUnlockTrigger}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl whitespace-nowrap text-[11px] transition shadow cursor-pointer text-center"
                >
                  Unlock Unlimited Premium Tools
                </button>
              )}
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-amber-500/10 rotate-12">
              <Lock size={120} />
            </div>
          </div>
        )}

        {/* Search & Simple Controls */}
        <div className="max-w-3xl mx-auto mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-brand-dark/40" size={18} />
            <input
              type="text"
              id="search-tools-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tools by name, utility description, or tags (e.g. LLM, Cursor, Free)..."
              className="w-full pl-12 pr-4 py-3 bg-brand-white border border-brand-primary/20 rounded-2xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/30 text-brand-dark shadow-sm"
            />
          </div>

          {/* Quick Filter badging pills - Horizontal Scrolling with hide-scrollbar */}
          <div className="flex space-x-2 overflow-x-auto pb-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center space-x-1 px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-brand-dark text-brand-cream shadow-sm'
                    : 'bg-brand-white text-brand-dark/80 hover:bg-brand-primary/10 border border-brand-primary/10'
                }`}
              >
                {cat !== 'All' && <span className="opacity-75">{getCategoryIcon(cat)}</span>}
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Result Cards Listing */}
        {filteredTools.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => {
              const unlocked = isToolUnlocked(tool.name);
              return (
                <div 
                  key={tool.id}
                  className={`bg-brand-white rounded-xl border p-5 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden ${
                    unlocked 
                      ? 'border-brand-primary/10 hover:shadow-md' 
                      : 'border-brand-primary/5 bg-brand-white/70 select-none opacity-80'
                  }`}
                >
                  <div>
                    {/* Visual locked watermark layer */}
                    {!unlocked && (
                      <div className="absolute inset-0 bg-brand-cream/45 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4 z-20">
                        <div className="p-2.5 bg-brand-white/95 rounded-full text-brand-primary border border-brand-primary/25 shadow-md mb-2 animate-bounce">
                          <Lock size={18} />
                        </div>
                        <p className="text-[11px] font-bold text-brand-dark uppercase tracking-wider">Premium AI Tool</p>
                        <p className="text-[10px] text-amber-800 bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg font-black mt-2 max-w-[165px] leading-tight text-center shadow-sm">
                          ⚠️ ENROLLING IN A CLASS OR 10 REFERRALS REQUIRED
                        </p>
                        <div className="mt-3">
                          <button
                            onClick={() => triggerToolUnlock(tool)}
                            disabled={unlockingToolId === tool.id}
                            className="mt-2 px-4 py-1.5 bg-[#C19A6B] text-white text-[10px] hover:bg-[#5C4033] rounded-full font-bold transition shadow-sm cursor-pointer"
                          >
                            {unlockingToolId === tool.id ? 'Unlocking...' : 'Unlock for 50 Coins'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-cream flex items-center justify-center text-brand-primary shadow-inner">
                          {getCategoryIcon(tool.category)}
                        </div>
                        <span className="text-[10px] uppercase font-black text-brand-primary tracking-wider">{tool.category}</span>
                      </div>

                      {unlocked ? (
                        <a 
                          href={tool.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1 px-2 rounded-lg bg-brand-cream/45 text-brand-dark/75 hover:bg-brand-primary/15 hover:text-brand-dark text-[10px] font-bold flex items-center space-x-1 transition z-10"
                        >
                          <span>Launch</span>
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="p-1 px-2 rounded-lg bg-red-50 text-red-800 text-[10px] font-bold flex items-center space-x-0.5 border border-red-200">
                          <span>Locked</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-display font-bold text-base text-brand-dark mb-1.5 flex items-center space-x-1.5">
                      <span>{tool.name}</span>
                      {unlocked && <span className="text-emerald-600 text-[10px] bg-emerald-50 px-1 py-0.5 rounded leading-none">Free-Play</span>}
                    </h3>
                    
                    <p className="font-sans text-xs text-brand-dark/75 leading-relaxed mb-4">
                      {tool.description}
                    </p>
                  </div>

                  {/* Tag pill badges */}
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-brand-primary/5">
                    {tool.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-brand-cream text-brand-dark/80 shrink-0 uppercase tracking-tight"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-brand-primary/10 max-w-xl mx-auto">
            <p className="text-xs sm:text-sm font-semibold text-brand-dark/80">No AI tools matching "{searchQuery}" could be located.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
              className="mt-3 text-xs font-bold text-brand-primary underline"
            >
              Reset Directories filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
