import React from 'react';
import { Course, User } from '../types';
import { ArrowRight } from 'lucide-react';

interface FeaturedWorkshopsProps {
  courses: Course[];
  currentUser: User | null;
  setView: (v: string) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function FeaturedWorkshops({ courses, currentUser, setView, showNotification }: FeaturedWorkshopsProps) {
  const visible = courses && courses.length > 0;

  const handlePayNow = async (courseId: string) => {
    if (!currentUser) {
      showNotification('Please log in to enroll via eSewa.', 'info');
      setView('auth');
      return;
    }

    if (currentUser.role !== 'student') {
      showNotification('Only student accounts can complete eSewa purchases.', 'info');
      return;
    }

    try {
      const res = await fetch('/api/esewa/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, courseId })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.error || 'Failed to start payment.', 'error');
        return;
      }

      // Build and submit an HTML form to eSewa (UAT by default)
      const esewaUrl = data.esewaUrl || 'https://uat.esewa.com.np/epay/main';
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = esewaUrl;
      const fields: Record<string, string | number> = {
        tAmt: data.tAmt || data.amount || 0,
        amt: data.amount || 0,
        txAmt: 0,
        psc: 0,
        pdc: 0,
        pid: data.pid,
        scd: data.scd || 'EPAYTEST',
        su: data.su,
        fu: data.fu
      };

      Object.entries(fields).forEach(([k, v]) => {
        const inp = document.createElement('input');
        inp.type = 'hidden';
        inp.name = k;
        inp.value = String(v);
        form.appendChild(inp);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      console.error('Checkout error', err);
      showNotification('Payment failed. Try again later.', 'error');
    }
  };

  if (!visible) return null;

  // Prefer the first three courses in the seed order
  const picked = [courses[0], courses[1], courses[2]].filter(Boolean) as Course[];

  return (
    <section id="featured-workshops" className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-bold tracking-widest text-[#C19A6B] uppercase">Featured Workshops</span>
          <h2 className="font-display font-black text-3xl text-[#5C4033] mt-2">Live Sessions & Pay-Now Enrollment</h2>
          <p className="text-sm text-[#5C4033]/70 mt-2 max-w-2xl mx-auto">Select a session and complete secure eSewa checkout to reserve your seat. Login required for students.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {picked.map((course) => (
            <div key={course.id} className="bg-white border border-[#F7F1E8] rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-lg text-[#5C4033]">{course.title}</h3>
                <div className="text-xl font-extrabold text-[#5C4033]">Rs. {course.price}</div>
              </div>

              <p className="text-[12px] text-[#5C4033]/70 mt-2">{course.duration} • {course.schedule}</p>

              <div className="mt-4 text-sm text-[#5C4033]">
                <strong className="uppercase text-[10px] tracking-widest text-[#C19A6B]">Curriculum Spans:</strong>
                <ul className="mt-2 list-disc list-inside text-[13px] space-y-1">
                  {course.features.slice(0, 6).map((f, idx) => (
                    <li key={idx} className="text-[#5C4033]/85">{f}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 bg-[#F7F1E8] p-3 rounded-lg text-sm">
                <strong className="text-[11px] text-[#5C4033]">Exclusive bonuses included:</strong>
                <ul className="mt-2 list-inside list-disc text-[12px] text-[#5C4033]/85">
                  {course.bonuses.slice(0, 4).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-[12px] text-[#5C4033]/80">{course.schedule}</div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePayNow(course.id)}
                    className="px-4 py-2 bg-[#C19A6B] text-white rounded-xl font-bold text-sm hover:opacity-95 transition"
                  >
                    Pay Now To Enroll
                  </button>
                  <button
                    onClick={() => {
                      setView('courses');
                      showNotification('Opening full course catalog...', 'info');
                    }}
                    className="px-3 py-2 bg-white border border-[#F7F1E8] rounded-xl text-[#5C4033] text-sm flex items-center gap-2"
                  >
                    <span>Learn More</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
