import { useState, useEffect } from 'react';
import { User, Course, Enrollment, ResourceDownload, AITool, SessionSchedule } from './types';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';
import FeaturedWorkshops from './components/FeaturedWorkshops';
import InteractiveFeatures from './components/InteractiveFeatures';
import CourseCatalog from './components/CourseCatalog';
import ToolsDirectory from './components/ToolsDirectory';
import ResourceCenter from './components/ResourceCenter';
import QuizDashboard from './components/QuizDashboard';
import CommunityBoard from './components/CommunityBoard';
import AuthScreens from './components/AuthScreens';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/AdminPanel';
import { 
  Sparkles, Award, Star, ShieldAlert, CheckCircle, Info, 
  MapPin, Heart, BookOpen, Clock 
} from 'lucide-react';

export default function App() {
  // Navigation View Router
  const [currentView, setView] = useState<string>('courses');
  
  // App States
  const [courses, setCourses] = useState<Course[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [resources, setResources] = useState<ResourceDownload[]>([]);
  const [schedule, setSchedule] = useState<SessionSchedule[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentsList, setStudentsList] = useState<User[]>([]);

  // User State & Local Storage persistence for clean reloads
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('rawthink_user');
    return saved ? JSON.parse(saved) : null;
  });

  // PWA Prompt
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Native Audio/Visual Notification toast state
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load Seed data on App start
  useEffect(() => {
    async function loadData() {
      try {
        const [cRes, tRes, rRes, sRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/tools'),
          fetch('/api/resources'),
          fetch('/api/schedule')
        ]);

        if (cRes.ok) {
          const cData = await cRes.json();
          setCourses(cData.courses || []);
        }
        if (tRes.ok) {
          const tData = await tRes.json();
          setTools(tData.tools || []);
        }
        if (rRes.ok) {
          const rData = await rRes.json();
          setResources(rData.resources || []);
        }
        if (sRes.ok) {
          const sData = await sRes.json();
          setSchedule(sData.schedule || []);
        }
      } catch (e) {
        console.error('Data loading failure', e);
      }
    }
    loadData();
  }, []);

  // Hydrate admin specific datasets if current user has super privilege
  useEffect(() => {
    if (!currentUser) return;
    
    async function loadAdminData() {
      try {
        // Fetch student users index
        const uRes = await fetch('/api/admin/users');
        if (uRes.ok) {
          const uData = await uRes.json();
          setStudentsList(uData.users || []);
        }

        // Fetch transaction ledgers
        const eRes = await fetch('/api/admin/payments');
        if (eRes.ok) {
          const eData = await eRes.json();
          setEnrollments(eData.enrollments || []);
        }
      } catch (e) {
        console.error('Admin loading failure', e);
      }
    }
    loadAdminData();
  }, [currentUser]);

  // Automatically open auth when a password reset link is visited
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const pathname = window.location.pathname;
    const search = window.location.search;

    if (pathname.startsWith('/auth')) {
      setView('auth');
    }

    if (pathname === '/auth/reset-password' && search) {
      setView('auth');
    }
  }, []);

  // Hook into browser PWA installer hooks
  useEffect(() => {
    const handleBeforePrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      showNotification('📲 RAWTHINK AI mobile application ready for direct installation!', 'success');
    };
    window.addEventListener('beforeinstallprompt', handleBeforePrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforePrompt);
  }, []);

  // Check for payment callback message set by server (eSewa redirect)
  useEffect(() => {
    try {
      const payload = localStorage.getItem('rawthink_lastPayment');
      if (payload) {
        const obj = JSON.parse(payload as string);
        if (obj && obj.msg) {
          showNotification(obj.msg, obj.type || 'success');
        }
        localStorage.removeItem('rawthink_lastPayment');
      }
    } catch (e) {
      // ignore silent JSON errors
    }
  }, []);

  const showNotification = (msg: string, type: 'success' | 'error' | 'info') => {
    setNotification({ msg, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('rawthink_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('rawthink_user');
    showNotification('Logged out successfully from candidate workspace.', 'info');
    setView('courses');
  };

  // State callbacks triggers
  const handleEnrollSuccess = (newEnrollment: Enrollment) => {
    setEnrollments(prev => [newEnrollment, ...prev]);

    // Fast-feed update locally to current user profile state until hard reload
    if (currentUser) {
      const updatedUser = { ...currentUser };
      if (!updatedUser.streak) updatedUser.streak = 1;
      updatedUser.points = (updatedUser.points || 0) + 15; // points for uploading receipt
      setCurrentUser(updatedUser);
      localStorage.setItem('rawthink_user', JSON.stringify(updatedUser));
    }
  };

  const handleDownloadTracked = (resId: string) => {
    setResources(prev => prev.map(r => r.id === resId ? { ...r, downloadsCount: (r.downloadsCount || 0) + 1 } : r));
    
    // Reward points
    if (currentUser) {
      const updated = { ...currentUser };
      updated.points = (updated.points || 0) + 5;
      if (!updated.achievements.includes('Knowledge Seeker')) {
        updated.achievements.push('Knowledge Seeker');
      }
      setCurrentUser(updated);
      localStorage.setItem('rawthink_user', JSON.stringify(updated));
    }
  };

  const handlePaymentDecision = (enrollmentId: string, decision: 'approved' | 'rejected') => {
    setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: decision } : e));
    
    // Auto incremental points
    if (decision === 'approved' && currentUser) {
      const targetEnroll = enrollments.find(e => e.id === enrollmentId);
      if (targetEnroll && targetEnroll.userId === currentUser.id) {
        const updated = { ...currentUser };
        updated.points = (updated.points || 0) + 150;
        if (!updated.badges.includes('Scholar')) {
          updated.badges.push('Scholar');
        }
        setCurrentUser(updated);
        localStorage.setItem('rawthink_user', JSON.stringify(updated));
      }
    }
  };

  const handleManualCertIssued = (userId: string, workshopName: string) => {
    // If current student was issued a certificate
    if (currentUser && currentUser.id === userId) {
      const updated = { ...currentUser };
      const certLabel = `Certified: ${workshopName}`;
      if (!updated.achievements.includes(certLabel)) {
        updated.achievements.push(certLabel);
      }
      setCurrentUser(updated);
      localStorage.setItem('rawthink_user', JSON.stringify(updated));
    }
  };

  // Derived user statistics
  const purchasedCourseIds = enrollments
    .filter(e => e.userId === currentUser?.id && e.status === 'approved')
    .map(e => e.courseId);

  const pendingCourseIds = enrollments
    .filter(e => e.userId === currentUser?.id && e.status === 'pending')
    .map(e => e.courseId);

  const isEnrolled = purchasedCourseIds.length > 0;
  const referralsCount = currentUser?.referrals?.length || 0;
  const hasPremiumUnlimitedAccess = currentUser ? (currentUser.role === 'admin' || isEnrolled || referralsCount >= 10) : false;

  // Simple persistent Theme Switcher state toggler
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('rawthink_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('rawthink_theme', next);
  };

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden flex flex-col justify-between transition-all duration-300 ${
      theme === 'dark' ? 'dark bg-[#1E1610] text-[#F7F1E8]' : 'bg-brand-white text-brand-dark'
    }`}>
      
      {/* Global Navigation Hub */}
      <Navbar 
        currentUser={currentUser}
        currentView={currentView}
        setView={setView}
        onLogout={handleLogout}
        deferredPrompt={deferredPrompt}
        setDeferredPrompt={setDeferredPrompt}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Primary Display View Router */}
      <main className="flex-grow">
        
        {/* VIEW: EXPLORE CLASSES / LANDING HOME PAGE */}
        {currentView === 'courses' && (
          <div className="animate-fadeIn">
            {/* Landing Hero Area */}
            <LandingHero 
              setView={setView} 
              onDownloadClick={() => {
                const btn = document.getElementById('install-pwa-desktop');
                if (btn) btn.click();
              }}
            />

            {/* Detailed Featured Workshops Section (eSewa enabled) */}
            <FeaturedWorkshops
              courses={courses}
              currentUser={currentUser}
              setView={setView}
              showNotification={showNotification}
            />

            {/* Curriculum Showcase Features list */}
            <InteractiveFeatures />

            {/* Courses catalogs & checkouts */}
            <CourseCatalog 
              courses={courses}
              currentUser={currentUser}
              setView={setView}
              onEnrollSuccess={handleEnrollSuccess}
              showNotification={showNotification}
              purchasedCourseIds={purchasedCourseIds}
              pendingCourseIds={pendingCourseIds}
              onUserUpdate={handleLoginSuccess}
            />

            {/* Testimonials Static Carousel block */}
            <div id="testimonials-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-white">
              <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-12">
                  <span className="text-xs font-bold tracking-widest text-[#C19A6B] uppercase">Student Showcases</span>
                  <h3 className="font-display font-black text-3xl text-brand-dark tracking-tight mt-1 mb-2">Student Reviews & Stories</h3>
                  <p className="text-xs text-brand-dark/70">Listen to actual software developers, visual bloggers, and marketing freelancers on how RAWTHINK AI accelerated their day-to-day productivity.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      name: "Aayush Shrestha",
                      role: "Senior Software Engineer, Kathmandu",
                      text: "The Saturday Developer Automation workshop was extremely eye-opening. I successfully built a secure Express server-side prompt proxy and cut API latency in half. RAWTHINK is outstanding!",
                      rating: 5
                    },
                    {
                      name: "Pooja Karki",
                      role: "Digital Marketing Specialist, Lalitpur",
                      text: "As a creative content planner, advanced system role persona templates completely replaced my generic copywriting workflows on ChatGPT. TheRs.349 ticket provided immense value.",
                      rating: 5
                    },
                    {
                      name: "Bipin Dahal",
                      role: "Freelance UI/UX Designer, Pokhara",
                      text: "I loved the drag-and-drop receipt submission interface. Approved in under ten minutes! Their completion certificates proved highly valuable on my LinkedIn portfolio posts.",
                      rating: 5
                    }
                  ].map((test, idx) => (
                    <div key={idx} className="bg-brand-cream/20 border border-brand-primary/10 rounded-2xl p-6 text-left relative space-y-4">
                      {/* Rating stars */}
                      <div className="flex space-x-1 text-amber-500">
                        {[...Array(test.rating)].map((_, rIdx) => (
                          <Star key={rIdx} size={14} className="fill-amber-500" />
                        ))}
                      </div>

                      <p className="text-xs text-brand-dark/85 leading-relaxed font-sans italic">
                        "{test.text}"
                      </p>

                      <div className="pt-4 border-t border-brand-primary/5">
                        <p className="text-xs font-bold text-brand-dark">{test.name}</p>
                        <p className="text-[10px] text-brand-dark/50">{test.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Beautiful static Call to Action Section with Certificate Preview */}
            <div className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream/30 border-t border-b border-brand-primary/5">
              <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center text-left">
                <div className="md:col-span-7 space-y-4">
                  <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">Verified Career Credentials</span>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-brand-dark tracking-tight leading-snug">
                    Accelerate Your Employment Authority Today
                  </h3>
                  <p className="text-xs sm:text-sm text-brand-dark/75 leading-relaxed">
                    Earn verified completion certificates detailing system prompting credentials, API endpoints proxy development practices, and automated pipeline architectures. Validated digitally via unique serial ID keys.
                  </p>
                  <button
                    onClick={() => {
                      if (currentUser) {
                        setView(currentUser.role === 'admin' ? 'admin' : 'dashboard');
                      } else {
                        setView('auth');
                        showNotification('Log in to check your interactive completion certificates.', 'info');
                      }
                    }}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-brand-dark text-brand-cream rounded-xl text-xs font-bold hover:bg-brand-dark/95 transition shadow cursor-pointer"
                  >
                    <span>View My Credentials Certificate</span>
                  </button>
                </div>

                <div className="md:col-span-5">
                  {/* Decorative tiny certificate graphic */}
                  <div className="bg-brand-white border-2 border-[#C19A6B]/35 rounded-xl p-4 shadow-md text-center space-y-2 select-none relative overflow-hidden">
                    <div className="absolute right-4 bottom-4 w-10 h-10 rounded-full border border-brand-primary bg-brand-cream flex items-center justify-center text-[4px] font-black text-brand-primary leading-none rotate-12">
                      RAWTHINK<br />SEAL
                    </div>

                    <div className="border border-dashed border-[#C19A6B]/50 p-2.5 text-center space-y-1.5">
                      <p className="text-[6px] tracking-widest font-extrabold text-brand-primary uppercase">Completion Excellence Certificate</p>
                      <h4 className="font-display font-bold text-[10px] text-brand-dark">RAWTHINK AI ACADEMY</h4>
                      <div className="w-16 h-0.5 bg-brand-primary/20 mx-auto" />
                      <p className="text-[10px] font-bold text-brand-dark italic underline decoration-brand-primary">Student Candidate</p>
                      <p className="text-[7px] text-brand-dark/70 leading-normal max-w-[180px] mx-auto">for demonstrating program excellence within Artificial Intelligence & APIs Automation bootcamps.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* VIEW: TOOLS DIRECTORY */}
        {currentView === 'tools' && (
          <div className="animate-fadeIn">
            <ToolsDirectory 
              tools={tools} 
              hasPremiumUnlimitedAccess={hasPremiumUnlimitedAccess}
              onUnlockTrigger={() => setView('courses')}
              currentUser={currentUser}
              showNotification={showNotification}
              onUserUpdate={handleLoginSuccess}
            />
          </div>
        )}

        {/* VIEW: RESOURCES CENTER */}
        {currentView === 'resources' && (
          <div className="animate-fadeIn">
            <ResourceCenter 
              resources={resources}
              currentUser={currentUser}
              onDownloadTracked={handleDownloadTracked}
              showNotification={showNotification}
              hasPremiumUnlimitedAccess={hasPremiumUnlimitedAccess}
              onUnlockTrigger={() => setView('courses')}
              onUserUpdate={handleLoginSuccess}
            />
          </div>
        )}

        {/* VIEW: QUIZ PRACTICE DASHBOARD */}
        {currentView === 'quiz' && (
          <div className="animate-fadeIn">
            <QuizDashboard 
              currentUser={currentUser}
              setView={setView}
              showNotification={showNotification}
            />
          </div>
        )}

        {/* VIEW: DISCUSSION BOARDS FORUM */}
        {currentView === 'community' && (
          <div className="animate-fadeIn">
            <CommunityBoard 
              currentUser={currentUser}
              setView={setView}
              showNotification={showNotification}
            />
          </div>
        )}

        {/* VIEW: LOG IN / CANDIDATES REGISTER CREATIONAL SECURE SCREEN */}
        {currentView === 'auth' && (
          <div className="animate-fadeIn">
            <AuthScreens 
              onLoginSuccess={handleLoginSuccess}
              showNotification={showNotification}
              setView={setView}
            />
          </div>
        )}

        {/* VIEW: STUDENT WORKSPACE PANEL COCKPIT */}
        {currentView === 'dashboard' && (
          <div className="animate-fadeIn">
            <UserDashboard 
              currentUser={currentUser}
              enrollments={enrollments}
              courses={courses}
              schedule={schedule}
              showNotification={showNotification}
              setView={setView}
              onUserUpdate={handleLoginSuccess}
            />
          </div>
        )}

        {/* VIEW: MASTER ADM CONTROL INDEX */}
        {currentView === 'admin' && (
          <div className="animate-fadeIn">
            <AdminPanel 
              currentUser={currentUser}
              courses={courses}
              schedule={schedule}
              enrollments={enrollments}
              showNotification={showNotification}
              onPaymentDecision={handlePaymentDecision}
              onPostAnnouncement={() => {}}
              onIssueManualCert={handleManualCertIssued}
              onScheduleChange={(updatedSchedule) => setSchedule(updatedSchedule)}
              studentsList={studentsList}
              tools={tools}
              onToolsChange={(updatedTools) => setTools(updatedTools)}
            />
          </div>
        )}

      </main>

      {/* Global Brand Footer */}
      <footer className="bg-brand-dark py-12 px-4 sm:px-6 lg:px-8 text-brand-cream border-t border-brand-primary/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 text-left text-xs sm:text-sm">
          
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-primary flex items-center justify-center">
                <span className="text-white font-black font-display text-sm">R</span>
              </div>
              <span className="font-display font-black text-lg tracking-tight">RAWTHINK AI</span>
            </div>
            <p className="text-xs text-brand-cream/65 leading-relaxed max-w-sm">
              We teach modern individuals how to build, deploy, and master cutting-edge software engineering pipelines using artificial intelligence wrappers, autonomous nodes, and prompt frameworks.
            </p>
          </div>

          <div className="md:col-span-3 space-y-3.5">
            <h4 className="font-display font-black tracking-widest text-[#C19A6B] uppercase text-[10px]">Academic Divisions</h4>
            <div className="space-y-2 text-xs text-brand-cream/80 font-medium">
              <p className="hover:text-brand-primary transition cursor-pointer" onClick={() => setView('courses')}>AI Foundations Bootcamp</p>
              <p className="hover:text-brand-primary transition cursor-pointer" onClick={() => setView('courses')}>AI Productivity Workshop</p>
              <p className="hover:text-brand-primary transition cursor-pointer" onClick={() => setView('courses')}>AI Development Masterclass</p>
            </div>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="font-display font-black tracking-widest text-[#C19A6B] uppercase text-[10px]">Contact & Location Coordinates</h4>
            <div className="space-y-2 text-xs text-brand-cream/70 leading-relaxed font-sans font-medium">
              <p className="flex items-start">
                <MapPin size={13} className="mr-1.5 text-brand-primary shrink-0 mt-0.5" />
                <span>Pepsicola, Suncity, Kathmandu, Nepal CP: 44600</span>
              </p>
              <p className="flex items-start">
                <Clock size={13} className="mr-1.5 text-brand-primary shrink-0 mt-0.5" />
                <span>Support desk: Sat - Wed, 10:00 AM - 6:00 PM NPT</span>
              </p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-[#C19A6B]/25 text-center text-[11px] text-brand-cream/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 RAWTHINK AI Academy Nepal. Direct PWA integration. All rights reserved.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:underline">Legal Terms of Use</a>
            <a href="#" className="hover:underline">Privacy Matrix Policies</a>
          </div>
        </div>
      </footer>

      {/* Bottom PWA Bar Representation matching the Sleek design theme */}
      <div className="px-8 py-4 bg-[#F7F1E8] border-t border-[#F7F1E8] flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-[#5C4033]">
        <div className="flex gap-6 opacity-65">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 
            eSewa Ready
          </span>
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C19A6B]"></span> 
            PWA Enabled
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="opacity-75">User: {currentUser ? currentUser.email.split('@')[0] : 'demo_learner'}</span>
          <div className="w-7 h-7 rounded-full bg-[#5C4033] flex items-center justify-center text-white text-[10px] font-bold">
            {currentUser ? currentUser.name.split(' ').map(n=>n[0]).join('').toUpperCase() : 'DL'}
          </div>
        </div>
      </div>

      {/* Floating Global Native Sound/Vibe Toast Alerts system */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-slideIn">
          <div className={`p-4 rounded-xl shadow-lg border text-xs sm:text-sm font-semibold flex items-center space-x-2.5 max-w-sm ${
            notification.type === 'success' 
              ? 'bg-emerald-50 text-emerald-950 border-emerald-300' 
              : notification.type === 'error' 
                ? 'bg-rose-50 text-rose-950 border-rose-300' 
                : 'bg-indigo-50 text-indigo-950 border-indigo-300'
          }`}>
            <span className="text-base font-bold shrink-0">
              {notification.type === 'success' ? '🏆' : notification.type === 'error' ? '🧯' : 'ℹ️'}
            </span>
            <p className="leading-tight">{notification.msg}</p>
          </div>
        </div>
      )}

    </div>
  );
}
