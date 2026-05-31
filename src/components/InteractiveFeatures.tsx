import { 
  Tv, Cpu, PenTool, Award, Users, BookOpen, Clock, Code 
} from 'lucide-react';

export default function InteractiveFeatures() {
  const feats = [
    {
      title: 'AI Workshops',
      desc: 'Live interactive classes on Saturdays with hands-on, step-by-step guidance tailored for complete beginners.',
      icon: Tv,
      color: 'bg-amber-500/10 text-amber-700'
    },
    {
      title: 'Practical Demonstrations',
      desc: 'Observe actual prompt workflows, code copilots and automation nodes built live on-screen.',
      icon: Cpu,
      color: 'bg-emerald-500/10 text-emerald-700'
    },
    {
      title: 'Prompt Engineering',
      desc: 'Master robust system role blueprints, context structures, delimiters, and programmatic API variables.',
      icon: PenTool,
      color: 'bg-indigo-500/10 text-indigo-700'
    },
    {
      title: 'Career Certificates',
      desc: 'Acquire digital excellence credentials certified by RAWTHINK AI after active program completions.',
      icon: Award,
      color: 'bg-rose-500/10 text-rose-700'
    },
    {
      title: 'Local Community Access',
      desc: 'Discuss lessons, showcase active student MVPs, and network within a highly supportive network in Nepal.',
      icon: Users,
      color: 'bg-sky-500/10 text-sky-700'
    },
    {
      title: 'Free Resource Library',
      desc: 'Direct zero-auth access to comprehensive PDF booklets, cheat sheets, and categorized tools directory.',
      icon: BookOpen,
      color: 'bg-teal-500/10 text-teal-700'
    },
    {
      title: 'Workshop Recordings',
      desc: 'Replay raw session lecture footage anytime at your convenience with complete life validity.',
      icon: Clock,
      color: 'bg-purple-500/10 text-purple-700'
    },
    {
      title: 'AI Development Training',
      desc: 'Build secure React server-side proxies, use the GoogleGenAI SDK, and deploy production nodes.',
      icon: Code,
      color: 'bg-cyan-500/10 text-cyan-700'
    }
  ];

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Caption Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark tracking-tight mb-3">
            Why Learn with RAWTHINK AI?
          </h2>
          <p className="font-sans text-sm text-brand-dark/70">
            A premium educational ecosystem optimized for modern professionals, freelancers, and developers. No boring slideshows, only high-velocity live execution.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {feats.map((f, idx) => {
            const IconComponent = f.icon;
            return (
              <div 
                key={idx}
                className="group relative bg-[#FDFBF7] rounded-2xl p-6 border border-brand-primary/10 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 overflow-hidden"
              >
                {/* Accent glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10">
                  {/* Icon Block */}
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    <IconComponent size={24} />
                  </div>

                  <h3 className="font-display font-bold text-base text-brand-dark mb-2 group-hover:text-brand-primary transition-colors">
                    {f.title}
                  </h3>
                  
                  <p className="font-sans text-xs text-brand-dark/70 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
