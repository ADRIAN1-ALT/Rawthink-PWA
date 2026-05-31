import { useState, useEffect } from 'react';
import { User } from '../types';
import { Menu, X, Download, User as UserIcon, LogOut, Code, Sparkles, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  currentView: string;
  setView: (view: string) => void;
  onLogout: () => void;
  deferredPrompt: any;
  setDeferredPrompt: (prompt: any) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Navbar({ 
  currentUser, currentView, setView, onLogout, deferredPrompt, setDeferredPrompt, theme, onToggleTheme 
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detect iOS to display custom native install directions
    const checkIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isApple = /iphone|ipad|ipod/.test(userAgent);
      const isStandalone = ('standalone' in window.navigator) && ((window.navigator as any).standalone);
      setIsIOS(isApple && !isStandalone);
    };
    checkIOS();
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA installer decision outcome: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      // Prompt instructional screen
      setShowInstallGuide(true);
    }
  };

  const navItems = [
    { id: 'courses', label: 'Explore Classes' },
    { id: 'resources', label: 'Free Resources' },
    { id: 'tools', label: 'AI Tools' },
    { id: 'quiz', label: 'Play Quiz' },
    { id: 'community', label: 'Discussions' },
  ];

  const handleNavClick = (viewId: string) => {
    setView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      theme === 'dark' ? 'bg-[#2A1F17] border-b border-[#382B21] text-[#F7F1E8]' : 'bg-white border-b border-[#F7F1E8]'
    }`}>
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Custom Styled Brand Logo - RT RAWTHINK Ai ACADEMY */}
          <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => handleNavClick('courses')}>
            <div className="relative w-9 h-9 bg-[#C19A6B] rounded-xl flex items-center justify-center text-white font-black font-display text-sm shadow-md overflow-hidden shrink-0 border border-[#C19A6B]/20">
              <span className="text-white text-base tracking-tighter">RT</span>
              <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-[#5C4033] rounded-tl-lg" />
            </div>
            <div className="text-left leading-none">
              <span className={`text-sm font-black font-display tracking-widest uppercase block ${
                theme === 'dark' ? 'text-white' : 'text-[#5C4033]'
              }`}>RAWTHINK</span>
              <span className="text-[10px] font-mono tracking-widest text-[#C19A6B] block mt-0.5">Ai ACADEMY</span>
            </div>
          </div>

          {/* Desktop Navigation Links - matches design's hover/active patterns */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-all ${
                  currentView === item.id
                    ? theme === 'dark' ? 'bg-brand-primary text-white' : 'bg-[#F7F1E8] text-[#5C4033]'
                    : theme === 'dark' ? 'text-[#F7F1E8]/85 hover:text-[#C19A6B]' : 'text-[#5C4033]/80 hover:text-[#C19A6B]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Action Buttons & Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-full border transition-all cursor-pointer mr-1.5 ${
                theme === 'dark' ? 'border-[#382B21] bg-[#1E1610] text-[#C19A6B] hover:bg-[#382B21]' : 'border-brand-primary/15 bg-brand-cream/15 text-[#5C4033] hover:bg-[#F7F1E8]'
              }`}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* Download app - thin rounded border */}
            <button
              id="install-pwa-desktop"
              onClick={handleInstallClick}
              className="px-4 py-1.5 border border-[#C19A6B] text-[#C19A6B] rounded-full text-xs font-bold hover:bg-[#F7F1E8] transition-all cursor-pointer"
            >
              Download App
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3 pl-2 border-l border-brand-primary/25">
                <button
                  id="nav-dashboard-desktop"
                  onClick={() => setView(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                  className={`flex items-center space-x-1.5 px-5 py-1.5 rounded-full text-xs font-bold shadow-sm transition-all ${
                    ['dashboard', 'admin'].includes(currentView) 
                      ? 'bg-[#5C4033] text-white' 
                      : 'border border-[#5C4033]/60 text-[#5C4033] hover:bg-[#F7F1E8]'
                  }`}
                >
                  <UserIcon size={12} className="shrink-0" />
                  <span>{currentUser.role === 'admin' ? 'Admin Panel' : currentUser.name.split(' ')[0]}</span>
                </button>
                <button
                  id="nav-logout-desktop"
                  onClick={onLogout}
                  className="p-1.5 rounded-full text-red-700 hover:bg-red-50 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-desktop"
                onClick={() => setView('auth')}
                className="px-5 py-1.5 bg-[#C19A6B] text-white rounded-full text-xs font-bold shadow-sm hover:opacity-95 transition-all cursor-pointer"
              >
                Get Started
              </button>
            )}
          </div>

          {/* Mobile Hamburguer trigger */}
          <div className="flex mobile-nav-triggers md:hidden items-center space-x-2">
            {/* Mobile Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                theme === 'dark' ? 'border-[#382B21] bg-[#1E1610] text-[#C19A6B]' : 'border-brand-primary/10 bg-brand-cream/15 text-[#5C4033]'
              }`}
              title="Theme Toggle"
            >
              {theme === 'dark' ? <Sun size={12} /> : <Moon size={12} />}
            </button>

            <button
              id="install-pwa-mobile-badge"
              onClick={handleInstallClick}
              className="flex items-center space-x-1 px-2.5 py-1.5 bg-brand-dark text-white rounded-lg text-xs font-semibold mt-0.5 button-pulse"
            >
              <Download size={12} />
              <span className="text-[10px]">Install</span>
            </button>

            <button
              id="mobile-hamburguer-menu"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-brand-dark hover:bg-brand-primary/10 transition-all"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-t px-4 pt-2 pb-4 space-y-2 animate-fadeIn ${
          theme === 'dark' ? 'bg-[#2A1F17] border-brand-primary/10 text-[#F7F1E8]' : 'glass-panel border-brand-primary/10 text-[#5C4033]'
        }`}>
          {navItems.map((item) => (
            <button
              key={item.id}
              id={`nav-mob-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`block w-full text-left px-4 py-2 rounded-lg text-sm font-medium ${
                currentView === item.id
                  ? 'bg-brand-primary text-brand-white'
                  : 'hover:bg-brand-primary/10'
              }`}
            >
              {item.label}
            </button>
          ))}
          <div className="pt-2 border-t border-brand-primary/15 space-y-2">
            {currentUser ? (
              <>
                <button
                  id="nav-mob-dashboard"
                  onClick={() => handleNavClick(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                  className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-primary/5"
                >
                  <UserIcon size={16} />
                  <span>{currentUser.role === 'admin' ? 'Admin Portal' : 'My Student Dashboard'}</span>
                </button>
                <button
                  id="nav-mob-logout"
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 w-full px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <button
                id="nav-mob-login"
                onClick={() => handleNavClick('auth')}
                className="block text-center w-full py-2 bg-brand-primary text-white rounded-lg text-sm font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      )}

      {/* PWA iOS Instruction Modal overlay */}
      {showInstallGuide && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-brand-white rounded-2xl max-w-sm w-full p-6 shadow-xl relative animate-scaleUp">
            <button 
              id="close-pwa-modal"
              onClick={() => setShowInstallGuide(false)}
              className="absolute top-4 right-4 text-brand-dark/50 hover:text-brand-dark p-1 rounded-full hover:bg-brand-cream transition"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="w-14 h-14 bg-brand-cream rounded-full mx-auto flex items-center justify-center mb-4">
                <Download className="text-brand-primary" size={28} />
              </div>
              <h3 className="font-display font-bold text-lg text-brand-dark mb-1">Download RAWTHINK AI</h3>
              <p className="text-xs text-brand-dark/70 mb-5">
                Enjoy offline lectures, direct prompt caches, and faster course loading on your mobile home screen!
              </p>
            </div>

            {isIOS ? (
              <div className="bg-brand-cream/60 rounded-xl p-4 space-y-3.5 mb-2 text-left">
                <p className="font-display font-semibold text-xs text-brand-dark">For iPhone/iPad Users:</p>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-white text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">1</div>
                  <p className="text-xs text-brand-dark/80">Tap the <span className="font-bold">"Share"</span> icon at the bottom browser rail (looks like a square with upward arrow).</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-white text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">2</div>
                  <p className="text-xs text-brand-dark/80">Scroll down and select <span className="font-bold">"Add to Home Screen"</span> from options list.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-white text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">3</div>
                  <p className="text-xs text-brand-dark/80">Confirm the layout title and click <span className="font-bold">"Add"</span> in the top right corner.</p>
                </div>
              </div>
            ) : (
              <div className="bg-brand-cream/60 rounded-xl p-4 space-y-3 mb-2 text-left">
                <p className="font-display font-semibold text-xs text-brand-dark">Direct Installation:</p>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-white text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">1</div>
                  <p className="text-xs text-brand-dark/80">Open this platform inside Google Chrome or Opera browser on your mobile device.</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-brand-primary text-brand-white text-xs font-bold flex items-center justify-center mt-0.5 shrink-0">2</div>
                  <p className="text-xs text-brand-dark/80">Wait for the <span className="font-bold">"Install"</span> button/popups notification, or select "Add to Home screen" via the triple-dot browser settings.</p>
                </div>
              </div>
            )}

            <button
              id="pwa-install-got-it"
              onClick={() => setShowInstallGuide(false)}
              className="mt-4 w-full py-2 bg-brand-primary text-brand-white rounded-xl text-xs font-semibold hover:bg-brand-primary/95 transition-all"
            >
              Got It, Thank You!
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
