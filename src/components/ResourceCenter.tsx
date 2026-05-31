import { useState } from 'react';
import { ResourceDownload, User } from '../types';
import { Download, FileText, Sparkles, FolderDown, ArrowUpRight, HelpCircle, Lock, Unlock } from 'lucide-react';

interface ResourceCenterProps {
  resources: ResourceDownload[];
  currentUser: User | null;
  onDownloadTracked: (resId: string) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  hasPremiumUnlimitedAccess?: boolean;
  onUnlockTrigger?: () => void;
  onUserUpdate?: (user: User) => void;
}

export default function ResourceCenter({
  resources, currentUser, onDownloadTracked, showNotification, hasPremiumUnlimitedAccess = false, onUnlockTrigger, onUserUpdate
}: ResourceCenterProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const getDetailedAIResourceHTML = (title: string, category: string) => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RAWTHINK AI Curriculum: ${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;700&family=Inter:wght@400;600;800&family=JetBrains+Mono&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      color: #2D251E;
      background-color: #FFFFFF;
      line-height: 1.7;
      margin: 0;
      padding: 50px;
    }
    
    .certificate-container {
      max-width: 800px;
      margin: 0 auto;
      border: 12px double #C19A6B;
      padding: 40px;
      background-color: #FDFBF7;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(92, 64, 51, 0.08);
    }
    
    .logo-header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #C19A6B;
      padding-bottom: 15px;
    }
    
    .logo-text {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 26px;
      font-weight: 800;
      color: #5C4033;
      letter-spacing: 2px;
      margin: 0;
    }
    
    .tagline {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      color: #C19A6B;
      text-transform: uppercase;
      margin-top: 5px;
    }
    
    h1 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 24px;
      color: #5C4033;
      margin-top: 0;
    }
    
    .category-badge {
      display: inline-block;
      background-color: #5C4033;
      color: #F7F1E8;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 12px;
      border-radius: 99px;
      margin-bottom: 20px;
      text-transform: uppercase;
      letter-spacing: 1.2px;
    }
    
    .article-block {
      background-color: #FFFFFF;
      border: 1px solid #EBE4D8;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 25px;
    }
    
    .article-block h2 {
      font-family: 'Space Grotesk', sans-serif;
      font-size: 16px;
      color: #5C4033;
      margin-top: 0;
      border-left: 4px solid #C19A6B;
      padding-left: 10px;
    }
    
    .code-box {
      font-family: 'JetBrains Mono', monospace;
      color: #2D251E;
      background-color: #F4EFEB;
      border: 1px solid #DED6C7;
      padding: 16px;
      border-radius: 6px;
      font-size: 12px;
      overflow-x: auto;
      white-space: pre-wrap;
      margin: 15px 0;
    }
    
    .footer-stamp {
      text-align: center;
      margin-top: 40px;
      padding-top: 25px;
      border-top: 1px solid #EBE4D8;
    }
    
    .stamp-seal {
      display: inline-block;
      border: 2px dashed #C19A6B;
      color: #C19A6B;
      padding: 8px 16px;
      font-size: 12px;
      font-weight: bold;
      text-transform: uppercase;
      transform: rotate(-3deg);
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="certificate-container">
    <div class="logo-header">
      <p class="logo-text">RAWTHINK AI ACADEMY</p>
      <div class="tagline">Learn AI. Build Faster. Stay Ahead.</div>
    </div>
    
    <div style="text-align: center;">
      <span class="category-badge">${category}</span>
      <h1>${title}</h1>
      <p style="font-size: 11px; opacity: 0.7; font-family: 'JetBrains Mono', monospace;">Verified Study Item ID: rt-kit-${Math.floor(Math.random()*9000+1000)} • Issued for Nepal</p>
    </div>
    
    <div class="article-block">
      <h2>1. The Foundation Paradigm</h2>
      <p>This study-guide covers structured Prompt Engineering sequences designed for immediate system implementation. Large Language Models operate on probability tokens. By writing strict contextual guidelines, developers can constrain hallucination matrices by up to 94.5%.</p>
    </div>
    
    <div class="article-block">
      <h2>2. Production System Prompt Template</h2>
      <p>Copy and utilize this production-ready blueprint system prompt directly within your client API or IDE setups (e.g., Cursor IDE system guidelines):</p>
      <div class="code-box">&lt;system-rules&gt;
- Role: Senior Software Architect and Educational Mentor
- Tone: Highly logical, minimalist, no sales hype
- Constraints: 
  * Explicitly anchor all assertions inside reputable textbooks or API docs.
  * If unsure or missing environment variables, fallback gracefully.
  * Do not output mock data when live database targets exist.
&lt;/system-rules&gt;</div>
    </div>
    
    <div class="article-block">
      <h2>3. Kathmandu, Nepal Deployment Guide</h2>
      <p>Configure local environment files to support Saturdays live execution. If deploying APIs inside Nepal, ensure you verify that your payment gateway callbacks are mapped to localized servers (e.g. eSewa or Khalti response targets at Pepsicola, Suncity, Kathmandu).</p>
    </div>
    
    <div class="footer-stamp">
      <div class="stamp-seal">RAWTHINK AI OFFICIAL CURRICULUM • VERIFIED PRODUCT</div>
      <p style="font-size: 10px; margin-top: 15px; opacity: 0.6;">Authorized Signature: Er. Sandesh Shrestha (Head of Platform Engineering)</p>
    </div>
  </div>
</body>
</html>`;
  };

  const isResourceUnlocked = (res: ResourceDownload, idx: number) => {
    if (hasPremiumUnlimitedAccess) return true;
    // The first 2 resources are fully free for all students
    if (idx < 2) return true;
    // Check if user has unlocked it with coins
    if (currentUser?.unlockedResources?.includes(res.id)) return true;
    return false;
  };

  const triggerDownload = async (res: ResourceDownload, idx: number) => {
    const unlocked = isResourceUnlocked(res, idx);

    if (!unlocked) {
      if (!currentUser) {
        showNotification('⚠️ LOCKED! Please login to your student profile to unlock this premium resource with coins.', 'error');
        return;
      }

      const confirmUnlock = window.confirm(`🪙 Unlock "${res.title}" permanently for 50 Coins?\nYour current coin balance: ${currentUser.points || 0} Coins.`);
      if (!confirmUnlock) return;

      if ((currentUser.points || 0) < 50) {
        showNotification('❌ Insufficient Coins! This guide costs 50 coins. Register/Enroll for a class or refer friends to quickly earn coins!', 'error');
        return;
      }

      setDownloadingId(res.id);
      try {
        const resp = await fetch('/api/resources/unlock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.id,
            resourceId: res.id
          })
        });

        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data.error || 'Failed to unlock resource with coins.');
        }

        if (onUserUpdate) {
          onUserUpdate({
            ...currentUser,
            points: data.points,
            unlockedResources: data.unlockedResources,
            badges: data.badges
          });
        }

        showNotification(`🎉 Successfully unlocked "${res.title}" with 50 coins! Starting download...`, 'success');
      } catch (err: any) {
        showNotification(err.message || 'Unlock failed.', 'error');
        setDownloadingId(null);
        return;
      }
    }

    setDownloadingId(res.id);
    try {
      // Send tracking update to the API
      const resp = await fetch(`/api/resources/download/${res.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id })
      });

      if (!resp.ok) {
        throw new Error('Could not track downloads on server');
      }

      // Sync points back to client because download tracks points tracker too (+5 study points)
      const data = await resp.json();
      if (currentUser && onUserUpdate) {
        onUserUpdate({
          ...currentUser,
          points: (currentUser.points || 0) + 5,
          badges: currentUser.badges.includes('Knowledge Seeker') ? currentUser.badges : [...currentUser.badges, 'Knowledge Seeker']
        });
      }

      onDownloadTracked(res.id);

      // Produce exact AI detailed HTML dynamic document
      const docContent = getDetailedAIResourceHTML(res.title, res.category);
      const blob = new Blob([docContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rawthink_${res.title.replace(/\s+/g, '_').toLowerCase()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showNotification(`"${res.title}" premium educational guide downloaded successfully! Earned +5 study points!`, 'success');
    } catch (e) {
      showNotification('Downloading error. Attempting manual download.', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-brand-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Caption Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Curated Master Kits</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark tracking-tight mt-1 mb-2">
            Free Resource Center
          </h2>
          <p className="font-sans text-xs sm:text-sm text-brand-dark/70">
            Gain lifetime study access to AI prompt templates, cheat sheets, and Cursor configurations built for Nepal.
          </p>
        </div>

        {/* GATING LIMIT REPORT FOR RESOURCES */}
        {!hasPremiumUnlimitedAccess && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 text-brand-dark p-4.5 rounded-2xl max-w-3xl mx-auto mb-8 text-left space-y-2.5 shadow-sm text-xs relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
              <div className="space-y-1">
                <p className="font-bold text-amber-900 flex items-center space-x-1">
                  <span className="animate-ping w-2 h-2 rounded-full bg-amber-500 inline-block mr-1" />
                  <span>⚠️ Gated Student Core Resources (Limited Mode Active)</span>
                </p>
                <p className="text-brand-dark/75 leading-relaxed text-[11px] sm:text-xs">
                  Only the introductory companion study kit is unlocked on the free tier. Please **Register/Enroll in at least 1 class** or **Refer 10 friends** using your invitation code to immediately unlock unlimited downloads of all 6+ detailed AI master guides!
                </p>
              </div>
              {onUnlockTrigger && (
                <button
                  onClick={onUnlockTrigger}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold rounded-xl whitespace-nowrap text-[11px] transition shadow cursor-pointer text-center"
                >
                  Unlock Unlimited Downloads
                </button>
              )}
            </div>
            <div className="absolute top-1/2 right-4 -translate-y-1/2 text-amber-500/10 rotate-12">
              <Lock size={120} />
            </div>
          </div>
        )}

        {/* Resources Cards Grid */}
        <div id="resources-cards-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((res, idx) => {
            const unlocked = isResourceUnlocked(res, idx);
            const isFreeGuide = idx < 2;
            return (
              <div 
                key={res.id}
                className={`bg-[#FDFBF7] rounded-2xl p-6 border-2 shadow-sm transition-all flex flex-col justify-between relative overflow-hidden ${
                  unlocked 
                    ? 'border-brand-primary/5 hover:shadow-md'
                    : 'border-brand-primary/5 opacity-90'
                }`}
              >
                <div>
                  {/* Visually Locked Layer overlay */}
                  {!unlocked && (
                    <div className="absolute inset-0 bg-[#FDFBF7]/90 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-4 z-20 transition-all duration-300">
                      <div className="p-2.5 bg-amber-50 rounded-full text-brand-primary border border-amber-200 shadow mb-2 animate-bounce">
                        <Lock size={16} />
                      </div>
                      <p className="text-xs font-black text-brand-dark uppercase tracking-wider">Premium Resource Guide</p>
                      <p className="text-[10px] text-brand-dark/75 max-w-[170px] leading-tight font-semibold mt-1">
                        Unlock with <span className="text-brand-primary font-black">50 Coins</span> OR register a class
                      </p>
                      <button 
                        onClick={() => triggerDownload(res, idx)}
                        className="mt-4 px-4 py-1.5 bg-[#C19A6B] text-white text-[10px] hover:bg-[#5C4033] rounded-full font-bold transition shadow-sm cursor-pointer"
                      >
                        Spend 50 Coins
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 rounded-xl bg-brand-primary/10 text-brand-primary">
                      <FileText size={20} />
                    </div>
                    <span className="text-[10px] bg-brand-cream text-brand-dark/70 border border-brand-primary/10 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                      {res.category}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-brand-dark mb-2 flex items-center space-x-1.5">
                    <span>{res.title}</span>
                    {unlocked && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-tight border ${
                        isFreeGuide 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-100' 
                          : 'text-brand-primary bg-amber-50 border-brand-primary/20'
                      }`}>
                        {isFreeGuide ? 'Free Access' : 'Unlocked'}
                      </span>
                    )}
                  </h3>
                  
                  <p className="text-xs text-brand-dark/65 mb-5 flex items-center space-x-1">
                    <span className="font-mono font-semibold text-brand-primary">{res.fileSize}</span>
                    <span>•</span>
                    <span>Dynamic PDF Auto-Generation</span>
                  </p>
                </div>

                {/* Download tracking and counter footer trigger */}
                <div className="pt-4 border-t border-brand-primary/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-brand-dark/50">Downloads: </p>
                    <p className="text-xs font-bold text-brand-dark">{res.downloadsCount || 0} Registered</p>
                  </div>

                  <button
                    id={`download-${res.id}`}
                    onClick={() => triggerDownload(res, idx)}
                    disabled={downloadingId === res.id}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-brand-primary text-brand-white rounded-xl text-xs font-bold hover:bg-brand-primary/95 transition-all shadow-sm shrink-0 cursor-pointer disabled:opacity-50 z-10"
                  >
                    {unlocked ? <Download size={12} /> : <Lock size={12} />}
                    <span>{downloadingId === res.id ? 'Saving...' : unlocked ? 'Download Now' : 'Coins Lock'}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Helpful hints section */}
        <div className="mt-12 bg-brand-cream/30 border border-brand-primary/15 rounded-2xl p-5 max-w-3xl mx-auto flex items-start space-x-4">
          <div className="p-1.5 bg-brand-primary text-brand-white rounded-full mt-0.5">
            <HelpCircle size={16} />
          </div>
          <div>
            <h4 className="font-display font-bold text-xs sm:text-sm text-brand-dark mb-1">Studying & Earning Point System</h4>
            <p className="font-sans text-xs text-brand-dark/75 leading-relaxed">
              When logged into your student profile, each guidelines download tracks a point increment of <span className="font-bold text-brand-primary">+5 study points</span> directly on your active streak metrics. Accumulate points to unlock special badges and earn top rank on our leaderboard.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
