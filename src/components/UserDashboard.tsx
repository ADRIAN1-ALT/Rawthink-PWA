import React, { useState, useEffect } from 'react';
import { User, Enrollment, Course, SessionSchedule } from '../types';
import { 
  Award, Calendar, Clock, Download, Sparkles, User as UserIcon, 
  MessageSquare, BookOpen, Share2, HelpCircle, Trophy, CheckCircle, Flame, Send, ArrowUpRight, Unlock, Lock 
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User | null;
  enrollments: Enrollment[];
  courses: Course[];
  schedule: SessionSchedule[];
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  setView: (view: string) => void;
  onUserUpdate?: (user: User) => void;
}

export default function UserDashboard({
  currentUser, enrollments, courses, schedule, showNotification, setView, onUserUpdate
}: UserDashboardProps) {
  
  // Dashboard Sub-Views State
  const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'referrals' | 'ai-tutor' | 'certificate'>('profile');

  // Interactive Live Referral Simulator States inside lock views
  const [simName, setSimName] = useState('');
  const [simEmail, setSimEmail] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Local user state to trigger real-time changes
  const [localUser, setLocalUser] = useState<User | null>(currentUser);

  // Sync state if currentUser prop updates
  useEffect(() => {
    if (currentUser) {
      setLocalUser(currentUser);
    }
  }, [currentUser]);

  // AI Workshop Tutor States
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSubject, setAiSubject] = useState('General Prompt Matrices');
  const [aiAnswersList, setAiAnswersList] = useState<{ query: string; answer: string; date: string }[]>([
    {
      query: "How do I avoid LLM hallucinations during coding?",
      answer: "Anchor your instruction using delimited guidelines: enclose code parameters inside XML tags like `<context>` and `<code-structure>`, and explicitly restrict: *'If unfamiliar with the library, response with: [UNSUPPORTED] rather than inventing methods.'*",
      date: "Original Tutorial"
    }
  ]);
  const [isQueringAI, setIsQueringAI] = useState(false);

  // Zoomable Certificate preview states
  const [zoomCertificate, setZoomCertificate] = useState(false);

  if (!localUser) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm font-semibold text-brand-dark mb-4">Please log in to view candidate dashboards.</p>
        <button
          onClick={() => setView('auth')}
          className="px-6 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold shadow-sm"
        >
          Sign In portal
        </button>
      </div>
    );
  }

  // Derived indicators
  const myEnrollments = enrollments.filter(e => e.userId === localUser.id);
  const myApprovedCoursesIds = myEnrollments.filter(e => e.status === 'approved').map(e => e.courseId);
  const myApprovedCourses = courses.filter(c => myApprovedCoursesIds.includes(c.id));

  // Premium mode checks
  const isEnrolled = myApprovedCourses.length > 0;
  const referralsCount = localUser.referrals?.length || 0;
  const hasPremiumUnlimitedAccess = isEnrolled || referralsCount >= 10;

  // Book class schedule slot helper
  const handleReserveSlot = async (courseId: string, timeSlotId: string) => {
    try {
      const resp = await fetch('/api/user/book-slot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localUser.id,
          courseId,
          timeSlotId
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Failed to book slot');
      }

      setLocalUser(data.user);
      showNotification('Class Saturday schedule slot reserved successfully! Check notifications.', 'success');
      // Reload page to reflect seats remaining modifications
      window.location.reload();
    } catch (err: any) {
      showNotification(err.message || 'Booking error', 'error');
    }
  };

  // Simulated Friend Signup utility to unlock locks easily in the preview
  const handleSimulateFriendSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim() || !simEmail.trim()) {
      showNotification('Friend name and email address are required.', 'error');
      return;
    }

    setIsSimulating(true);
    try {
      const resp = await fetch('/api/user/simulate-referral-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localUser.id,
          friendName: simName.trim(),
          friendEmail: simEmail.trim()
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Simulation failed.');
      }

      setLocalUser(data.user);
      setSimName('');
      setSimEmail('');
      showNotification(`🎉 Simulated Friend Signup Confirmed! Added +33 Coins. Total refer now: ${data.user.referrals?.length || 0}.`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error executing signup', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  // Simulated friend download confirmed logic
  const handleSimulateFriendDownload = async () => {
    try {
      const resp = await fetch('/api/user/simulate-referral-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: localUser.id })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error);
      }

      setLocalUser(data.user);
      showNotification(`📱 Referred friend downloaded app! Total downloads tracked: ${data.user.referredDownloads || 0}`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error tracking download simulation', 'error');
    }
  };

  const handleQueryAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    // For non-admin students, warn if coins are low
    const isStudent = localUser.role !== 'admin';
    if (isStudent && (localUser.points || 0) < 100) {
      showNotification('❌ Insufficient Coins! Asking the advanced AI tutor costs 100 coins. Register/Enroll for a class or refer friends to acquire coins.', 'error');
      return;
    }

    const confirmAI = window.confirm(`🪙 Ask RAWTHINK AI Tutor?\nThis query will deduct 100 Coins from your student balance.\nYour current balance: ${localUser.points || 0} Coins.`);
    if (!confirmAI) return;

    setIsQueringAI(true);
    const userQuery = aiPrompt.trim();
    setAiPrompt('');

    try {
      const resp = await fetch('/api/ai/workshop-qna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userQuery,
          courseContext: aiSubject,
          userId: localUser.id
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        setAiAnswersList(prev => [
          { query: userQuery, answer: data.text, date: new Date().toLocaleTimeString() },
          ...prev
        ]);
        
        if (data.updatedPoints !== undefined && onUserUpdate) {
          onUserUpdate({
            ...localUser,
            points: data.updatedPoints
          });
        }
        
        showNotification('AI Workshop Tutor successfully compiled explanation! 100 Coins deducted.', 'success');
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showNotification(err.message || 'AI query error', 'error');
    } finally {
      setIsQueringAI(false);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(localUser.referralCode || 'RAWTHINK99');
    showNotification(`Referral code "${localUser.referralCode}" copied! Share with friends! 🤝`, 'success');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-brand-cream/10 min-h-[85vh]">
      <div className="max-w-7xl mx-auto">
        
        {/* Profile Card Header */}
        <div className="bg-brand-white border border-brand-primary/10 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-brand-cream shadow-md relative">
              <UserIcon size={28} />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold" title="Learning Streak">
                🔥
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-display font-black text-xl text-brand-dark leading-tight">{localUser.name}</h2>
                <span className="text-[10px] bg-brand-cream text-brand-dark px-2 py-0.5 rounded-full font-bold border border-brand-primary/15">Student</span>
              </div>
              <p className="text-xs text-brand-dark/60 mt-1">Credentials ID: <span className="font-mono font-bold text-brand-primary">{localUser.id}</span></p>
              
              {/* Learning Streak indicator */}
              <div className="flex items-center space-x-1.5 mt-2 text-xs font-semibold text-amber-700">
                <Flame size={14} className="fill-amber-500 text-amber-500 animate-pulse" />
                <span>Active Learning Streak: <span className="font-bold font-mono text-base">{localUser.streak || 1} Days Logged</span></span>
              </div>
            </div>
          </div>

          {/* Gamified Coins Stats */}
          <div className="flex gap-4 w-full md:w-auto">
            <div className="flex-1 bg-brand-cream/40 p-3 px-5 rounded-2xl border border-brand-primary/5 text-center min-w-[100px]">
              <div className="flex items-center justify-center space-x-1 mb-1 text-[#C19A6B]">
                <Trophy size={14} />
                <span className="text-[9px] font-black uppercase tracking-wider">Acquired Coins</span>
              </div>
              <p className="font-display font-black text-2xl text-brand-dark font-mono">{localUser.points || 0}</p>
            </div>

            <div className="flex-1 bg-brand-cream/40 p-3 px-5 rounded-2xl border border-brand-primary/5 text-center min-w-[100px]">
              <div className="flex items-center justify-center space-x-1 mb-1 text-brand-primary">
                <Award size={14} />
                <span className="text-[9px] font-black uppercase tracking-wider">Total Referrals</span>
              </div>
              <p className="font-display font-black text-2xl text-brand-dark font-mono">{referralsCount}</p>
            </div>
          </div>
        </div>

        {/* Inner subview selector tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-brand-primary/10 pb-4 mb-8">
          {[
            { id: 'profile', label: 'My Cockpit' },
            { id: 'courses', label: 'My Classes' },
            { id: 'referrals', label: 'Referral Rewards' },
            { id: 'ai-tutor', label: 'AI Study Tutor' },
            { id: 'certificate', label: 'Credentials Certificate' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all sm:col-span-1 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-brand-primary text-brand-white shadow-sm'
                  : 'bg-brand-white text-brand-dark border border-brand-primary/5 hover:bg-brand-primary/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENT: PROFILE/COCKPIT */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* Left Column: Academic Schedules & Badges */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Badges and milestones block */}
              <div className="bg-brand-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm">
                <h3 className="font-display font-extrabold text-base text-brand-dark mb-4 flex items-center space-x-1.5">
                  <Award className="text-brand-primary" size={18} />
                  <span>Honorable Learning Badges</span>
                </h3>
                {localUser.badges && localUser.badges.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {localUser.badges.map((badge, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center space-x-1.5 px-3.5 py-2 bg-brand-cream/40 border border-brand-primary/15 rounded-xl"
                      >
                        <span className="text-base">🎖️</span>
                        <div className="text-left">
                          <p className="text-xs font-black text-brand-dark leading-none">{badge}</p>
                          <p className="text-[9px] text-brand-dark/50 mt-0.5 leading-none">Verified Member</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-dark/50">Attend classes, submit receipts and answer quizzes to award badges.</p>
                )}
              </div>

              {/* Personal Course Admission scheduling log */}
              <div className="bg-brand-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-brand-primary/5">
                  <h3 className="font-display font-extrabold text-base text-brand-dark flex items-center space-x-1.5">
                    <Calendar className="text-brand-primary" size={18} />
                    <span>My Upcoming Workshop Schedules</span>
                  </h3>
                  <button 
                    onClick={() => setView('courses')}
                    className="text-[10px] font-bold text-brand-primary hover:underline flex items-center"
                  >
                    <span>Inspect catalogs</span>
                    <ArrowUpRight size={10} />
                  </button>
                </div>

                <div className="space-y-4">
                  {myApprovedCourses.length > 0 ? (
                    schedule
                      .filter(s => myApprovedCourses.some(mc => mc.id === s.courseId))
                      .map((session) => {
                        const isReserved = localUser.selectedTimeSlots?.[session.courseId] === session.id;
                        return (
                          <div 
                            key={session.id}
                            className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                              isReserved 
                                ? 'bg-emerald-50/70 border-emerald-200'
                                : 'bg-brand-cream/20 border-brand-primary/10'
                            }`}
                          >
                            <div>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                isReserved 
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-brand-primary text-brand-cream'
                              }`}>
                                {isReserved ? 'My Booked Slot ✅' : 'Approved Seat Available'}
                              </span>
                              <h4 className="font-display font-bold text-sm text-brand-dark mt-1.5">{session.workshopName}</h4>
                              <p className="text-xs text-brand-dark/65 mt-0.5">Instructor: {session.instructor}</p>
                            </div>

                            <div className="flex items-center space-x-6 text-xs text-brand-dark font-semibold font-mono shrink-0">
                              <div>
                                <p className="text-[9px] text-brand-dark/50 font-sans font-bold uppercase leading-none mb-1">Calendar Date</p>
                                <p>{session.date}</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-brand-dark/50 font-sans font-bold uppercase leading-none mb-1">Class Time</p>
                                <p className="flex items-center space-x-0.5">
                                  <Clock size={11} className="mr-0.5 text-brand-primary" />
                                  <span>{session.time} NPT</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                  ) : (
                    <div className="p-6 text-center text-xs text-brand-dark/55 space-y-1 bg-brand-cream/10 rounded-xl border border-dashed border-brand-primary/20">
                      <p className="font-semibold">No active certified class schedules booked.</p>
                      <p>Select a live course and submit your transaction receipt to unlock Saturdays admissions!</p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column: Achievements & Transactions checklist */}
            <div className="space-y-8">
              
              {/* Unlock achievements */}
              <div className="bg-brand-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm">
                <h3 className="font-display font-extrabold text-base text-brand-dark mb-4 flex items-center space-x-1.5">
                  <Flame className="text-brand-primary" size={18} />
                  <span>My Student Achievements ({localUser.achievements?.length || 0})</span>
                </h3>
                <div className="space-y-2.5">
                  {(localUser.achievements || []).map((ach, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs">
                      <CheckCircle size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-brand-dark">{ach}</p>
                        <p className="text-[9px] text-brand-dark/50 leading-none">Task verified successfully</p>
                      </div>
                    </div>
                  ))}
                  {(!localUser.achievements || localUser.achievements.length === 0) && (
                    <p className="text-xs text-brand-dark/50">Complete tasks to unlock achievements.</p>
                  )}
                </div>
              </div>

              {/* Transactions Ledger status checks */}
              <div className="bg-brand-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm">
                <h3 className="font-display font-extrabold text-base text-brand-dark mb-4 flex items-center space-x-1.5">
                  <BookOpen className="text-brand-primary" size={18} />
                  <span>eSewa Payments Status Log</span>
                </h3>
                {myEnrollments.length > 0 ? (
                  <div className="space-y-3">
                    {myEnrollments.map((en) => (
                      <div key={en.id} className="p-3 bg-brand-cream/15 rounded-xl border border-brand-primary/5 text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-brand-dark leading-tight">{en.courseTitle}</p>
                          <p className="text-[10px] text-brand-dark/60 font-mono mt-0.5">Ref. {en.transactionId}</p>
                          <p className="text-[10px] text-brand-dark/40 font-mono">Status: <span className="underline font-bold">{en.status}</span></p>
                        </div>

                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase shrink-0 ${
                          en.status === 'approved' 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : en.status === 'rejected' 
                              ? 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
                        }`}>
                          {en.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-brand-dark/50">No payments logs submitted yet.</p>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB CONTENT: MY CLASSES DETAIL WITH DYNAMIC SATURDAYS TIME SLOT RESERVER */}
        {activeTab === 'courses' && (
          <div className="space-y-8 text-left">
            <h3 className="font-display font-black text-lg text-brand-dark border-b border-brand-primary/10 pb-2">Approved Classroom Hub</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myApprovedCourses.map((c) => {
                const bookedSlotId = localUser.selectedTimeSlots?.[c.id];
                const bookedSession = schedule.find(s => s.id === bookedSlotId);

                return (
                  <div 
                    key={c.id}
                    className="bg-brand-white rounded-2xl border border-brand-primary/10 p-6 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="bg-emerald-50 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-150 inline-block mb-2">
                          Admission Active
                        </span>
                        {bookedSession && (
                          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 text-[9px] font-black px-2 py-0.5 rounded">
                            SLOT ASSIGNED ✅
                          </span>
                        )}
                      </div>
                      <h3 className="font-display font-black text-base text-brand-dark mt-1 leading-snug">
                        {c.title}
                      </h3>
                      <p className="text-xs text-brand-dark/60 mt-0.5">Duration Syllabus: <span className="font-bold">{c.duration}</span></p>

                      {/* Render Assigned Slot */}
                      {bookedSession ? (
                        <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs">
                          <p className="font-bold text-emerald-900 flex items-center">
                            <CheckCircle size={13} className="text-emerald-700 mr-1 shrink-0" />
                            <span>Reserved saturday Class session:</span>
                          </p>
                          <p className="font-semibold text-brand-dark font-mono text-[11px] pl-4">
                            🗓️ Date: {bookedSession.date} • ⏰ Time: {bookedSession.time} NPT
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl text-xs space-y-2">
                          <p className="font-bold text-amber-900 flex items-center space-x-1">
                            <span className="animate-pulse">●</span>
                            <span>Saturdays Time Slot Booking Required</span>
                          </p>
                          <p className="text-[11px] text-brand-dark/75 leading-relaxed">
                            Your payment has been successfully verified! Choose your preferred session schedule to secure remaining seats.
                          </p>

                          {/* Interactive list of slots matching courseId */}
                          <div className="space-y-1.5 pt-1">
                            {schedule.filter(s => s.courseId === c.id).length > 0 ? (
                              schedule
                                .filter(s => s.courseId === c.id)
                                .map(session => (
                                  <button
                                    key={session.id}
                                    onClick={() => handleReserveSlot(c.id, session.id)}
                                    disabled={session.seatsRemaining <= 0}
                                    className="w-full p-2 bg-brand-white hover:bg-brand-primary/10 border border-brand-primary/15 rounded-lg flex justify-between items-center text-left text-[11px] transition cursor-pointer font-medium text-brand-dark"
                                  >
                                    <div>
                                      <span className="font-bold">{session.date}</span> at <span className="font-bold text-brand-primary">{session.time}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold ${session.seatsRemaining > 0 ? 'text-emerald-700' : 'text-red-650'}`}>
                                      {session.seatsRemaining > 0 ? `${session.seatsRemaining} seats left` : 'Fully Booked'}
                                    </span>
                                  </button>
                                ))
                            ) : (
                              <p className="text-[10px] text-brand-dark/60 italic">Instructors have not schedule dynamic slots for this class yet. Please check back shortly!</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Show Unlocked study perks list */}
                      <div className="pt-4 space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-primary-900">Unlocked benefits:</p>
                        <ul className="space-y-1">
                          {c.bonuses.map((b, bIdx) => (
                            <li key={bIdx} className="flex items-center text-xs text-brand-dark/85">
                              <CheckCircle size={11} className="text-emerald-600 mr-1.5 shrink-0" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-brand-primary/5 flex gap-2">
                      <button 
                        onClick={() => { setActiveTab('ai-tutor'); }}
                        className="flex-1 py-2 bg-brand-primary text-brand-white font-bold text-xs rounded-xl hover:bg-brand-primary/95 text-center transition cursor-pointer"
                      >
                        Ask My Lesson AI Tutor
                      </button>
                      {bookedSession && (
                        <button
                          onClick={() => {
                            // Let them change time slot
                            // Set selected slot back to empty state to let them choose again
                            const upUser = { ...localUser };
                            if (upUser.selectedTimeSlots) {
                              delete upUser.selectedTimeSlots[c.id];
                              setLocalUser(upUser);
                              showNotification('Select another Saturday time slot below!', 'info');
                            }
                          }}
                          className="px-3 border border-brand-primary/25 text-brand-dark text-[11px] font-semibold rounded-xl hover:bg-brand-cream/40"
                        >
                          Change Slot
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {myApprovedCourses.length === 0 && (
                <div className="col-span-full py-12 text-center max-w-lg mx-auto space-y-4 bg-brand-white border border-brand-primary/10 rounded-3xl p-6.5">
                  <div className="w-12 h-12 bg-brand-cream rounded-xl mx-auto flex items-center justify-center text-brand-primary text-lg">
                    🛡️
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-brand-dark">No Checked Saturday Classrooms</h4>
                    <p className="text-xs text-brand-dark/70 mt-1">
                      You do not have any confirmed student seats yet. Register for a bootcamp, make the eSewa transaction, and submit the checkout receipt. 
                    </p>
                  </div>
                  <button
                    onClick={() => setView('courses')}
                    className="px-5 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    View Active Bootcamps
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: REFERRALS SCHEME - TIERED PROMO CALCULATOR */}
        {activeTab === 'referrals' && (
          <div className="bg-brand-white rounded-3xl border border-brand-primary/10 p-6 sm:p-8 max-w-3xl mx-auto text-left shadow-sm space-y-6">
            
            <div className="text-center max-w-xl mx-auto space-y-1.5">
              <span className="text-xs font-bold tracking-widest text-[#C19A6B] uppercase">Community Multipliers</span>
              <h3 className="font-display font-black text-2xl text-brand-dark">Referral Reward Program</h3>
              <p className="text-xs text-brand-dark/70">Invite your programmer friends, designers or freelancers to study AI on our premium digital screens together with us!</p>
            </div>

            {/* Main referral rewards instruction block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="bg-brand-cream/30 p-5 rounded-2xl border border-brand-primary/5 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-brand-dark mb-1">🎁 Tiered Pricing Discounts:</h4>
                  <ul className="text-xs space-y-2 mt-2 font-medium text-brand-dark/90">
                    <li className={`flex items-center space-x-2 ${referralsCount >= 10 ? 'text-emerald-700 font-extrabold' : ''}`}>
                      <CheckCircle size={12} className={referralsCount >= 10 ? 'text-emerald-600' : 'text-brand-dark/30'} />
                      <span>Refer 10 friends → <strong>100% FREE class pass</strong></span>
                    </li>
                    <li className={`flex items-center space-x-2 ${referralsCount >= 6 ? 'text-emerald-700 font-extrabold' : ''}`}>
                      <CheckCircle size={12} className={referralsCount >= 6 ? 'text-emerald-600' : 'text-brand-dark/30'} />
                      <span>Refer 6 friends → <strong>30% OFF pricing tier</strong></span>
                    </li>
                    <li className={`flex items-center space-x-2 ${referralsCount >= 4 ? 'text-emerald-700 font-extrabold' : ''}`}>
                      <CheckCircle size={12} className={referralsCount >= 4 ? 'text-emerald-600' : 'text-brand-dark/30'} />
                      <span>Refer 4 friends → <strong>20% OFF pricing tier</strong></span>
                    </li>
                    <li className={`flex items-center space-x-2 ${referralsCount >= 3 ? 'text-emerald-700 font-extrabold' : ''}`}>
                      <CheckCircle size={12} className={referralsCount >= 3 ? 'text-emerald-600' : 'text-brand-dark/30'} />
                      <span>Refer 3 friends → <strong>Unlock Completion Certificate</strong></span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 border-t border-brand-primary/5">
                  <p className="text-[10px] text-brand-dark/50">My Unlocked Milestone Status:</p>
                  <p className="text-xs font-bold text-brand-primary leading-tight mt-0.5">
                    {referralsCount >= 10 
                      ? '🏆 Unlocked: 100% FREE Dynamic Voucher Validated!'
                      : referralsCount >= 6 
                        ? '🔥 Unlocked: 30% discount automatically active on classes checkout!'
                        : referralsCount >= 4 
                          ? '⭐ Unlocked: 20% discount automatically active on classes checkout!'
                          : referralsCount >= 3 
                            ? '✅ Unlocked: Certificate Releases unlocked!'
                            : '⚠️ None yet — Refer at least 3 friends to release your certificate!'}
                  </p>
                </div>
              </div>

              {/* Dynamic trigger key generator */}
              <div className="bg-brand-cream/30 p-5 rounded-2xl border border-brand-primary/5 space-y-3 text-center flex flex-col justify-center">
                <p className="text-xs font-bold text-brand-dark/80">Your Unique Invitation Code:</p>
                <div className="bg-brand-white p-3.5 rounded-xl border border-brand-primary/20 flex justify-between items-center font-mono text-base font-extrabold text-brand-dark tracking-widest">
                  <span>{localUser.referralCode || 'RAWTHINK99'}</span>
                  <button
                    onClick={copyReferral}
                    className="p-1.5 bg-brand-cream hover:bg-brand-primary/20 rounded-lg text-brand-primary font-sans text-xs tracking-normal"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[10px] text-brand-dark/55">Distribute this code. New users earn +15 points upon registration.</p>
              </div>
            </div>

            {/* Progress of Referred Friends signups */}
            <div className="border-t border-brand-cream pt-4 text-xs space-y-3.5">
              <p className="font-bold text-brand-dark uppercase tracking-wide text-[10px] text-brand-primary">My Referred Friends Inbox ({referralsCount}):</p>
              
              {localUser.referrals && localUser.referrals.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {localUser.referrals.map((friendEmail, fIdx) => (
                    <div key={fIdx} className="p-2.5 bg-brand-cream/20 border border-brand-primary/5 rounded-xl font-mono text-[10px] text-brand-dark flex justify-between items-center">
                      <span>{friendEmail}</span>
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[8px] uppercase">Registered</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-dark/50 italic">No invitees registered with your code yet. Share your code to build the community!</p>
              )}
            </div>

          </div>
        )}

        {/* TAB CONTENT: SERVER-SIDE INTERACTIVE AI WORKSHOP TUTOR (GEMINI PROXY) */}
        {activeTab === 'ai-tutor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left">
            
            {/* Left Prompt composer */}
            <div className="lg:col-span-5 space-y-5">
              <div className="bg-brand-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Instructor Node Proxy</span>
                  <h3 className="font-display font-extrabold text-base text-brand-dark mt-1">AI Workshop Companion</h3>
                  <p className="text-xs text-brand-dark/70 mt-1">Prompt our tutor about class exercises, system engineering, or Cursor automations.</p>
                </div>

                {/* LIMITED MODE NOTIFICATION BOX FOR AI */}
                {!hasPremiumUnlimitedAccess && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-normal">
                    <span className="font-bold">⚠️ Limited Mode Sandbox active:</span> You can only ask <strong>1 prompt</strong> until you enroll in an approved Saturday bootcamp, or refer 10 active candidates. (Queries logged: {aiAnswersList.length - 1} / 1)
                  </div>
                )}

                <form onSubmit={handleQueryAI} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Category Context Focus:</label>
                    <select
                      value={aiSubject}
                      onChange={(e) => setAiSubject(e.target.value)}
                      className="w-full px-3 py-2.5 bg-brand-cream/15 border border-brand-primary/15 rounded-xl text-xs font-bold text-brand-dark focus:outline-none"
                    >
                      <option value="General Prompt Matrices">👥 General Prompt Matrices</option>
                      <option value="ChatGPT System Roles">🧠 ChatGPT System Roles</option>
                      <option value="Chain-of-Thought sequential rules">⛓️ Chain-of-Thought rules</option>
                      <option value="Developer Node API Proxy configurations">💻 Developer Node API Proxies</option>
                      <option value="Cursor IDE configurations">🤖 Cursor IDE configurations</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Inquire Workshop Tutor:</label>
                    <textarea
                      required
                      rows={5}
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      placeholder="e.g. How do I build a Few-Shot Prompt schema for customer service chatbots?"
                      className="w-full p-3 bg-brand-cream/15 border border-brand-primary/15 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none text-brand-dark font-sans leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isQueringAI}
                    className="w-full py-2.5 bg-brand-primary text-brand-white rounded-xl text-xs font-bold hover:bg-brand-primary/95 flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 shadow"
                  >
                    {isQueringAI ? (
                      <>
                        <span className="w-3 h-3 border-2 border-brand-cream border-t-brand-primary rounded-full animate-spin mr-1" />
                        <span>Compiling prompt response...</span>
                      </>
                    ) : (
                      <>
                        <Send size={12} />
                        <span>Query Workshop AI</span>
                      </>
                    )}
                  </button>
                </form>

              </div>
            </div>

            {/* Right Interactive Console display */}
            <div className="lg:col-span-7 space-y-5">
              <div className="bg-brand-white p-6 border border-brand-primary/10 rounded-2xl shadow-sm min-h-[400px] flex flex-col justify-between">
                
                <div className="space-y-4">
                  <div className="pb-3 border-b border-brand-primary/5 flex justify-between items-center text-xs font-semibold text-brand-dark/50">
                    <span className="font-display tracking-widest uppercase">Tutor Output Stream</span>
                    <span className="font-mono text-brand-primary">{aiAnswersList.length} Queries logged</span>
                  </div>

                  <div className="space-y-5 max-h-[350px] overflow-y-auto pr-1">
                    {aiAnswersList.map((entry, idx) => (
                      <div key={idx} className="space-y-2 border-b border-brand-primary/5 pb-4 last:border-b-0">
                        {/* Prompt bubble */}
                        <div className="flex items-start space-x-2 text-right justify-end">
                          <div className="p-2 px-3 bg-brand-cream/50 text-brand-dark rounded-xl text-xs max-w-md font-medium inline-block">
                            <span className="font-bold text-brand-primary text-[10px] block text-left mb-0.5">My Inquiry:</span>
                            {entry.query}
                          </div>
                        </div>

                        {/* Answer output bubble */}
                        <div className="flex items-start space-x-2">
                          <div className="p-3 bg-brand-primary/5 text-brand-dark rounded-xl text-xs max-w-lg leading-relaxed whitespace-pre-wrap flex-1 text-left">
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-brand-primary text-[10px] uppercase">RAWTHINK AI Tutor:</span>
                              <span className="text-[10px] text-brand-dark/40">{entry.date}</span>
                            </div>
                            {entry.answer}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-brand-dark/50 text-center mt-4">
                  Powered by Google Gemini 3.5 Flash Model • Secure end-to-end fullstack execution.
                </p>

              </div>
            </div>

          </div>
        )}

        {/* TAB CONTENT: GORGEOUS DYNAMIC CERTIFICATE ISSUER VIEW WITH STRICT 3+ REFERRALS WINDOW LOCK SCREEN */}
        {activeTab === 'certificate' && (
          <div className="bg-brand-white rounded-3xl border border-brand-primary/10 p-6 sm:p-8 max-w-4xl mx-auto text-center shadow-sm space-y-6 relative overflow-hidden">
            
            {/* SCREEN LOCK OVERLAY SHIELD FOR REFERRALS COUNT < 3 */}
            {referralsCount < 3 && (
              <div className="absolute inset-0 bg-brand-white/95 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 sm:p-12 text-center animate-fade-in">
                <div className="max-w-md space-y-6 bg-brand-cream border-2 border-brand-primary/20 rounded-2xl p-6.5 sm:p-8 shadow-premium text-left">
                  
                  <div className="flex items-center space-x-2 pb-2.5 border-b border-brand-primary/10">
                    <div className="p-2 bg-brand-primary text-brand-white rounded-xl shadow-md">
                      <Lock size={20} />
                    </div>
                    <div>
                      <h3 className="font-display font-black text-sm uppercase tracking-wide text-brand-primary-900 leading-tight">Certificate locked</h3>
                      <p className="text-[10px] text-brand-dark/40 font-mono">Shield ID: rt-window-lock-{localUser.id}</p>
                    </div>
                  </div>

                  <p className="text-xs text-brand-dark/80 leading-relaxed">
                    Student completion credentials are locked on a safe window screen partition. To authorize release, your profile requires a minimum of <span className="font-black text-brand-primary text-sm">3 successful friend referrals</span> using your promo invite index below.
                  </p>

                  <div className="py-2.5 px-4 bg-brand-white border border-brand-primary/10 rounded-xl space-y-1">
                    <p className="text-[9px] uppercase tracking-wider text-brand-primary font-bold">Your Referral Invite Link:</p>
                    <p className="font-mono text-xs font-bold text-center tracking-widest bg-brand-cream py-1 rounded select-all text-brand-dark">
                      {localUser.referralCode || 'RAWTHINK99'}
                    </p>
                  </div>

                  {/* QUICK REFERRAL SIMULATOR IN BOX */}
                  <div className="p-4 bg-brand-white border border-brand-primary/15 rounded-xl space-y-3 shadow-inner">
                    <p className="text-[11px] font-bold text-brand-dark flex items-center space-x-1.5">
                      <span className="animate-pulse">●</span>
                      <span>Demo Simulator: Register Referred Friend</span>
                    </p>
                    
                    <form onSubmit={handleSimulateFriendSignup} className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          required
                          placeholder="Friend Name"
                          value={simName}
                          onChange={(e) => setSimName(e.target.value)}
                          className="p-2 bg-brand-cream/20 border border-brand-primary/10 rounded text-[10px] font-medium outline-none text-brand-dark"
                        />
                        <input 
                          type="email" 
                          required
                          placeholder="Friend Email"
                          value={simEmail}
                          onChange={(e) => setSimEmail(e.target.value)}
                          className="p-2 bg-brand-cream/20 border border-brand-primary/10 rounded text-[10px] font-medium outline-none text-brand-dark"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSimulating}
                        className="w-full py-1.5 bg-brand-primary hover:bg-brand-primary/95 text-white font-bold text-[10px] uppercase rounded transition cursor-pointer"
                      >
                        {isSimulating ? 'Processing referral nodes...' : 'Simulate Partner Invitation'}
                      </button>
                    </form>
                    <p className="text-[9px] text-brand-dark/50 leading-relaxed">Referral confirmation requires friend email registration. Simply simulate 3 signup invite entries here to unlock your Completion Certificate instantly!</p>
                  </div>

                </div>
              </div>
            )}

            {/* IF UNLOCKED, RENDER CERTIFICATE TAB LAYOUT DEFINITIONS */}
            <div className="max-w-xl mx-auto space-y-1.5">
              <span className="text-xs font-bold tracking-widest text-[#C19A6B] uppercase">Academic Credentials Unlocked</span>
              <h3 className="font-display font-black text-2xl text-brand-dark">Export Completion Certificate</h3>
              <p className="text-xs text-brand-dark/70">
                Congratulations! You met the referral threshold ({referralsCount} friend referred). Your completion slip key rt-id-{localUser.id} is active!
              </p>
            </div>

            {/* Premium Gold/Bronze Certificate renderer */}
            <div className="relative">
              
              <div 
                id="digital-certificate-preview"
                onClick={() => setZoomCertificate(!zoomCertificate)}
                className={`mx-auto bg-[#FDFBF7] border-8 border-double border-[#C19A6B] rounded-xl p-6 sm:p-10 shadow-lg relative max-w-2xl select-none transition-all duration-300 ${
                  zoomCertificate ? 'scale-105 cursor-zoom-out ring-4 ring-[#C19A6B]/30' : 'cursor-zoom-in hover:shadow-xl'
                }`}
              >
                
                {/* Custom Brand Logo Watermark (Replaces Rawthink Seal) */}
                <div className="absolute right-8 bottom-8 flex flex-col items-center">
                  <div className="relative w-12 h-12 bg-[#C19A6B] rounded-xl flex items-center justify-center text-white font-black font-display text-sm shadow-md overflow-hidden shrink-0 border border-[#C19A6B]/20 rotate-6">
                    <span className="text-white text-base tracking-tighter">RT</span>
                    <div className="absolute right-0 bottom-0 w-3.5 h-3.5 bg-[#5C4033] rounded-tl-lg" />
                  </div>
                  <span className="text-[7px] font-mono tracking-widest text-[#C19A6B] mt-1.5 font-bold">RAWTHINK CERT</span>
                </div>

                {/* Date Positioned top-left per custom guidelines */}
                <div className="absolute top-6 left-6 text-left font-mono text-[9px] uppercase tracking-widest text-[#5C4033] leading-none">
                  <p className="text-[#C19A6B] font-bold mb-1">Issued On</p>
                  <p className="text-[#5C4033] font-black text-xs">{new Date().toLocaleDateString()}</p>
                </div>

                <div className="border border-dashed border-[#C19A6B] p-4 sm:p-6 text-center space-y-4 pt-10">
                  
                  <div className="flex items-center justify-center space-x-1.5">
                    <Award size={18} className="text-[#C19A6B]" />
                    <span className="text-[10px] tracking-widest font-extrabold uppercase text-[#C19A6B] leading-none">
                      {myApprovedCourses.length > 1 ? 'Highest Executive Fellowship Distinction' : 'Platinum Class Academic Excellence'}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display font-black text-2xl text-[#5C4033] leading-none tracking-tight">RAWTHINK AI ACADEMY</h4>
                    <p className="text-[9px] text-[#C19A6B] font-bold uppercase tracking-widest mt-1">Digital Education Community Nepal • CP: 44600</p>
                  </div>

                  <p className="text-xs text-[#5C4033]/90 italic mt-4">This dynamic academic credential certificate is officially awarded to</p>

                  <div className="py-1">
                    <h3 className="font-display font-black text-xl sm:text-2xl text-[#C19A6B] tracking-tight">{localUser.name}</h3>
                  </div>

                  <p className="text-xs text-[#5C4033]/95 max-w-sm mx-auto leading-relaxed">
                    for successfully completing theoretical concepts and practical syllabus labs inside our classroom study program:<br />
                    <span className="font-black text-[13px] text-brand-dark block mt-2 tracking-wide uppercase">"{myApprovedCourses.length > 0 ? myApprovedCourses[0].title : 'Artificial Intelligence Concepts and Automations'}"</span>
                  </p>

                  {/* Dual authorized issuers (CEO & COO) sections with NO signature required */}
                  <div className="grid grid-cols-2 gap-8 pt-8 max-w-md mx-auto items-center text-center text-[9px] font-bold text-[#5C4033]/70 uppercase">
                    <div className="text-center font-mono">
                      <p className="text-[#C19A6B] leading-none mb-1.5">Authorized Issuer</p>
                      <p className="font-display font-black text-xs text-[#5C4033] tracking-tight">Anish Thapa</p>
                      <div className="w-16 h-[1px] bg-[#C19A6B]/30 mx-auto mt-2" />
                      <p className="text-[7.5px] font-mono text-[#5C4033]/60 tracking-wider mt-1">Designation COO</p>
                    </div>
                    <div className="text-center font-mono">
                      <p className="text-[#C19A6B] leading-none mb-1.5">Authorized Issuer</p>
                      <p className="font-display font-black text-xs text-[#5C4033] tracking-tight">Sashwat Khatiwada</p>
                      <div className="w-16 h-[1px] bg-[#C19A6B]/30 mx-auto mt-2" />
                      <p className="text-[7.5px] font-mono text-[#5C4033]/60 tracking-wider mt-1">Designation CEO</p>
                    </div>
                  </div>

                </div>
              </div>

              <p className="text-[10px] text-brand-dark/50 mt-3 italic flex items-center justify-center space-x-1">
                <span>🔍 Click or tap on the certificate to toggle Zoom mode.</span>
              </p>
            </div>

            {/* Downloader triggers block - LOCKED UNTIL referredDownloads >= 3 */}
            <div className="pt-4 border-t border-brand-primary/5 space-y-4">
              
              <div className="flex flex-col items-center justify-center space-y-2 max-w-md mx-auto">
                {localUser.referredDownloads < 3 ? (
                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-brand-dark space-y-2 text-left w-full shadow-inner leading-relaxed">
                    <p className="font-bold text-[#EA4335] flex items-center space-x-1">
                      <Lock size={12} />
                      <span>Certificate File Download Blocked from Outer Frame</span>
                    </p>
                    <p className="text-[11px] leading-normal text-brand-dark/75">
                      Although your completion certificate is released, our frame regulations block downloading unless at least **3 of your referred friends** download the RAWTHINK AI mobile application (or PWA).
                    </p>
                    
                    {/* Live simulator button */}
                    <button
                      onClick={handleSimulateFriendDownload}
                      className="w-full py-2 bg-[#EA4335] hover:bg-[#EA4335]/95 text-white font-bold rounded-lg text-center transition cursor-pointer text-[10px] uppercase shadow-sm flex items-center justify-center space-x-1 mt-1"
                    >
                      <Download size={11} />
                      <span>Simulate Refer Friend Download (Downloads: {localUser.referredDownloads || 0}/3)</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-xs text-emerald-950 text-left w-full leading-relaxed">
                    <p className="font-bold text-emerald-800 flex items-center space-x-1">
                      <CheckCircle size={13} className="text-emerald-700" />
                      <span>All Framework Criteria Completed!</span>
                    </p>
                    <p className="text-[11px] text-brand-dark/75 mt-0.5">Your referred friends downloaded the app successfully. You can now download your validated certificate!</p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (localUser.referredDownloads < 3) {
                      showNotification('Download blocked! Please simulate 3 referred friend downloads first to authorize certificate downloading.', 'error');
                      return;
                    }
                    // Generate premium printready HTML completion document inside a beautiful file download!
                    const docContent = `<!DOCTYPE html>
<html>
<head>
  <title>RAWTHINK AI: OFFICIAL CERTIFICATE - ${localUser.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;700;800&family=JetBrains+Mono&display=swap');
    body { font-family: 'Inter', sans-serif; background-color: #fcfaf3; color: #2d251e; padding: 40px; text-align: center; }
    .border { border: 12px double #c19a6b; padding: 40px; border-radius: 8px; max-width: 750px; margin: 0 auto; background: #fff; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
    h1 { color: #5c4033; font-size: 30px; letter-spacing: 2px; font-weight: 800; font-family: 'Space Grotesk', sans-serif; margin-bottom: 5px; }
    .sub { font-size: 11px; text-transform: uppercase; color: #c19a6b; font-weight: 800; letter-spacing: 3px; font-family: 'Space Grotesk', sans-serif; margin-bottom: 30px; }
    p { font-size: 13px; margin: 15px 0; color: #5c4033; }
    .name { font-size: 26px; font-weight: 800; color: #c19a6b; border-bottom: 2px solid #c19a6b; display: inline-block; padding: 5px 30px; margin: 10px 0; }
    .footer { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; font-size: 11px; }
    .date-box { position: absolute; top: 30px; left: 30px; text-align: left; font-family: 'JetBrains Mono', monospace; font-size: 10px; opacity: 0.8; }
    .logo-box { position: absolute; right: 30px; bottom: 30px; text-align: center; }
    .logo-badge { background-color: #c19a6b; color: #fff; padding: 8px 12px; font-weight: bold; font-size: 14px; border-radius: 8px; margin-bottom: 4px; display: inline-block; }
  </style>
</head>
<body>
  <div class="border">
    <div class="date-box">
      <strong>ISSUED DATE</strong><br/>
      ${new Date().toLocaleDateString()}
    </div>
    <div class="sub">
      ${myApprovedCourses.length > 1 ? 'HIGHEST EXECUTIVE FELLOWSHIP DISTINCTION' : 'PLATINUM CLASS ACADEMIC EXCELLENCE'}
    </div>
    <h1 style="margin-top:25px;">RAWTHINK AI ACADEMY</h1>
    <p style="text-transform:uppercase; font-size:9px; letter-spacing:1px; font-weight:bold;">Digital Education Community Nepal • CP: 44600</p>
    
    <p style="font-style: italic; margin-top: 30px;">This dynamic academic credential certificate is officially awarded to</p>
    <div class="name">${localUser.name}</div>
    <p>for demonstrating exceptional conceptual skill and successfully completing academic requirements in:</p>
    <p><strong>"${myApprovedCourses.length > 0 ? myApprovedCourses[0].title : 'Artificial Intelligence Concepts and Saturday Bootcamps'}"</strong></p>
    
    <div class="footer">
      <div style="border-top: 1px solid #eee; padding-top: 10px">
        <strong>ANISH THAPA</strong><br/>
        <span style="font-size:10px; opacity:0.6;">Designation COO</span>
      </div>
      <div style="border-top: 1px solid #eee; padding-top: 10px">
        <strong>SASHWAT KHATIWADA</strong><br/>
        <span style="font-size:10px; opacity:0.6;">Designation CEO</span>
      </div>
    </div>
    <div class="logo-box">
      <div class="logo-badge">RT</div>
      <div style="font-size:8px; opacity:0.6; font-family:'JetBrains Mono';">RAWTHINK AI</div>
    </div>
  </div>
</body>
</html>`;
                    const blob = new Blob([docContent], { type: 'text/html' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `rawthink_certificate_${localUser.name.toLowerCase().replace(/\s+/g, '_')}.html`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    showNotification('Vetted digital PDF completion slip downloading initiated safely!', 'success');
                  }}
                  disabled={localUser.referredDownloads < 3}
                  className={`flex items-center space-x-2 px-8 py-3 rounded-xl text-xs font-bold transition shadow-md cursor-pointer text-center ${
                    localUser.referredDownloads >= 3 
                      ? 'bg-brand-primary text-white hover:bg-brand-primary/95 hover:scale-105 duration-200' 
                      : 'bg-brand-dark/20 text-brand-dark/40 cursor-not-allowed'
                  }`}
                >
                  {localUser.referredDownloads >= 3 ? <Unlock size={14} /> : <Lock size={14} />}
                  <span>Download Print-Ready Certificate</span>
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
