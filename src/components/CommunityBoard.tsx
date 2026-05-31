import React, { useState, useEffect } from 'react';
import { ForumPost, User } from '../types';
import { 
  MessageSquare, Heart, Plus, Megaphone, Award, 
  Send, User as UserIcon, Sparkles, Filter,
  Crown, Trophy, Users, RefreshCw, Gift
} from 'lucide-react';

interface CommunityBoardProps {
  currentUser: User | null;
  setView: (view: string) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function CommunityBoard({ currentUser, setView, showNotification }: CommunityBoardProps) {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  
  // Referral Leaderboard State
  const [referralLeaderboard, setReferralLeaderboard] = useState<any[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  
  // Post Creator State
  const [showCreator, setShowCreator] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'announcement' | 'discussion' | 'showcase' | 'qa'>('discussion');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comment state
  const [activePostIdForComment, setActivePostIdForComment] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/community/posts');
      const data = await resp.json();
      if (resp.ok) {
        setPosts(data.forum);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReferralLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const resp = await fetch('/api/referrals/leaderboard');
      const data = await resp.json();
      if (resp.ok) {
        setReferralLeaderboard(data.leaderboard || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchReferralLeaderboard();
  }, [currentUser]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      showNotification('Verify your user profile credentials by Logging In first.', 'info');
      setView('auth');
      return;
    }
    if (!title.trim() || !content.trim()) {
      showNotification('Title and post content are required.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: title.trim(),
          content: content.trim(),
          category
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        showNotification('Post successfully published! Earned +10 Points! 🚀', 'success');
        setTitle('');
        setContent('');
        setShowCreator(false);
        fetchPosts();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      showNotification(err.message || 'Network posting error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const resp = await fetch(`/api/community/posts/${postId}/like`, { method: 'POST' });
      if (resp.ok) {
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendComment = async (postId: string) => {
    if (!currentUser) {
      showNotification('Please Sign In before writing replies on the board.', 'info');
      setView('auth');
      return;
    }
    if (!commentContent.trim()) return;

    try {
      const resp = await fetch(`/api/community/posts/${postId}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          content: commentContent.trim()
        })
      });

      if (resp.ok) {
        const data = await resp.json();
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: data.comments } : p));
        setCommentContent('');
        showNotification('Reply posted successfully.', 'success');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filterCategory === 'All') return true;
    return p.category === filterCategory.toLowerCase();
  });

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream/10">
      <div className="max-w-4xl mx-auto">
        
        {/* Caption */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">RAWTHINK HUB</span>
            <h2 className="font-display font-black text-3xl text-brand-dark tracking-tight leading-none mt-1">
              Student Discussions
            </h2>
          </div>

          <button
            id="open-creator-btn"
            onClick={() => {
              if (!currentUser) {
                showNotification('Please Sign in to create discussion threads.', 'info');
                setView('auth');
                return;
              }
              setShowCreator(!showCreator);
            }}
            className="flex items-center space-x-1 px-4 py-2 bg-brand-primary text-brand-white text-xs font-bold rounded-xl hover:bg-brand-primary/95 transition shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>Produce Thread</span>
          </button>
        </div>

        {/* Thread Form Builder Component (Expandable) */}
        {showCreator && (
          <form onSubmit={handleCreatePost} className="bg-brand-white border border-brand-primary/20 rounded-2xl p-5 mb-8 space-y-4 shadow-sm animate-scaleUp text-left">
            <h3 className="font-display font-bold text-sm text-brand-dark">Conceive New Conversation Thread</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-8">
                <input
                  type="text"
                  required
                  placeholder="Subject title of showcase or question..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-brand-cream/10 border border-brand-primary/15 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="sm:col-span-4">
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-brand-cream/15 border border-brand-primary/15 rounded-xl text-xs sm:text-sm font-bold focus:outline-none"
                >
                  {currentUser?.role === 'admin' && (
                    <option value="announcement">📢 Announcement (Admin Broadcast)</option>
                  )}
                  <option value="discussion">👥 Simple Discussion</option>
                  <option value="showcase">🚀 Student Showcase Dev</option>
                  <option value="qa">💡 Q&A Technical Issue</option>
                </select>
              </div>
            </div>

            <div>
              <textarea
                required
                rows={4}
                placeholder="Compose content... describe code variables utilized, prompts, or questions clearly. Keep it constructive."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3.5 py-2 bg-brand-cream/10 border border-brand-primary/15 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowCreator(false)}
                className="px-4 py-2 border border-brand-primary/25 rounded-lg text-xs font-semibold text-brand-dark"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-brand-primary text-brand-white rounded-lg text-xs font-bold hover:bg-brand-primary/95 disabled:opacity-50"
              >
                {isSubmitting ? 'Publishing...' : 'Broadcast Thread'}
              </button>
            </div>
          </form>
        )}

        {/* SPECIAL TEASER ANNOUNCEMENT CARD */}
        <div id="school-app-announcement" className="bg-gradient-to-r from-[#5C4033] to-[#7A5A48] text-white p-5 rounded-2xl mb-6 text-left shadow-lg relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#C19A6B]/30">
          <div className="space-y-1.5 z-10">
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 bg-[#C19A6B] text-[#5C4033] rounded-full text-[9px] font-black uppercase tracking-widest leading-none">
              <Sparkles size={8} />
              <span>Future Release Teaser</span>
            </div>
            <h4 className="font-display font-black text-sm sm:text-base text-brand-cream leading-tight">
              AI-Powered School App Coming Soon!
            </h4>
            <p className="text-[11px] text-brand-cream/85 max-w-xl leading-relaxed">
              We are finalizing our custom mobile school platform to track grade cards, attendance markers, dynamic learning syllabus loops, and automated Saturday slot push notifications. Stay tuned for live download links!
            </p>
          </div>
          <div className="shrink-0 z-10">
            <span className="text-2xl animate-bounce inline-block">🏫</span>
          </div>
          {/* Subtle design element */}
          <div className="absolute right-0 bottom-0 top-0 left-0 bg-[radial-gradient(circle_at_top_right,rgba(193,154,107,0.15),transparent_60%)] pointer-events-none" />
        </div>

        {/* Grid structure for Threads + Referral Leaderboard Sidebar */}
        <div id="community-grid-layout" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-6 text-left">
          
          {/* Main Feed Column */}
          <div className="lg:col-span-8 space-y-6 order-2 lg:order-1">
            {/* Categories Controls Filter Bar */}
            <div className="flex space-x-2 overflow-x-auto pb-4 no-scrollbar">
              {['All', 'Announcement', 'Showcase', 'Discussion', 'QA'].map((badge) => (
                <button
                  key={badge}
                  onClick={() => setFilterCategory(badge)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold border shrink-0 cursor-pointer ${
                    filterCategory === badge
                      ? 'bg-brand-dark text-brand-cream border-brand-dark'
                      : 'bg-brand-white text-brand-dark border-brand-primary/10 hover:bg-brand-primary/10'
                  }`}
                >
                  {badge}
                </button>
              ))}
            </div>

            {/* Discussions thread listing */}
            {loading ? (
              <div className="py-20 text-center text-xs text-brand-dark/50">Gathering discussion threads from Kathmandu database...</div>
            ) : filteredPosts.length > 0 ? (
              <div className="space-y-6">
                {filteredPosts.map((post) => {
                  const isCommentActive = activePostIdForComment === post.id;
                  
                  return (
                    <div 
                      key={post.id}
                      className="bg-brand-white rounded-2xl border border-brand-primary/10 p-5 shadow-sm text-left relative overflow-hidden"
                    >
                      {/* Decorative background badge for specific categories */}
                      {post.category === 'announcement' && (
                        <div className="absolute top-0 right-0 px-3 py-1 bg-amber-500 text-white rounded-bl-xl text-[9px] font-extrabold tracking-widest uppercase">
                          Official Broadcast
                        </div>
                      )}

                      {/* Top user credit block */}
                      <div className="flex items-center space-x-2.5 mb-3">
                        <div className="w-8 h-8 rounded-full bg-brand-cream/80 flex items-center justify-center text-brand-primary border border-brand-primary/20">
                          <UserIcon size={14} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-xs font-bold text-brand-dark">{post.userName}</span>
                            {post.userRole === 'admin' && (
                              <span className="text-[9px] bg-amber-100 text-amber-700 font-bold px-1.5 py-0.2 rounded uppercase">Instructor</span>
                            )}
                          </div>
                          <p className="text-[10px] text-brand-dark/50">Published {new Date(post.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* Core Content */}
                      <h3 className="font-display font-extrabold text-sm sm:text-base text-brand-dark tracking-tight mb-2">
                        {post.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-brand-dark/85 leading-relaxed mb-4 whitespace-pre-line bg-brand-cream/10 p-3 rounded-xl border border-brand-cream">
                        {post.content}
                      </p>

                      {/* Interactions footer triggers */}
                      <div className="flex items-center space-x-4 pb-2 border-b border-brand-primary/5 text-xs text-brand-dark/60">
                        <button
                          onClick={() => handleLike(post.id)}
                          className="flex items-center space-x-1.5 hover:text-brand-primary transition"
                        >
                          <Heart size={14} className="text-brand-primary shrink-0" />
                          <span>{post.likes || 0} Likes</span>
                        </button>

                        <button
                          onClick={() => setActivePostIdForComment(isCommentActive ? null : post.id)}
                          className="flex items-center space-x-1.5 hover:text-brand-primary transition"
                        >
                          <MessageSquare size={14} className="text-brand-primary shrink-0" />
                          <span>{post.comments?.length || 0} Comments</span>
                        </button>
                      </div>

                      {/* Comments lists (Expandable inline) */}
                      {isCommentActive && (
                        <div className="pt-4 space-y-3 animate-fadeIn">
                          
                          {post.comments.length > 0 && (
                            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                              {post.comments.map((comm) => (
                                <div key={comm.id} className="bg-brand-cream/20 border border-brand-primary/5 rounded-xl p-3 text-xs">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-brand-dark flex items-center space-x-1">
                                      <span>{comm.userName}</span>
                                      {comm.userRole === 'admin' && (
                                        <span className="text-[8px] bg-amber-200 text-amber-800 font-black tracking-tight px-1 rounded uppercase">Staff</span>
                                      )}
                                    </span>
                                    <span className="text-[9px] text-brand-dark/40">{new Date(comm.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-brand-dark/80 leading-relaxed font-sans">{comm.content}</p>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Comment Input zone */}
                          <div className="flex space-x-2 pt-2">
                            <input
                              type="text"
                              value={commentContent}
                              onChange={(e) => setCommentContent(e.target.value)}
                              placeholder="Type reply..."
                              className="flex-1 px-3 py-2 bg-brand-cream/15 border border-brand-primary/10 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            />
                            <button
                              onClick={() => handleSendComment(post.id)}
                              className="p-2 bg-brand-primary text-brand-white rounded-xl hover:bg-brand-primary/95 shadow-sm transition cursor-pointer"
                            >
                              <Send size={12} />
                            </button>
                          </div>

                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 bg-brand-white rounded-3xl border border-brand-primary/10 max-w-xl mx-auto">
                <p className="text-sm font-semibold text-brand-dark/80">No discussions published under category list "{filterCategory}"</p>
              </div>
            )}
          </div>

          {/* Sidebar / Referral Leaderboard Column */}
          <div className="lg:col-span-4 space-y-6 order-1 lg:order-2">
            
            {/* REFERRAL LEADERBOARD CARD */}
            <div id="referral-leaderboard-card" className="bg-brand-white rounded-2xl border border-brand-primary/10 p-5 shadow-sm relative overflow-hidden flex flex-col">
              
              <div className="flex items-center justify-between mb-4 border-b border-brand-primary/5 pb-3">
                <div className="flex items-center space-x-2">
                  <Trophy size={16} className="text-amber-500 shrink-0" />
                  <h3 className="font-display font-black text-xs sm:text-sm text-brand-dark tracking-tight uppercase">
                    Referral Leaderboard
                  </h3>
                </div>
                
                <button 
                  type="button"
                  onClick={fetchReferralLeaderboard}
                  disabled={loadingLeaderboard}
                  className="p-1 px-1.5 hover:bg-brand-cream rounded-lg text-brand-dark/60 hover:text-brand-primary transition cursor-pointer flex items-center space-x-1"
                  title="Refresh standings"
                >
                  <RefreshCw size={10} className={loadingLeaderboard ? "animate-spin" : ""} />
                  <span className="text-[9px] font-bold">Refresh</span>
                </button>
              </div>

              <div className="text-[10px] text-brand-dark/70 leading-normal mb-4 bg-brand-cream/45 p-2.5 rounded-xl border border-brand-primary/5">
                📢 <strong>Earn Free Courses!</strong> Refer friends using your exclusive code below. When they sign up, you earn <strong>+33 Points</strong>.
                <div className="mt-1.5 flex flex-wrap gap-1 font-mono text-[9px] font-bold">
                  <span className="bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded">4 refs = 20% Off</span>
                  <span className="bg-indigo-50 text-indigo-800 px-1 py-0.2 rounded">6 refs = 30% Off</span>
                  <span className="bg-amber-50 text-amber-800 px-1 py-0.2 rounded">10 refs = 100% FREE Access</span>
                </div>
              </div>

              {loadingLeaderboard ? (
                <div className="py-8 text-center text-[10px] text-brand-dark/45 font-semibold">
                  Analyzing student rankings...
                </div>
              ) : referralLeaderboard.length > 0 ? (
                <div className="space-y-2">
                  {referralLeaderboard
                    .sort((a, b) => (b.referralsCount || 0) - (a.referralsCount || 0))
                    .slice(0, 5)
                    .map((leader, i) => {
                      const isCurrentUser = currentUser?.id === leader.id;
                    
                    // Rank badge visualization
                    let rankBadge = '';
                    let rankBg = 'bg-brand-cream/40 text-brand-dark';
                    if (i === 0) {
                      rankBadge = '👑';
                      rankBg = 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold';
                    } else if (i === 1) {
                      rankBadge = '🥈';
                      rankBg = 'bg-slate-100 text-slate-700 border border-slate-250 font-extrabold';
                    } else if (i === 2) {
                      rankBadge = '🥉';
                      rankBg = 'bg-amber-50 text-amber-900 border border-amber-200 font-extrabold';
                    } else {
                      rankBadge = `${i + 1}`;
                    }

                    return (
                      <div 
                        key={leader.id} 
                        className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                          isCurrentUser 
                            ? 'bg-brand-primary/5 border-brand-primary/30 font-bold' 
                            : 'bg-brand-white border-brand-primary/5 hover:border-brand-primary/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          {/* Rank */}
                          <div className={`w-6 h-6 rounded-lg text-[10px] flex items-center justify-center shrink-0 ${rankBg}`}>
                            {rankBadge}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-black text-brand-dark truncate flex items-center space-x-1">
                              <span>{leader.name}</span>
                              {isCurrentUser && (
                                <span className="text-[8px] bg-brand-primary text-white font-normal px-1 rounded uppercase">Me</span>
                              )}
                            </p>
                            <p className="text-[9px] text-brand-dark/50">
                              {leader.points} accumulated points
                            </p>
                          </div>
                        </div>

                        {/* Right counts */}
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center space-x-1 bg-brand-cream/80 px-2 py-0.5 rounded-lg border border-brand-primary/5">
                            <Users size={10} className="text-brand-primary" />
                            <span className="text-xs font-black text-brand-dark">
                              {leader.referralsCount}
                            </span>
                          </div>
                          <p className="text-[8px] mt-0.5 text-brand-dark/40 font-bold leading-none">
                            invites
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-[10px] text-brand-dark/40 italic">
                  No successful referrals yet. Invite classmates to lead!
                </div>
              )}

              {/* Your invite code widget */}
              <div className="mt-4 pt-3 border-t border-brand-primary/5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 text-brand-dark/60">
                  <Gift size={12} className="text-brand-primary shrink-0" />
                  <span className="text-[10px] font-bold">Your Invite ID:</span>
                </div>
                {currentUser ? (
                  <span className="text-[11px] font-mono font-black tracking-wider text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded border border-brand-primary/20">
                    {currentUser.referralCode}
                  </span>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setView('auth')}
                    className="text-[9px] font-black text-brand-primary hover:underline"
                  >
                    Login to view
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
