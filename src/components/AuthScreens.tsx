import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Mail, Lock, Phone, User as UserIcon, Sparkles, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, X, ExternalLink, Apple, Globe2, Smartphone } from 'lucide-react';

interface AuthScreensProps {
  onLoginSuccess: (user: User) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  setView: (view: string) => void;
}

export default function AuthScreens({ onLoginSuccess, showNotification, setView }: AuthScreensProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  
  // Registration States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');

  // Password Recovery State
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [awaitingReset, setAwaitingReset] = useState(false);

  // Loader state
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get('email');
    const tokenParam = params.get('token');
    if (emailParam && tokenParam) {
      setActiveTab('forgot');
      setForgotEmail(emailParam);
      setResetToken(tokenParam);
      setAwaitingReset(true);
    }
  }, []);

  // Phone sign-in state
  const [phoneLoginVisible, setPhoneLoginVisible] = useState(false);
  const [phoneLoginNumber, setPhoneLoginNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Simulated Gmail Overlay state
  const [simulatedEmail, setSimulatedEmail] = useState<{
    to: string;
    from: string;
    subject: string;
    body: string;
    nextActionUser?: User;
  } | null>(null);

  const handleOAuthSignIn = (provider: 'google' | 'apple') => {
    const uri = provider === 'google' ? '/auth/google' : '/auth/apple';
    window.location.href = uri;
  };

  const handlePhoneSendOtp = async () => {
    if (!phoneLoginNumber.trim()) {
      showNotification('Please enter a phone number before requesting OTP.', 'error');
      return;
    }

    setSocialLoading(true);
    try {
      const resp = await fetch('/api/auth/phone/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneLoginNumber.trim() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'OTP request failed.');
      setOtpSent(true);
      showNotification(data.message || `OTP sent to ${phoneLoginNumber}.`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'OTP request error', 'error');
    } finally {
      setSocialLoading(false);
    }
  };

  const handlePhoneVerify = async () => {
    if (!phoneLoginNumber.trim() || !otpCode.trim()) {
      showNotification('Phone number and OTP are both required.', 'error');
      return;
    }

    setSocialLoading(true);
    try {
      const resp = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneLoginNumber.trim(), otp: otpCode.trim() })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Phone login failed.');
      onLoginSuccess(data.user);
      showNotification('Phone sign-in successful! Welcome to RAWTHINK AI.', 'success');
      setView('dashboard');
    } catch (err: any) {
      showNotification(err.message || 'Phone login error', 'error');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showNotification('Email and password fields are required.', 'error');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Authentication verification failed.');
      }

      onLoginSuccess(data.user);
      showNotification(`Welcome back, ${data.user.name}! Enjoy class access! 🎓`, 'success');
      setView(data.user.role === 'admin' ? 'admin' : 'dashboard');

    } catch (err: any) {
      showNotification(err.message || 'Login error. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      showNotification('All account creation fields are mandatory.', 'error');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
          referralCode: referralCode.trim()
        })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Signup failed.');
      }

      // Instead of logging in silently, let's keep track of user and show the simulated Gmail success modal
      const simulatedMsg = data.simulatedEmailSent || {
        to: email.trim(),
        from: 'credentials-daemon@rawthink.ai',
        subject: '🔑 Your RAWTHINK AI Academy Secure Credentials Generated!',
        body: `Dear ${name},\n\nYour credentials have been successfully created on our server-side secure enrollment engine.`
      };

      setSimulatedEmail({
        ...simulatedMsg,
        nextActionUser: data.user
      });

      showNotification('Credentials generated and dispatched successfully to your Gmail! 📬', 'success');

    } catch (err: any) {
      showNotification(err.message || 'Sign up error. Try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      showNotification('Please enter a valid email address.', 'error');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Password recovery dispatch failed.');
      }

      setSimulatedEmail(data.simulatedEmailSent);
      showNotification('Password reset instructions sent successfully! Check your email for the token.', 'success');
      setAwaitingReset(true);
    } catch (err: any) {
      showNotification(err.message || 'Password retrieval error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !resetToken.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      showNotification('Email, token, and both password fields are required.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match. Please retype both fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const resp = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          token: resetToken.trim(),
          newPassword: newPassword.trim()
        })
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Reset password failed.');
      }
      showNotification(data.message || 'Password reset successful. Please sign in.', 'success');
      setAwaitingReset(false);
      setActiveTab('login');
      setResetToken('');
      setNewPassword('');
      setConfirmPassword('');
      setForgotEmail('');
    } catch (err: any) {
      showNotification(err.message || 'Password reset failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const closeEmailSimulation = () => {
    if (simulatedEmail?.nextActionUser) {
      // Continue and log them into the platform automatically on close!
      onLoginSuccess(simulatedEmail.nextActionUser);
      setView(simulatedEmail.nextActionUser.role === 'admin' ? 'admin' : 'dashboard');
    }
    setSimulatedEmail(null);
  };

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[80vh]">
      <div className="bg-brand-white border border-brand-primary/15 max-w-md w-full rounded-2xl p-6 sm:p-8 shadow-premium text-left relative overflow-hidden">
        
        {/* Apple-like decorative top bar details */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-brand-primary via-brand-dark to-[#5C4033]" />

        {/* Brand visual header */}
        <div className="text-center mb-8">
          <h2 className="font-display font-black text-2xl text-brand-dark tracking-tight">
            {activeTab === 'login' ? 'Proceed with Study Access' : activeTab === 'signup' ? 'Form Educational Credentials' : 'Retrieve Credentials'}
          </h2>
          <p className="text-xs text-brand-dark/70 mt-1.5">Learn AI • Build Faster • Stay Ahead</p>
        </div>

        {/* Tab triggers */}
        {activeTab !== 'forgot' && (
          <div className="grid grid-cols-2 gap-2 bg-brand-cream/45 p-1 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'login' 
                  ? 'bg-brand-white text-brand-dark shadow-sm'
                  : 'text-brand-dark/65 hover:text-brand-dark hover:bg-brand-white/30'
              }`}
            >
              Sign In Account
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeTab === 'signup' 
                  ? 'bg-brand-white text-brand-dark shadow-sm'
                  : 'text-brand-dark/65 hover:text-brand-dark hover:bg-brand-white/30'
              }`}
            >
              Register Candidate
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-primary font-bold">Sign in with modern access</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('google')}
                  disabled={socialLoading}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl border border-brand-primary/20 bg-white text-brand-dark text-[11px] font-semibold hover:border-brand-primary hover:bg-brand-cream/70"
                >
                  <Globe2 size={16} />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignIn('apple')}
                  disabled={socialLoading}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl border border-brand-primary/20 bg-white text-brand-dark text-[11px] font-semibold hover:border-brand-primary hover:bg-brand-cream/70"
                >
                  <Apple size={16} />
                  Apple
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPhoneLoginVisible(true);
                    setOtpSent(false);
                    setOtpCode('');
                  }}
                  disabled={socialLoading}
                  className="flex items-center justify-center gap-2 py-2 rounded-xl border border-brand-primary/20 bg-white text-brand-dark text-[11px] font-semibold hover:border-brand-primary hover:bg-brand-cream/70"
                >
                  <Smartphone size={16} />
                  Phone
                </button>
              </div>
              {phoneLoginVisible && (
                <div className="space-y-3 p-3 rounded-2xl border border-brand-primary/15 bg-brand-cream/30">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="98XXXXXXXX"
                      value={phoneLoginNumber}
                      onChange={(e) => setPhoneLoginNumber(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-brand-primary/20 bg-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex gap-2 flex-col sm:flex-row">
                    <button
                      type="button"
                      onClick={handlePhoneSendOtp}
                      className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-[11px] font-bold hover:bg-brand-primary/95"
                    >
                      {otpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneLoginVisible(false);
                        setPhoneLoginNumber('');
                        setOtpSent(false);
                        setOtpCode('');
                      }}
                      className="flex-1 py-2.5 rounded-xl border border-brand-primary/20 text-brand-dark text-[11px] font-semibold bg-white hover:bg-brand-cream/70"
                    >
                      Cancel
                    </button>
                  </div>
                  {otpSent && (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-dark">OTP Code</label>
                      <input
                        type="text"
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-brand-primary/20 bg-white text-xs font-semibold focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handlePhoneVerify}
                        disabled={socialLoading}
                        className="w-full py-2.5 rounded-xl bg-brand-dark text-white text-[11px] font-bold hover:bg-brand-dark/95"
                      >
                        {socialLoading ? 'Verifying...' : 'Verify Phone'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-brand-dark/40" size={16} />
                <input
                  type="email"
                  required
                  placeholder="e.g. student@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveTab('forgot')}
                  className="text-[10px] font-bold text-brand-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-brand-dark/40" size={16} />
                <input
                  type="password"
                  required
                  placeholder="Enter Account Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Helper tips displaying default sandbox logins for ease of UI testers */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/95 shadow transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>{loading ? 'Entering Classroom...' : 'Sign In Account'}</span>
              <ArrowRight size={13} />
            </button>
          </form>
        )}

        {/* SIGN UP FORM WITH REFERRAL CAPABILITIES */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Full Candidate Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-3 text-brand-dark/40" size={16} />
                <input
                  type="text"
                  required
                  placeholder="e.g. Prajwal Shrestha"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-brand-dark/40" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="student@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-[11px] font-semibold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 text-brand-dark/40" size={16} />
                  <input
                    type="tel"
                    required
                    placeholder="98********"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-2 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-[11px] font-semibold focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Set Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-brand-dark/40" size={16} />
                <input
                  type="password"
                  required
                  placeholder="Set your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {/* Optional invite code logic */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-brand-primary uppercase tracking-wide flex items-center space-x-1">
                  <Sparkles size={11} />
                  <span>Referral Invitation Code</span>
                </label>
                <span className="text-[10px] text-brand-dark/50">(Optional reward)</span>
              </div>
              <input
                type="text"
                placeholder="PROMOCODE"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="w-full px-4 py-2.5 bg-brand-cream/15 border border-brand-primary/25 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-brand-primary focus:outline-none"
              />
              <p className="text-[9px] text-brand-dark/50 mt-1">If invited by a friend, enter code to get <span className="font-bold">+15 free points</span> instantly.</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/95 shadow transition flex items-center justify-center space-x-1.5 cursor-pointer mt-2"
            >
              <span>{loading ? 'Spawning Profile node...' : 'Create Student Account'}</span>
              <ArrowRight size={13} />
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD SECTION */}
        {activeTab === 'forgot' && (
          <form onSubmit={awaitingReset ? handleResetPassword : handleForgotSimulation} className="space-y-4">
            <p className="text-xs text-brand-dark/75 leading-relaxed">
              Enter your registered email below. We will dispatch a reset token to your inbox, then let you choose a new password.
            </p>
            
            <div>
              <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-brand-dark/40" size={16} />
                <input
                  type="email"
                  required
                  placeholder="e.g. sandesh@gmail.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>
            </div>

            {awaitingReset && (
              <>
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Reset Token</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter the code from your email"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    className="w-full px-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1 uppercase tracking-wider">Confirm Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setAwaitingReset(false);
                  setResetToken('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="flex-1 py-2.5 border border-brand-primary/25 text-brand-dark rounded-xl text-xs font-semibold text-center mt-1 sm:mt-0"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 bg-brand-primary text-white rounded-xl text-xs font-bold text-center mt-1 sm:mt-0"
              >
                {loading ? (awaitingReset ? 'Updating...' : 'Sending...') : (awaitingReset ? 'Reset Password' : 'Send Reset Token')}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* DYNAMIC SERVER-SIDE GMAIL DISPATCH SIMULATOR MODAL */}
      {simulatedEmail && (
        <div className="fixed inset-0 z-50 bg-brand-dark/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-brand-white rounded-2xl border-4 border-[#EA4335] max-w-xl w-full text-left overflow-hidden shadow-2xl relative animate-fade-in my-8">
            
            {/* Red Gmail visual title bar */}
            <div className="bg-[#EA4335] text-brand-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="p-1 px-1.5 bg-brand-white text-[#EA4335] font-black rounded text-[10px] leading-none">M</div>
                <h3 className="font-display font-black text-xs sm:text-sm tracking-tight">RAWTHINK Simulated Gmail Cloud-Dispatch Service</h3>
              </div>
              <button 
                onClick={closeEmailSimulation}
                className="p-1 hover:bg-white/10 rounded-full transition text-white"
                title="Close Email Viewer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-brand-cream/40 rounded-xl border border-[#EA4335]/10 space-y-1.5 text-xs">
                <p className="flex justify-between border-b border-brand-primary/5 pb-1 text-brand-dark/70">
                  <span><strong>From:</strong> &lt;{simulatedEmail.from}&gt;</span>
                  <span className="text-[10px] font-mono text-brand-primary font-bold">● SMTP LIVE STATUS</span>
                </p>
                <p className="flex justify-between border-b border-brand-primary/5 pb-1 text-brand-dark/70">
                  <span><strong>To:</strong> &lt;<span className="font-bold underline text-brand-primary">{simulatedEmail.to}</span>&gt;</span>
                  <span className="text-[10px] text-brand-dark/50 font-mono">2026-05-31</span>
                </p>
                <p className="text-brand-dark font-medium pt-0.5">
                  <strong>Subject:</strong> {simulatedEmail.subject}
                </p>
              </div>

              {/* Email Content Box */}
              <div className="bg-brand-dark text-[#D4AF37]/90 p-4.5 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner max-h-[300px] overflow-y-auto border border-brand-primary/20">
                {simulatedEmail.body}
              </div>

              {/* Helpful tips warning info */}
              <div className="p-3 bg-brand-cream border border-brand-primary/15 rounded-xl text-[10px] sm:text-xs text-brand-dark/85 leading-relaxed">
                <p className="font-bold text-brand-primary mb-0.5 flex items-center space-x-1">
                  <span className="animate-pulse">●</span>
                  <span>How to Log In?</span>
                </p>
                We have generated these secure credentials in their own gmail that they give. Copy the password above, click <strong>"Acknowledge & Enter Classroom"</strong> to let our system log you in automatically, or log in manually with your new password!
              </div>

              {/* Confirm submit options */}
              <div className="pt-2 border-t border-brand-primary/5 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={closeEmailSimulation}
                  className="flex-1 py-3 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-brand-primary/95 transition-all text-center flex items-center justify-center space-x-1.5 cursor-pointer shadow-md"
                >
                  <span>Acknowledge & Enter Classroom</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
