import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Users, Award, Calendar, ChevronRight, Download, ArrowRight, Star } from 'lucide-react';

interface LandingHeroProps {
  setView: (view: string) => void;
  onDownloadClick: () => void;
}

export default function LandingHero({ setView, onDownloadClick }: LandingHeroProps) {
  // Animated statistics counters matching Sleek Interface design
  const [studentsCount, setStudentsCount] = useState(12000);
  const [workshopsCount, setWorkshopsCount] = useState(45);
  const [certsCount, setCertsCount] = useState(180);
  const [communityCount, setCommunityCount] = useState(25000);

  useEffect(() => {
    // Elegant tiny counting transition for a sleek premium touch
    const timer = setTimeout(() => {
      setStudentsCount(12850);
      setWorkshopsCount(45);
      setCertsCount(180);
      setCommunityCount(25000);
    }, 150);
    return () => clearTimeout(timer);
  }, []);

  const scrollToCourses = () => {
    const element = document.getElementById('courses-section-header');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      setView('courses');
    }
  };

  return (
    <div className="bg-white text-[#5C4033] font-sans pb-16 pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6">
        
        {/* Left Hero & Stats Column */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-[#F7F1E8] rounded-3xl p-6 sm:p-10 flex-grow flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 text-left">
              <span className="bg-white/60 text-[#C19A6B] px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 inline-block italic">
                ✨ Premium EdTech Community
              </span>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight mb-4 tracking-tighter text-[#5C4033]">
                Master AI <br />
                <span className="text-[#C19A6B]">Before Everyone Else.</span>
              </h1>
              
              <p className="text-sm sm:text-lg text-[#5C4033]/80 max-w-md mb-8 leading-relaxed font-medium">
                Live workshops, practical demonstrations, and industry certificates for Nepal's next generation of builders. No slideshow overlays, only real-world code.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={scrollToCourses}
                  className="bg-[#5C4033] text-white px-8 py-3.5 rounded-2xl font-bold hover:opacity-90 transition-all shadow-md text-xs sm:text-sm flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Explore Classes</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => setView('resources')}
                  className="bg-white text-[#5C4033] border border-[#F7F1E8] px-8 py-3.5 rounded-2xl font-bold shadow-sm hover:bg-[#FDFBF7] transition-all text-xs sm:text-sm cursor-pointer"
                >
                  Free Guide & Resources
                </button>
              </div>
            </div>
            
            {/* Abstract Decorative Background Glowing Sphere */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C19A6B]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          </div>

          {/* Stats Counter Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-[#F7F1E8] p-4 rounded-2xl text-center shadow-sm hover:scale-[1.02] transition">
              <div className="text-xl sm:text-2xl font-black text-[#5C4033]">{studentsCount.toLocaleString()}+</div>
              <div className="text-[10px] uppercase tracking-wider opacity-60 font-black">Students</div>
            </div>
            <div className="bg-white border border-[#F7F1E8] p-4 rounded-2xl text-center shadow-sm hover:scale-[1.02] transition">
              <div className="text-xl sm:text-2xl font-black text-[#5C4033]">{workshopsCount}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-60 font-black">Workshops</div>
            </div>
            <div className="bg-white border border-[#F7F1E8] p-4 rounded-2xl text-center shadow-sm hover:scale-[1.02] transition">
              <div className="text-xl sm:text-2xl font-black text-[#5C4033]">{certsCount}+</div>
              <div className="text-[10px] uppercase tracking-wider opacity-60 font-black">Certificates</div>
            </div>
            <div className="bg-white border border-[#F7F1E8] p-4 rounded-2xl text-center shadow-sm hover:scale-[1.02] transition">
              <div className="text-xl sm:text-2xl font-black text-[#5C4033]">{communityCount.toLocaleString()}</div>
              <div className="text-[10px] uppercase tracking-wider opacity-60 font-black">Community</div>
            </div>
          </div>
        </div>

        {/* Right Featured Column */}
        <div className="col-span-12 lg:col-span-5 flex flex-col justify-between space-y-4 text-left">
          <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#C19A6B] mb-1 px-1 flex items-center space-x-1">
            <Sparkles size={14} />
            <span>Featured Workshops</span>
          </div>

          {/* Course Card 1 */}
          <div 
            onClick={scrollToCourses}
            className="group cursor-pointer bg-white border-2 border-[#F7F1E8] hover:border-[#C19A6B] p-4 rounded-2xl flex items-center gap-4 transition-all hover:shadow-md"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#F7F1E8] rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">
              🧠
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start gap-1">
                <h3 className="font-bold text-sm sm:text-base text-[#5C4033] truncate">AI Foundations Bootcamp</h3>
                <span className="text-xs sm:text-sm font-bold text-[#C19A6B] shrink-0">Rs. 299</span>
              </div>
              <p className="text-xs text-[#5C4033]/70 mb-2 truncate">1 Hour • AI Basics, ChatGPT, Prompting</p>
              <div className="flex gap-1.5">
                <span className="bg-[#F7F1E8] text-[9px] px-2 py-0.5 rounded-full uppercase font-bold text-[#5C4033]/85">PDF Guide</span>
                <span className="bg-[#F7F1E8] text-[9px] px-2 py-0.5 rounded-full uppercase font-bold text-[#5C4033]/85">Certificate</span>
              </div>
            </div>
            <button className="p-2 bg-[#F7F1E8] group-hover:bg-[#C19A6B] group-hover:text-white rounded-full transition-colors shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Course Card 2 */}
          <div 
            onClick={scrollToCourses}
            className="group cursor-pointer bg-[#F7F1E8] p-4 rounded-2xl flex items-center gap-4 relative overflow-hidden transition-all hover:shadow-sm hover:border-brand-primary"
          >
            <div className="absolute top-0 right-0 bg-[#C19A6B] text-white text-[8px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
              Most Popular
            </div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl flex items-center justify-center text-2xl sm:text-3xl shrink-0">
              ⚡
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-start gap-1">
                <h3 className="font-bold text-sm sm:text-base text-[#5C4033] truncate">Productivity Masterclass</h3>
                <span className="text-xs sm:text-sm font-bold text-[#5C4033] shrink-0">Rs. 349</span>
              </div>
              <p className="text-xs text-[#5C4033]/70 mb-2 truncate">2 Hours • Advanced Prompting & Systems</p>
              <div className="flex gap-1.5">
                <span className="bg-white text-[9px] px-2 py-0.5 rounded-full uppercase font-bold text-[#5C4033]/85">100+ Templates</span>
              </div>
            </div>
            <button className="p-2 bg-white rounded-full shrink-0">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Certificate Preview Box */}
          <div className="mt-auto bg-gradient-to-br from-[#5C4033] to-[#2D1B14] rounded-3xl p-6 text-white flex flex-col items-center text-center shadow-lg">
            <div className="w-12 h-12 mb-3 border border-white/20 flex items-center justify-center rounded-lg bg-white/5 shadow-inner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C19A6B" strokeWidth="1.5">
                <path d="M12 15l-2 5 2-1 2 1-2-5z" />
                <circle cx="12" cy="9" r="6" />
              </svg>
            </div>
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-1 text-white">Official Certification</h4>
            <p className="text-[10px] opacity-70 mb-4 font-sans">Verified by Rawthink AI Global Network</p>
            <button 
              onClick={() => {
                const testSec = document.getElementById('testimonials-section');
                if (testSec) {
                  testSec.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="w-full py-2.5 bg-white text-[#5C4033] rounded-xl text-[10px] font-bold tracking-widest uppercase hover:bg-[#C19A6B] hover:text-white transition-colors cursor-pointer"
            >
              PREVIEW CERTIFICATE PATH
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
