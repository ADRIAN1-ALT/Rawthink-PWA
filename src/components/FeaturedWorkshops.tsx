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

  // Community referral discounts (mirror logic in CourseCatalog)
  const referCount = currentUser?.referrals?.length || 0;
  let discountPercent = 0;
  if (referCount >= 10) discountPercent = 100;
  else if (referCount >= 6) discountPercent = 30;
  else if (referCount >= 4) discountPercent = 20;
  const getDiscountedPrice = (price: number) => {
    const discountAmount = Math.round((price * discountPercent) / 100);
    return Math.max(0, price - discountAmount);
  };

  const handlePayNow = (courseId: string) => {
    // Use the manual eSewa QR flow: set intended course and redirect user
    // to the courses view where they can upload a receipt screenshot.
    sessionStorage.setItem('intended_enroll_course_id', courseId);

    if (!currentUser) {
      showNotification('Please sign in to submit eSewa receipt and enroll.', 'info');
      setView('auth');
      return;
    }

    if (currentUser.role !== 'student') {
      showNotification('Only student accounts can complete eSewa purchases.', 'info');
      return;
    }

    setView('courses');
    showNotification('Open the selected course and upload your eSewa receipt screenshot to complete enrollment.', 'info');
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
                <div className="text-right">
                  {discountPercent > 0 ? (
                    <div className="text-right">
                      <div className="text-[10px] font-extrabold text-emerald-700 uppercase">🎉 {discountPercent}% Off</div>
                      <div className="text-xl font-extrabold text-[#5C4033]">
                        <span className="line-through text-[#5C4033]/40 mr-2">Rs. {course.price}</span>
                        <span>Rs. {getDiscountedPrice(course.price)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xl font-extrabold text-[#5C4033]">Rs. {course.price}</div>
                  )}
                </div>
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
                    onClick={() => setView('esewa-qr')}
                    className="px-3 py-2 bg-white border border-[#F7F1E8] rounded-xl text-[#5C4033] text-sm flex items-center gap-2"
                  >
                    <span>How to Pay</span>
                    <ArrowRight size={14} />
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
