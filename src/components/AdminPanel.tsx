import React, { useState, useEffect } from 'react';
import { User, Enrollment, Course, SessionSchedule, AITool } from '../types';
import { 
  Trophy, Users, Calendar, Award, BookOpen, Clock, 
  CheckCircle, XCircle, Download, FileText, Send, 
  Sparkles, ShieldCheck, TrendingUp, DollarSign, Activity, AlertCircle,
  Plus, Edit3, Trash2, Save, ExternalLink, Cpu, X
} from 'lucide-react';

interface AdminPanelProps {
  currentUser: User | null;
  courses: Course[];
  schedule: SessionSchedule[];
  enrollments: Enrollment[];
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  onPaymentDecision: (enrollmentId: string, decision: 'approved' | 'rejected') => void;
  onPostAnnouncement: (title: string, content: string) => void;
  onIssueManualCert: (userId: string, workshopName: string) => void;
  studentsList: User[];
  tools: AITool[];
  onToolsChange: (updatedTools: AITool[]) => void;
  onScheduleChange?: (schedule: SessionSchedule[]) => void;
}

export default function AdminPanel({
  currentUser, courses, schedule, enrollments, showNotification, 
  onPaymentDecision, onPostAnnouncement, onIssueManualCert, studentsList,
  onScheduleChange, tools = [], onToolsChange
}: AdminPanelProps) {
  
  // States
  const [analytics, setAnalytics] = useState<any>({
    totalUsers: 0,
    totalRevenue: 0,
    registeredStudents: 0,
    pendingPayments: 0,
    upcomingWorkshops: 0,
  });
  
  // Form Announcement
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceContent, setAnnounceContent] = useState('');
  const [sendingAnnounce, setSendingAnnounce] = useState(false);

  // Manual Certificate Issuer state
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCertWorkshop, setSelectedCertWorkshop] = useState('AI Foundations Bootcamp');

  // Active view tabs of Admin panel
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'payments' | 'classes' | 'announcements' | 'exporter' | 'tools'>('analytics');

  // Schedule Manager State
  const [scheduleSessionId, setScheduleSessionId] = useState<string>('');
  const [scheduleCourse, setScheduleCourse] = useState<string>(courses[0]?.id || '');
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleInstructor, setScheduleInstructor] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00 AM');
  const [scheduleSeats, setScheduleSeats] = useState(30);
  const [isScheduling, setIsScheduling] = useState(false);

  // Tools CRUD States
  const [editingTool, setEditingTool] = useState<AITool | null>(null);
  const [toolName, setToolName] = useState('');
  const [toolCategory, setToolCategory] = useState<'Writing' | 'Image' | 'Video' | 'Coding' | 'Research' | 'Presentation' | 'Productivity'>('Productivity');
  const [toolDescription, setToolDescription] = useState('');
  const [toolTagsString, setToolTagsString] = useState('');
  const [toolLink, setToolLink] = useState('');
  const [toolIconName, setToolIconName] = useState('Cpu');
  const [isSubmittingTool, setIsSubmittingTool] = useState(false);
  // QR upload states for merchant QR image
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  const fetchAdminStats = async () => {
    try {
      const resp = await fetch('/api/admin/stats');
      if (resp.ok) {
        const data = await resp.json();
        setAnalytics(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, [enrollments]);

  useEffect(() => {
    if (!scheduleCourse && courses.length > 0) {
      setScheduleCourse(courses[0].id);
    }
  }, [courses, scheduleCourse]);

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="py-20 text-center text-red-600 font-bold max-w-md mx-auto">
        <AlertCircle className="mx-auto mb-2 text-rose-600" size={32} />
        <p>Access Denied: You do not possess structural Master Admin authorization tokens.</p>
      </div>
    );
  }

  const handleDecidePayment = async (enrollmentId: string, decision: 'approved' | 'rejected') => {
    try {
      const resp = await fetch('/api/admin/payments/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId,
          decision,
          adminId: currentUser.id
        })
      });

      if (resp.ok) {
        showNotification(`eSewa Transaction ${decision.toUpperCase()} successfully.`, 'success');
        onPaymentDecision(enrollmentId, decision);
        fetchAdminStats();
      } else {
        const data = await resp.json();
        throw new Error(data.error);
      }
    } catch (e: any) {
      showNotification(e.message || 'Verification decision submission failed.', 'error');
    }
  };

  // QR upload helpers
  const handleQrFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setQrFile(e.target.files[0]);
    }
  };

  const uploadQrImage = async () => {
    if (!qrFile) {
      showNotification('Please choose an image file first.', 'error');
      return;
    }
    setIsUploadingQr(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const resp = await fetch('/api/admin/upload-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminId: currentUser?.id, filename: 'esewa_qr.png', imageBase64: dataUrl })
        });

        const res = await resp.json();
        if (!resp.ok) throw new Error(res.error || 'Upload failed');
        showNotification('Merchant QR uploaded successfully.', 'success');
        setQrFile(null);
      };

      reader.onerror = () => {
        showNotification('Failed to read the image file.', 'error');
      };
      reader.readAsDataURL(qrFile);
    } catch (err: any) {
      showNotification(err.message || 'Upload failed', 'error');
    } finally {
      setIsUploadingQr(false);
    }
  };

  const handleBroadcastAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announceTitle.trim() || !announceContent.trim()) return;

    setSendingAnnounce(true);
    try {
      const resp = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          title: announceTitle.trim(),
          content: announceContent.trim(),
          category: 'announcement'
        })
      });

      if (resp.ok) {
        showNotification('Official Admin Broadcast has been successfully posted to student news feeds!', 'success');
        onPostAnnouncement(announceTitle.trim(), announceContent.trim());
        setAnnounceTitle('');
        setAnnounceContent('');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSendingAnnounce(false);
    }
  };

  const handleIssueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showNotification('Please select a student first.', 'error');
      return;
    }

    try {
      const resp = await fetch('/api/admin/certificates/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedStudentId,
          certificateName: selectedCertWorkshop,
          adminId: currentUser.id
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        showNotification('Certificate issued successfully! Statically synced to student cockpit.', 'success');
        onIssueManualCert(selectedStudentId, selectedCertWorkshop);
        setSelectedStudentId('');
      } else {
        throw new Error(data.error);
      }
    } catch (e: any) {
      showNotification(e.message || 'Issue failed', 'error');
    }
  };

  const cancelScheduleEdit = () => {
    setScheduleSessionId('');
    setScheduleTitle('');
    setScheduleInstructor('');
    setScheduleDate('');
    setScheduleTime('10:00 AM');
    setScheduleSeats(30);
    setScheduleCourse(courses[0]?.id || '');
  };

  const handleScheduleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle.trim() || !scheduleInstructor.trim() || !scheduleDate.trim() || !scheduleTime.trim() || !scheduleCourse) {
      showNotification('All schedule fields are required.', 'error');
      return;
    }

    setIsScheduling(true);
    try {
      const payload = {
        courseId: scheduleCourse,
        workshopName: scheduleTitle.trim(),
        instructor: scheduleInstructor.trim(),
        date: scheduleDate,
        time: scheduleTime,
        totalSeats: scheduleSeats
      };

      const endpoint = scheduleSessionId ? `/api/schedule/${scheduleSessionId}` : '/api/schedule';
      const method = scheduleSessionId ? 'PUT' : 'POST';
      const resp = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Could not save schedule session.');
      }

      showNotification(`Workshop schedule ${scheduleSessionId ? 'updated' : 'created'} successfully!`, 'success');
      cancelScheduleEdit();
      if (onScheduleChange) {
        onScheduleChange(data.schedule);
      }
    } catch (err: any) {
      showNotification(err.message || 'Schedule save failed.', 'error');
    } finally {
      setIsScheduling(false);
    }
  };

  const handleDeleteSchedule = async (sessionId: string) => {
    if (!window.confirm('Delete this schedule session now? This is permanent.')) {
      return;
    }

    try {
      const resp = await fetch(`/api/schedule/${sessionId}`, { method: 'DELETE' });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Delete failed.');
      }
      showNotification('Schedule session deleted successfully.', 'success');
      if (onScheduleChange) {
        onScheduleChange(data.schedule);
      }
      if (scheduleSessionId === sessionId) {
        cancelScheduleEdit();
      }
    } catch (err: any) {
      showNotification(err.message || 'Schedule delete error.', 'error');
    }
  };

  const startScheduleEdit = (session: SessionSchedule) => {
    setScheduleSessionId(session.id);
    setScheduleCourse(session.courseId);
    setScheduleTitle(session.workshopName);
    setScheduleInstructor(session.instructor);
    setScheduleDate(session.date);
    setScheduleTime(session.time);
    setScheduleSeats(session.totalSeats);
  };

  // Excel Excel direct downloading proxy
  const triggerExcelExport = (type: string) => {
    showNotification(`Compiling raw digital spreadsheet matching "${type}" schema...`, 'info');
    // Direct anchor link location triggers our server's text/csv response
    window.location.href = `/api/admin/export/${type}`;
  };

  const handleAddNewTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolName.trim() || !toolDescription.trim() || !toolLink.trim()) {
      showNotification('All required tool fields must be provided.', 'error');
      return;
    }

    setIsSubmittingTool(true);
    try {
      const resp = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: toolName.trim(),
          category: toolCategory,
          description: toolDescription.trim(),
          tags: toolTagsString.split(',').map(t => t.trim()).filter(Boolean),
          link: toolLink.trim(),
          iconName: toolIconName
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        showNotification('New AI resource tool registered successfully!', 'success');
        onToolsChange(data.tools);
        // Reset
        setToolName('');
        setToolDescription('');
        setToolTagsString('');
        setToolLink('');
        setToolIconName('Cpu');
      } else {
        throw new Error(data.error || 'Failed to submit tool');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmittingTool(false);
    }
  };

  const handleUpdateTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTool) return;
    if (!toolName.trim() || !toolDescription.trim() || !toolLink.trim()) {
      showNotification('All tool fields must be provided.', 'error');
      return;
    }

    setIsSubmittingTool(true);
    try {
      const resp = await fetch(`/api/tools/${editingTool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: toolName.trim(),
          category: toolCategory,
          description: toolDescription.trim(),
          tags: toolTagsString.split(',').map(t => t.trim()).filter(Boolean),
          link: toolLink.trim(),
          iconName: toolIconName
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        showNotification('AI resource tool updated successfully!', 'success');
        onToolsChange(data.tools);
        // Reset edit form
        setEditingTool(null);
        setToolName('');
        setToolDescription('');
        setToolTagsString('');
        setToolLink('');
        setToolIconName('Cpu');
      } else {
        throw new Error(data.error || 'Failed to update tool');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmittingTool(false);
    }
  };

  const handleDeleteTool = async (toolId: string) => {
    if (!window.confirm('Are you absolutely sure you want to delete this AI tool from directories? This operation is irreversible.')) {
      return;
    }

    try {
      const resp = await fetch(`/api/tools/${toolId}`, {
        method: 'DELETE'
      });

      const data = await resp.json();
      if (resp.ok) {
        showNotification('AI Tool deleted successfully!', 'success');
        onToolsChange(data.tools);
        if (editingTool?.id === toolId) {
          setEditingTool(null);
          setToolName('');
          setToolDescription('');
          setToolTagsString('');
          setToolLink('');
          setToolIconName('Cpu');
        }
      } else {
        throw new Error(data.error || 'Deletion failed');
      }
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const startEditTool = (tool: AITool) => {
    setEditingTool(tool);
    setToolName(tool.name);
    setToolCategory(tool.category);
    setToolDescription(tool.description);
    setToolTagsString(tool.tags.join(', '));
    setToolLink(tool.link);
    setToolIconName(tool.iconName || 'Cpu');
  };

  const cancelEditTool = () => {
    setEditingTool(null);
    setToolName('');
    setToolDescription('');
    setToolTagsString('');
    setToolLink('');
    setToolIconName('Cpu');
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 bg-brand-cream/15 min-h-screen text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Title bar */}
        <div className="bg-brand-dark p-6 sm:p-8 rounded-3xl text-brand-cream flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-widest text-[#C19A6B] uppercase flex items-center space-x-1">
              <ShieldCheck size={14} />
              <span>Super Admin Master Control Center</span>
            </span>
            <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">RAWTHINK AI Console</h2>
          </div>
          
          <div className="px-4 py-2 bg-brand-primary/20 border border-[#C19A6B]/30 rounded-xl text-xs font-bold tracking-wider">
            Connected: {currentUser.name} 🎖️
          </div>
        </div>

        {/* Analytical Scoreboard widgets */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-brand-white rounded-2xl p-4 border border-brand-primary/10 shadow-sm">
            <p className="text-[10px] text-brand-dark/50 uppercase font-black">All Enrolled</p>
            <p className="font-display font-black text-2xl mt-1 text-brand-dark">{analytics.totalUsers || 0}</p>
            <div className="flex items-center text-[10px] text-emerald-600 font-bold mt-1.5 space-x-0.5">
              <Users size={11} />
              <span>Registered Accounts</span>
            </div>
          </div>

          <div className="bg-brand-white rounded-2xl p-4 border border-brand-primary/10 shadow-sm">
            <p className="text-[10px] text-brand-dark/50 uppercase font-black">Admissions Revenue</p>
            <p className="font-display font-black text-2xl mt-1 text-brand-dark">Rs. {analytics.totalRevenue || 0}</p>
            <div className="flex items-center text-[10px] text-emerald-600 font-bold mt-1.5 space-x-0.5">
              <DollarSign size={11} />
              <span>Net eSewa Deposits</span>
            </div>
          </div>

          <div className="bg-brand-white rounded-2xl p-4 border border-brand-primary/10 shadow-sm">
            <p className="text-[10px] text-brand-dark/50 uppercase font-black">Active Candidates</p>
            <p className="font-display font-black text-2xl mt-1 text-brand-dark">{analytics.registeredStudents || 0}</p>
            <div className="flex items-center text-[10px] text-brand-primary font-bold mt-1.5 space-x-0.5">
              <Activity size={11} />
              <span>Total Students List</span>
            </div>
          </div>

          <div className="bg-brand-white rounded-2xl p-4 border border-brand-primary/10 shadow-sm">
            <p className="text-[10px] text-brand-dark/50 uppercase font-black">Verification queue</p>
            <p className="font-display font-black text-2xl mt-1 text-brand-primary animate-pulse">{analytics.pendingPayments || 0}</p>
            <div className="flex items-center text-[10px] text-[#C19A6B] font-bold mt-1.5 space-x-0.5">
              <AlertCircle size={11} />
              <span>eSewa screenshots pending</span>
            </div>
          </div>

          <div className="bg-brand-white rounded-2xl p-4 border border-brand-primary/10 shadow-sm col-span-2 lg:col-span-1">
            <p className="text-[10px] text-brand-dark/50 uppercase font-black">Classes Curries</p>
            <p className="font-display font-black text-2xl mt-1 text-brand-dark">{analytics.upcomingWorkshops || 0}</p>
            <div className="flex items-center text-[10px] text-brand-primary font-bold mt-1.5 space-x-0.5">
              <Calendar size={11} />
              <span>Active Workshops</span>
            </div>
          </div>

        </div>

        {/* Sub-tabs toggles */}
        <div className="flex space-x-2 overflow-x-auto pb-2 border-b border-brand-primary/10">
          {[
            { id: 'analytics', label: 'Bento Analytics' },
            { id: 'payments', label: `eSewa Approvals Verification (Queue)` },
            { id: 'announcements', label: 'Official Announcements' },
            { id: 'classes', label: 'Issue Certificates Pro' },
            { id: 'exporter', label: 'Excel Exporter Matrix' },
            { id: 'tools', label: 'Manage AI Tools Directory ⚙️' },
          ].map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubTab(sub.id as any)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeSubTab === sub.id
                  ? 'bg-brand-primary text-brand-white shadow-sm'
                  : 'bg-brand-white text-brand-dark border border-brand-primary/5 hover:bg-brand-primary/15'
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>

        {/* TAB: BENTO ANALYTICS CHARTS */}
        {activeSubTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Revenue Curves representation */}
            <div className="bg-brand-white rounded-2xl p-6 border border-brand-primary/10 shadow-sm">
              <h3 className="font-display font-extrabold text-[#5C4033] text-sm sm:text-base mb-4 flex items-center space-x-1">
                <TrendingUp size={16} className="text-brand-primary" />
                <span>eSewa Revenue Daily Velocity</span>
              </h3>
              
              <div className="p-4 bg-brand-cream/20 rounded-xl space-y-4">
                {/* Visual grid representing revenue bars and conversions */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span>Course 1 (AI Foundations Rs. 299):</span>
                    <span className="font-bold">{enrollments.filter(e => e.courseId === 'course-1' && e.status === 'approved').length} Active Admissions</span>
                  </div>
                  <div className="w-full h-2.5 bg-brand-cream rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-primary" 
                      style={{ width: `${Math.min(100, (enrollments.filter(e => e.courseId === 'course-1' && e.status === 'approved').length * 20))}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span>Course 2 (AI Productivity Rs. 349):</span>
                    <span className="font-bold">{enrollments.filter(e => e.courseId === 'course-2' && e.status === 'approved').length} Active Admissions</span>
                  </div>
                  <div className="w-full h-2.5 bg-brand-cream rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#C19A6B]" 
                      style={{ width: `${Math.min(100, (enrollments.filter(e => e.courseId === 'course-2' && e.status === 'approved').length * 25))}%` }} 
                    />
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between font-mono">
                    <span>Course 3 (Developer Masterclass Rs. 599):</span>
                    <span className="font-bold">{enrollments.filter(e => e.courseId === 'course-3' && e.status === 'approved').length} Active Admissions</span>
                  </div>
                  <div className="w-full h-2.5 bg-brand-cream rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-brand-dark" 
                      style={{ width: `${Math.min(100, (enrollments.filter(e => e.courseId === 'course-3' && e.status === 'approved').length * 30))}%` }} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions summary metrics bento */}
            <div className="bg-brand-white rounded-2xl p-6 border border-brand-primary/10 shadow-sm space-y-4">
              <h3 className="font-display font-extrabold text-[#5C4033] text-sm sm:text-base mb-2">Registered Candidate Logs</h3>
              <div className="divide-y divide-brand-cream text-xs">
                {studentsList.slice(0, 4).map((stud) => (
                  <div key={stud.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-brand-dark">{stud.name}</p>
                      <p className="text-[10px] text-brand-dark/50">{stud.email}</p>
                    </div>
                    <span className="font-mono bg-brand-cream/80 px-2 py-0.5 rounded text-[10px] font-bold">{stud.referralCode}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB: eSewa APPROVALS VERIFICATION QUEUE */}
        {activeSubTab === 'payments' && (
          <div className="bg-brand-white rounded-2xl border border-brand-primary/10 p-6 shadow-sm">
            <h3 className="font-display font-extrabold text-brand-dark text-base mb-4">eSewa Payments Screen-Proof Verification Queue</h3>
            <div className="mb-4 flex items-center gap-3">
              <input id="admin-qr-file" type="file" accept="image/*" onChange={handleQrFileChange} className="hidden" />
              <label htmlFor="admin-qr-file" className="px-3 py-2 bg-white border border-brand-primary/10 rounded-xl text-xs cursor-pointer">Choose QR Image</label>
              <span className="text-xs text-brand-dark/60">{qrFile ? qrFile.name : 'No file choosen'}</span>
              <button
                onClick={uploadQrImage}
                disabled={!qrFile || isUploadingQr}
                className="px-3 py-2 bg-brand-primary text-white rounded-xl text-xs font-bold ml-3 disabled:opacity-60"
              >
                {isUploadingQr ? 'Uploading...' : 'Upload Merchant QR'}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-primary/10 text-brand-dark/60 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Student</th>
                    <th className="py-3 px-2">Course Target</th>
                    <th className="py-3 px-2">Net Price</th>
                    <th className="py-3 px-2 font-mono">eSewa Txn ID</th>
                    <th className="py-3 px-2">Screenshot Receipt</th>
                    <th className="py-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-primary/5">
                  {enrollments.map((en) => (
                    <tr key={en.id} className="hover:bg-brand-cream/5 text-brand-dark/95">
                      <td className="py-4 px-2">
                        <p className="font-bold">{en.userName}</p>
                        <p className="text-[10px] text-brand-dark/50">{en.userEmail}</p>
                      </td>
                      <td className="py-4 px-2 font-medium">{en.courseTitle}</td>
                      <td className="py-4 px-2 font-mono">Rs. {en.price}</td>
                      <td className="py-4 px-2 font-mono font-bold text-brand-primary">{en.transactionId}</td>
                      <td className="py-4 px-2">
                        {en.screenshotUrl ? (
                          <a 
                            href={en.screenshotUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-brand-primary underline font-bold"
                          >
                            Inspect Receipt (Open tab)
                          </a>
                        ) : (
                          <span className="text-[10px] text-brand-dark/40 italic">Null uploaded</span>
                        )}
                      </td>
                      <td className="py-4 px-2 text-right space-x-1">
                        {en.status === 'pending' ? (
                          <div className="flex justify-end space-x-1.5">
                            <button
                              onClick={() => handleDecidePayment(en.id, 'approved')}
                              className="p-1 px-2.5 bg-emerald-600 text-brand-cream rounded-lg text-[10px] font-black hover:bg-emerald-700 transition flex items-center space-x-0.5 cursor-pointer"
                            >
                              <CheckCircle size={10} />
                              <span>Verify</span>
                            </button>
                            <button
                              onClick={() => handleDecidePayment(en.id, 'rejected')}
                              className="p-1 px-2.5 bg-rose-600 text-brand-cream rounded-lg text-[10px] font-black hover:bg-rose-700 transition flex items-center space-x-0.5 cursor-pointer"
                            >
                              <XCircle size={10} />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${en.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                            {en.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {enrollments.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-brand-dark/50 italic">
                        No transactions logs recorded inside the platform yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: MANUAL EXCEL EXPORTER MATRIX */}
        {activeSubTab === 'exporter' && (
          <div className="bg-brand-white rounded-2xl border border-brand-primary/10 p-6 shadow-sm space-y-5">
            <div>
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Excel Exporter Matrix</span>
              <h3 className="font-display font-black text-lg text-brand-dark mt-1">Export Downloadable Spreadsheets (.CSV)</h3>
              <p className="text-xs text-brand-dark/70">Produce raw, structured CSV coordinates sheets instantly. Clean layouts perfectly compatible with Microsoft Excel or Google Sheets.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              
              <div className="p-4 bg-brand-cream/20 rounded-xl space-y-3 border flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-brand-dark">Registered Users</h4>
                  <p className="text-[11px] text-brand-dark/70 mt-1">Outputs complete student user registry: IDs, emails, streak counts logs, and timestamps.</p>
                </div>
                <button
                  id="export-users-excel"
                  onClick={() => triggerExcelExport('users')}
                  className="w-full py-2 bg-brand-primary text-brand-white rounded-lg text-xs font-bold hover:bg-brand-primary/95 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Export Users Registry</span>
                </button>
              </div>

              <div className="p-4 bg-brand-cream/20 rounded-xl space-y-3 border flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-brand-dark">Paid/Verified Students Only</h4>
                  <p className="text-[11px] text-brand-dark/70 mt-1">Outputs student credentials matching paid and approved eSewa transaction records.</p>
                </div>
                <button
                  id="export-paid-excel"
                  onClick={() => triggerExcelExport('paid')}
                  className="w-full py-2 bg-brand-primary text-brand-white rounded-lg text-xs font-bold hover:bg-brand-primary/95 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Export Paid Learners</span>
                </button>
              </div>

              <div className="p-4 bg-brand-cream/20 rounded-xl space-y-3 border flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-brand-dark">Workshop Participants List</h4>
                  <p className="text-[11px] text-brand-dark/70 mt-1">Outputs the upcoming Saturdays schedules records, remaining seats and instructors coordinates.</p>
                </div>
                <button
                  id="export-participants-excel"
                  onClick={() => triggerExcelExport('participants')}
                  className="w-full py-2 bg-brand-primary text-brand-white rounded-lg text-xs font-bold hover:bg-brand-primary/95 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Export Active Schedules</span>
                </button>
              </div>

              <div className="p-4 bg-brand-cream/20 rounded-xl space-y-3 border flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-brand-dark">Referrals & Promocodes Logs</h4>
                  <p className="text-[11px] text-brand-dark/70 mt-1">Outputs complete invitation codes performance logs plus client signup points.</p>
                </div>
                <button
                  id="export-referrals-excel"
                  onClick={() => triggerExcelExport('referrals')}
                  className="w-full py-2 bg-brand-primary text-brand-white rounded-lg text-xs font-bold hover:bg-brand-primary/95 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Export Referrals performance</span>
                </button>
              </div>

              <div className="p-4 bg-brand-cream/20 rounded-xl space-y-3 border flex flex-col justify-between">
                <div>
                  <h4 className="font-display font-bold text-xs sm:text-sm text-brand-dark">Resources Clicks Analytics</h4>
                  <p className="text-[11px] text-brand-dark/70 mt-1">Outputs guideline download counter states, tracking ebook metrics.</p>
                </div>
                <button
                  id="export-downloads-excel"
                  onClick={() => triggerExcelExport('downloads')}
                  className="w-full py-2 bg-brand-primary text-brand-white rounded-lg text-xs font-bold hover:bg-brand-primary/95 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Download size={12} />
                  <span>Export Downloads metrics</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* TAB: OFFICIAL BROADCAST ANNOUNCEMENTS */}
        {activeSubTab === 'announcements' && (
          <div className="bg-brand-white rounded-2xl border border-brand-primary/10 p-6 shadow-sm max-w-2xl">
            <h3 className="font-display font-black text-lg text-brand-dark mb-4">Post Official Broadcast announcements</h3>
            
            <form onSubmit={handleBroadcastAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase">Broadcast Topic:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Workshop Recording update for Saturday"
                  value={announceTitle}
                  onChange={(e) => setAnnounceTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs sm:text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase">Announcement Body:</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type broadcast text... this will appear instantly in every student news widget."
                  value={announceContent}
                  onChange={(e) => setAnnounceContent(e.target.value)}
                  className="w-full p-3 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs focus:outline-none resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={sendingAnnounce}
                className="px-5 py-2.5 bg-brand-primary text-brand-white rounded-xl text-xs font-bold hover:bg-brand-primary/95 flex items-center space-x-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send size={12} />
                <span>Publish Broadcast</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB: MANUAL CERTIFICATE ISSUER */}
        {activeSubTab === 'classes' && (
          <div className="bg-brand-white rounded-2xl border border-[#C19A6B]/20 p-6 shadow-sm max-w-xl">
            <div className="mb-4">
              <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Manual Sign-off Override</span>
              <h3 className="font-display font-black text-lg text-brand-dark mt-0.5">Issue Student Completion Certificate</h3>
              <p className="text-xs text-brand-dark/70 mt-1">Select a student user entry to manually grant them verified completion credentials.</p>
            </div>

            <form onSubmit={handleIssueCert} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase">Select Student Candidate:</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-bold focus:outline-none text-brand-dark"
                >
                  <option value="">-- Choose Candidate --</option>
                  {studentsList.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase">Workshop Program:</label>
                <select
                  value={selectedCertWorkshop}
                  onChange={(e) => setSelectedCertWorkshop(e.target.value)}
                  className="w-full px-3 py-2.5 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none text-brand-dark"
                >
                  <option value="AI Foundations Bootcamp">AI Foundations Bootcamp (NPR 5,000)</option>
                  <option value="AI Productivity Workshop">AI Productivity Workshop (NPR 7,500)</option>
                  <option value="AI Dev & Automation Masterclass">AI Dev & Automation Masterclass (NPR 15,000)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-brand-primary text-brand-white rounded-xl text-xs font-bold hover:bg-brand-primary/95 flex items-center space-x-1 cursor-pointer"
              >
                <Award size={12} />
                <span>Issue & Sign Certificate</span>
              </button>
            </form>

            <div className="mt-8 bg-brand-cream/20 rounded-2xl border border-brand-primary/15 p-5 text-left">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">Schedule Manager</span>
                  <h4 className="font-display font-black text-base text-brand-dark mt-1">Create or update workshop sessions</h4>
                </div>
                {scheduleSessionId && (
                  <button
                    type="button"
                    onClick={cancelScheduleEdit}
                    className="text-[10px] font-bold uppercase text-brand-dark/70 hover:text-brand-primary"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleScheduleSubmission} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1">Workshop Title</label>
                  <input
                    type="text"
                    value={scheduleTitle}
                    onChange={(e) => setScheduleTitle(e.target.value)}
                    placeholder="e.g. AI Productivity Bootcamp"
                    className="w-full px-3.5 py-2.5 bg-white border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1">Course</label>
                    <select
                      value={scheduleCourse}
                      onChange={(e) => setScheduleCourse(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                    >
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>{course.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1">Instructor</label>
                    <input
                      type="text"
                      value={scheduleInstructor}
                      onChange={(e) => setScheduleInstructor(e.target.value)}
                      placeholder="Instructor name"
                      className="w-full px-3.5 py-2.5 bg-white border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1">Time</label>
                    <input
                      type="text"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      placeholder="10:00 AM"
                      className="w-full px-3.5 py-2.5 bg-white border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-brand-dark uppercase tracking-widest mb-1">Seats</label>
                    <input
                      type="number"
                      min={1}
                      value={scheduleSeats}
                      onChange={(e) => setScheduleSeats(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 bg-white border border-brand-primary/20 rounded-xl text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isScheduling}
                  className="w-full py-2.5 bg-[#C19A6B] text-white rounded-xl text-xs font-bold hover:bg-[#A98356] transition"
                >
                  {scheduleSessionId ? 'Update Session' : 'Create Session'}
                </button>
              </form>

              <div className="mt-6 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-widest text-brand-dark/60">Current Sessions</h5>
                {schedule.length ? (
                  schedule.map((session) => (
                    <div key={session.id} className="p-3 rounded-2xl border border-brand-primary/15 bg-white text-left text-xs">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <p className="font-bold text-brand-dark">{session.workshopName}</p>
                          <p className="text-[10px] text-brand-dark/60">{session.date} • {session.time}</p>
                          <p className="text-[10px] text-brand-dark/60">{session.instructor} • Seats: {session.seatsRemaining}/{session.totalSeats}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => startScheduleEdit(session)}
                            className="px-2 py-1 rounded-lg bg-brand-primary/10 text-brand-primary text-[10px] font-bold hover:bg-brand-primary/15"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteSchedule(session.id)}
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 text-[10px] font-bold hover:bg-rose-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-brand-dark/50">No scheduled sessions exist yet. Create one to notify students directly.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: TOOLS CRUD MANAGER */}
        {activeSubTab === 'tools' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Form Column */}
            <div className="lg:col-span-5 bg-brand-white rounded-2xl border border-brand-primary/15 p-6 shadow-sm space-y-5">
              <div>
                <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">
                  {editingTool ? 'Edit AI Tool Details' : 'Curator Input'}
                </span>
                <h3 className="font-display font-black text-lg text-brand-dark mt-0.5">
                  {editingTool ? 'Modify Existing AI Tool' : 'Register New AI Tool'}
                </h3>
                <p className="text-xs text-brand-dark/70 mt-1">
                  Fill in the sandbox parameters. All fields are instantly synced across student sandboxes upon submission.
                </p>
              </div>

              <form onSubmit={editingTool ? handleUpdateTool : handleAddNewTool} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">AI Tool Name: *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Claude 3.5 Sonnet, Midjourney v6"
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs sm:text-sm font-semibold text-brand-dark focus:outline-none focus:ring-1 focus:ring-brand-primary/50"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Category: *</label>
                    <select
                      value={toolCategory}
                      onChange={(e: any) => setToolCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-bold focus:outline-none text-brand-dark"
                    >
                      <option value="Writing">📁 Writing</option>
                      <option value="Image">🎨 Image</option>
                      <option value="Video">🎬 Video</option>
                      <option value="Coding">💻 Coding</option>
                      <option value="Research">🔬 Research</option>
                      <option value="Presentation">📊 Presentation</option>
                      <option value="Productivity">⚡ Productivity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Icon Type:</label>
                    <select
                      value={toolIconName}
                      onChange={(e) => setToolIconName(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs font-bold focus:outline-none text-brand-dark"
                    >
                      <option value="Cpu">Cpu (Default)</option>
                      <option value="Palette">Palette</option>
                      <option value="Sparkles">Sparkles</option>
                      <option value="Code">Code</option>
                      <option value="BookOpen">BookOpen</option>
                      <option value="Tv">Tv</option>
                      <option value="Briefcase">Briefcase</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Tool Launch URL: *</label>
                  <input
                    type="url"
                    required
                    placeholder="e.g. https://claude.ai"
                    value={toolLink}
                    onChange={(e) => setToolLink(e.target.value)}
                    className="w-full px-3.5 py-2 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-brand-dark"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Tags (comma-separated):</label>
                  <input
                    type="text"
                    placeholder="e.g. Chatbot, LLM, Writing, Free"
                    value={toolTagsString}
                    onChange={(e) => setToolTagsString(e.target.value)}
                    className="w-full px-3.5 py-2 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary/50 text-brand-dark"
                  />
                  <p className="text-[10px] text-brand-dark/50 mt-1">Separate tags with commas.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Description: *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Type sandbox/directory guide description..."
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                    className="w-full p-3 bg-brand-cream/15 border border-brand-primary/20 rounded-xl text-xs focus:outline-none resize-none leading-relaxed text-brand-dark"
                  />
                </div>

                <div className="flex space-x-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingTool}
                    className="flex-1 py-2.5 bg-[#C19A6B] text-brand-white rounded-xl text-xs font-bold hover:bg-[#A98356] transition flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Save size={14} />
                    <span>{isSubmittingTool ? 'Saving...' : editingTool ? 'Update Tool' : 'Register Tool'}</span>
                  </button>
                  
                  {editingTool && (
                    <button
                      type="button"
                      onClick={cancelEditTool}
                      className="px-4 py-2.5 bg-brand-cream text-brand-dark border border-brand-primary/10 rounded-xl text-xs font-bold hover:bg-brand-primary/10 transition flex items-center space-x-1 cursor-pointer"
                    >
                      <X size={14} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Directory Listings Column & Details */}
            <div className="lg:col-span-7 bg-brand-white rounded-2xl border border-brand-primary/15 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-display font-black text-lg text-brand-dark">Curated AI Directory Index</h3>
                  <p className="text-xs text-brand-dark/70 mt-0.5">Showing list of {tools.length} customized artificial intelligence sandbox tools.</p>
                </div>
              </div>

              {tools.length > 0 ? (
                <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
                  {tools.map((t) => (
                    <div 
                      key={t.id} 
                      className={`p-4 bg-brand-cream/10 border rounded-xl flex items-start justify-between gap-3 transition-colors ${
                        editingTool?.id === t.id ? 'border-[#C19A6B] bg-[#C19A6B]/5' : 'border-brand-primary/10 hover:bg-brand-cream/20'
                      }`}
                    >
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center space-x-2">
                          <span className="font-display font-extrabold text-brand-dark text-sm leading-tight">{t.name}</span>
                          <span className="text-[9px] font-black uppercase text-brand-primary tracking-widest px-1.5 py-0.5 bg-brand-primary/10 rounded">
                            {t.category}
                          </span>
                        </div>
                        
                        <p className="text-xs text-brand-dark/75 leading-relaxed">{t.description}</p>
                        
                        {/* Tags list */}
                        <div className="flex flex-wrap gap-1 pt-1.5">
                          {t.tags.map((tag, idx) => (
                            <span key={idx} className="text-[9px] font-semibold text-brand-dark/50 bg-brand-cream/80 px-2 py-0.5 rounded-md uppercase tracking-tight">
                              {tag}
                            </span>
                          ))}
                        </div>

                        <a 
                          href={t.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center space-x-1 text-[10px] text-brand-primary hover:underline font-mono mt-2"
                        >
                          <span>{t.link}</span>
                          <ExternalLink size={10} />
                        </a>
                      </div>

                      {/* Administrative actions button trigger */}
                      <div className="flex items-center space-x-1.5 shrink-0">
                        <button
                          onClick={() => startEditTool(t)}
                          title="Edit Tool"
                          className="p-1.5 rounded-lg bg-brand-cream/50 text-brand-dark/80 hover:bg-brand-primary/10 hover:text-brand-dark transition-colors cursor-pointer"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteTool(t.id)}
                          title="Delete Tool"
                          className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-brand-cream/10 border border-dashed border-brand-primary/20 rounded-2xl">
                  <Cpu className="mx-auto text-brand-dark/40 mb-2" size={32} />
                  <p className="text-xs font-bold text-brand-dark/70">No tools found in the active database registry.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
