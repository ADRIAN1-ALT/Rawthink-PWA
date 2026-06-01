import React from 'react';
import { User } from '../types';
import { ArrowRight } from 'lucide-react';

interface EsEwaGuideProps {
  currentUser: User | null;
  setView: (v: string) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function EsEwaGuide({ currentUser, setView, showNotification }: EsEwaGuideProps) {
  const openCourses = () => {
    if (!currentUser) {
      showNotification('Please sign in to upload your payment screenshot.', 'info');
      setView('auth');
      return;
    }
    setView('courses');
    showNotification('Open the course you paid for and upload the receipt screenshot in the checkout modal.', 'info');
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-brand-white rounded-2xl p-6 shadow-sm text-center">
        <h3 className="font-display font-black text-2xl text-brand-dark mb-3">Pay via eSewa (QR) — Manual Upload Guide</h3>
        <p className="text-xs text-brand-dark/70 mb-4">Scan the QR with your eSewa or bank app, complete payment, then return here and upload the payment screenshot in the course checkout modal.</p>

        <picture>
          <source srcSet="/esewa_qr.png" type="image/png" />
          <img src="/esewa_qr.svg" alt="eSewa QR - RAWTHINK" className="w-64 h-64 mx-auto rounded-xl border p-2 bg-white" />
        </picture>

        <div className="mt-4 space-y-2 text-left text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Open your eSewa app and scan the above QR code.</li>
            <li>Transfer the exact course fee shown in the course checkout.</li>
            <li>Save a screenshot of the payment success/receipt (must contain transaction ID).</li>
            <li>Click "Open Courses" below, open the course you paid for, and upload the screenshot in the checkout modal.</li>
          </ol>
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button onClick={openCourses} className="px-4 py-2 bg-brand-primary text-white rounded-xl font-bold flex items-center gap-2">
            Open Courses
            <ArrowRight size={14} />
          </button>
          <a href="/esewa_qr.png" target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-brand-primary rounded-xl text-brand-primary font-bold">Open QR Image</a>
        </div>

        <p className="text-[10px] text-brand-dark/60 mt-3">After submission the admin will verify the transaction and approve your enrollment.</p>
      </div>
    </div>
  );
}
