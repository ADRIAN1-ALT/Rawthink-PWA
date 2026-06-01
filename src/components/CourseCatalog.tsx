import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Course, User, Enrollment } from '../types';
import { 
  Award, Clock, Check, Calendar, ArrowRight, Upload, 
  X, CheckCircle, Info, Sparkles, Smartphone, Landmark 
} from 'lucide-react';

interface CourseCatalogProps {
  courses: Course[];
  currentUser: User | null;
  setView: (view: string) => void;
  onEnrollSuccess: (enrollment: Enrollment) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
  purchasedCourseIds: string[];
  pendingCourseIds: string[];
  onUserUpdate?: (user: User) => void;
}

export default function CourseCatalog({
  courses, currentUser, setView, onEnrollSuccess, showNotification, purchasedCourseIds, pendingCourseIds
  , onUserUpdate
}: CourseCatalogProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  
  const referCount = currentUser?.referrals?.length || 0;
  let discountPercent = 0;
  if (referCount >= 10) discountPercent = 100;
  else if (referCount >= 6) discountPercent = 30;
  else if (referCount >= 4) discountPercent = 20;

  const getDiscountedPrice = (price: number) => {
    const discountAmount = Math.round((price * discountPercent) / 100);
    return Math.max(0, price - discountAmount);
  };
  
  // Payment Form State
  const [transactionId, setTransactionId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenEnrollModal = (course: Course) => {
    if (!currentUser) {
      showNotification('Please Sign In or Create an Account before enrolling in workshops.', 'info');
      sessionStorage.setItem('intended_enroll_course_id', course.id); // Save intended course
      setView('auth');
      return;
    }
    setSelectedCourse(course);
    setTransactionId('');
    setRemarks('');
    setScreenshotBase64(null);
    setScreenshotName('');
    setEnrollSuccessMessage(false);
  };

  const handleCloseModal = () => {
    setSelectedCourse(null);
    sessionStorage.removeItem('intended_enroll_course_id');
  };

  React.useEffect(() => {
    if (currentUser && courses.length > 0) {
      const intendedId = sessionStorage.getItem('intended_enroll_course_id');
      if (intendedId) {
        const course = courses.find(c => c.id === intendedId);
        if (course) {
          const isPurchased = purchasedCourseIds.includes(course.id);
          const isPending = pendingCourseIds.includes(course.id);
          if (!isPurchased && !isPending) {
            setSelectedCourse(course);
            setTransactionId('');
            setRemarks('');
            setScreenshotBase64(null);
            setScreenshotName('');
            setEnrollSuccessMessage(false);
            showNotification(`Continuing enrollment for "${course.title}".`, 'success');
          }
        }
        sessionStorage.removeItem('intended_enroll_course_id');
      }
    }
  }, [currentUser, courses, purchasedCourseIds, pendingCourseIds]);

  // Convert uploaded image to Base64 to save in db.json server-side
  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification('Please upload an image file (PNG, JPG, JPEG) of your receipt.', 'error');
      return;
    }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      setScreenshotBase64(reader.result as string);
      showNotification(`Receipt screenshot loaded successfully: ${file.name}`, 'success');
    };
    reader.onerror = () => {
      showNotification('Failed to read payment screenshot.', 'error');
    };
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      showNotification('Please enter the standard eSewa Transaction ID.', 'error');
      return;
    }
    if (!screenshotBase64) {
      showNotification('Please upload/drop the transaction screenshot as proof.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          courseId: selectedCourse?.id,
          transactionId: transactionId.trim(),
          remarks: remarks.trim(),
          screenshot: screenshotBase64
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Enrollment registration failed.');
      }

      showNotification('eSewa payment receipt has been successfully uploaded!', 'success');
      setEnrollSuccessMessage(true);
      onEnrollSuccess(data.enrollment);
      
      setTimeout(() => {
        setIsSubmitting(false);
        setSelectedCourse(null);
      }, 3500);

    } catch (err: any) {
      showNotification(err.message || 'Network submission error.', 'error');
      setIsSubmitting(false);
    }
  };

  const handlePurchaseWithCoins = async (course: Course) => {
    if (!currentUser) {
      showNotification('Please sign in to purchase courses with coins.', 'info');
      setView('auth');
      return;
    }

    const cost = course.price;
    const balance = (currentUser.coins ?? currentUser.points ?? 0);
    const confirmPay = window.confirm(`Spend ${cost} coins to purchase "${course.title}"? Your balance: ${balance} coins.`);
    if (!confirmPay) return;
    if (balance < cost) {
      showNotification('Insufficient coins for this purchase.', 'error');
      return;
    }

    try {
      const resp = await fetch('/api/courses/purchase', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: currentUser.id, courseId: course.id }) });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Purchase failed');

      // Update enrollments and user state
      onEnrollSuccess(data.enrollment);
      showNotification('Course purchased successfully with coins!', 'success');
      if (onUserUpdate) {
        onUserUpdate({ ...currentUser, coins: data.coins ?? currentUser.coins, coinsInvested: data.coinsInvested ?? currentUser.coinsInvested });
      }
    } catch (err: any) {
      showNotification(err.message || 'Purchase failed', 'error');
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream/40">
      <div className="max-w-7xl mx-auto">
        
        {/* Caption */}
        <div id="courses-section-header" className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Elite Masterclasses</span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-brand-dark tracking-tight mt-1 mb-3">
            Accelerate Your AI Skill Span
          </h2>
          <p className="font-sans text-sm text-brand-dark/70">
            Select standard, productivity-booster, or raw developer workshop paths. Real-world curricula built to deliver high results fast.
          </p>
        </div>

        {/* Catalog list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => {
            const isPurchased = purchasedCourseIds.includes(course.id);
            const isPending = pendingCourseIds.includes(course.id);

            return (
              <div 
                key={course.id}
                className="bg-brand-white rounded-2xl border border-brand-primary/10 overflow-hidden shadow-sm flex flex-col justify-between transition-all hover:shadow-lg hover:-translate-y-1 relative"
              >
                {/* Visual Badge indicator */}
                {course.badge && (
                  <div className="absolute top-4 right-4 z-10 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-brand-primary text-brand-cream uppercase shadow-sm">
                    {course.badge}
                  </div>
                )}

                {/* Card Top Information */}
                <div className="p-6">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-brand-primary/80 mb-3">
                    <Clock size={14} />
                    <span>{course.duration} Session Duration</span>
                  </div>

                  <h3 className="font-display font-black text-lg text-brand-dark tracking-tight mb-2">
                    {course.title}
                  </h3>
                  
                  {/* Price representation */}
                  <div className="flex items-baseline mb-5 text-[#4A3225]">
                    <span className="font-sans text-xs font-bold mr-1">Rs.</span>
                    <span className="font-display font-black text-3xl">{course.price}</span>
                    <span className="text-xs text-[#5C4033]/70 ml-1.5 font-medium">Single Admission</span>
                  </div>

                  {/* Highlights section */}
                  <p className="text-xs font-bold text-brand-dark/80 tracking-wider uppercase mb-3">Curriculum Spans:</p>
                  <ul className="space-y-2 mb-6">
                    {course.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start text-xs text-brand-dark/85 leading-none">
                        <Check size={14} className="text-brand-primary shrink-0 mr-2 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Bonus section */}
                  <div className="border-t border-brand-primary/10 pt-4 mt-4 bg-brand-cream/10 p-3 rounded-xl">
                    <p className="text-[10px] font-black text-brand-primary tracking-widest uppercase mb-2">Exclusive Bonuses Included:</p>
                    <ul className="space-y-1.5">
                      {course.bonuses.map((bonus, bIdx) => (
                        <li key={bIdx} className="flex items-center text-[11px] font-semibold text-brand-dark/95">
                          <Sparkles size={11} className="text-brand-primary shrink-0 mr-1.5" />
                          <span>{bonus}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action footer button */}
                <div className="p-6 bg-brand-cream/20 border-t border-brand-primary/5">
                  <p className="text-[10px] font-medium text-brand-dark/60 mb-3 text-center flex items-center justify-center space-x-1">
                    <Calendar size={11} />
                    <span>{course.schedule}</span>
                  </p>

                  {isPurchased ? (
                    <button
                      disabled
                      className="w-full text-center py-2.5 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <CheckCircle size={14} />
                      <span>Enrolled & Ready (Join Sat)</span>
                    </button>
                  ) : isPending ? (
                    <button
                      disabled
                      className="w-full text-center py-2.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping mr-1" />
                      <span>Pending eSewa Approval</span>
                    </button>
                  ) : (
                    <button
                      id={`enroll-${course.id}`}
                      onClick={() => handleOpenEnrollModal(course)}
                      className="w-full text-center py-2.5 bg-brand-primary text-brand-white rounded-xl text-xs font-bold hover:bg-brand-primary/95 shadow-sm transition hover:translate-y-[-1px] flex items-center justify-center space-x-1"
                    >
                      <span>Pay Now To Enroll</span>
                      <ArrowRight size={13} />
                    </button>
                  )}
                  {/* Option: Purchase instantly with coins if balance available */}
                  {!isPurchased && !isPending && currentUser && ((currentUser.coins ?? currentUser.points ?? 0) >= course.price) && (
                    <button
                      onClick={() => handlePurchaseWithCoins(course)}
                      className="w-full mt-2 text-center py-2 bg-[#C19A6B] text-white rounded-xl text-xs font-bold shadow-sm"
                    >
                      <span>Buy with {course.price} Coins</span>
                    </button>
                  )}
                  {!isPurchased && (
                    <button
                      onClick={() => setView('esewa-qr')}
                      className="w-full mt-3 text-center py-2 bg-white text-brand-primary rounded-xl text-xs font-bold border border-brand-primary/10"
                    >
                      How to Pay (QR Guide)
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* eSewa Checkout Form Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-brand-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative my-8 animate-scaleUp">
              
              <button 
                id="close-enroll-modal"
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="absolute top-4 right-4 text-brand-dark/50 hover:text-brand-dark p-1.5 rounded-full hover:bg-brand-cream transition cursor-pointer"
              >
                <X size={18} />
              </button>

              {enrollSuccessMessage ? (
                /* Dynamic visual success banner matching confetti expectations */
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-emerald-600 animate-bounce shadow-inner">
                    <CheckCircle size={38} />
                  </div>
                  <h3 className="font-display font-black text-2xl text-brand-dark">Receipt Uploaded!</h3>
                  <p className="text-sm text-brand-dark/70 max-w-md mx-auto">
                    Excellent! We received your eSewa deposit proof for <span className="font-bold">"{selectedCourse.title}"</span>. 
                    Our super admin team is validating the transaction ID: <span className="font-mono bg-brand-cream/80 px-2 py-0.5 rounded text-xs font-semibold">{transactionId}</span>.
                  </p>
                  <p className="text-xs text-brand-primary font-bold">You will be notified in your profile instantly on approval.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitPayment} className="space-y-5">
                  <div className="text-center mb-1">
                    <span className="text-xs font-bold text-brand-primary tracking-widest uppercase">Direct eSewa QR Payment Gateway</span>
                    <h3 className="font-display font-black text-xl text-brand-dark mt-1">
                      Enroll in "{selectedCourse.title}"
                    </h3>
                    <p className="text-xs text-brand-dark/70 mt-1">Follow the three quick steps below to initiate your class seat:</p>
                  </div>

                  {/* QR Core Interface */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center bg-brand-cream/30 p-4 rounded-xl border border-brand-primary/10">
                    
                    {/* Scannable card representation */}
                    <div className="sm:col-span-5 text-center flex flex-col items-center">
                      {/* eSewa branding and QR */}
                      <div className="bg-[#60BB46] text-white px-3 py-1 rounded text-[10px] font-black uppercase mb-2 tracking-wide flex items-center space-x-1 shadow-sm">
                        <Smartphone size={10} />
                        <span>eSewa QR Code</span>
                      </div>
                      
                      <div className="relative overflow-hidden rounded-2xl shadow-lg border-2 border-[#192026]/10 bg-[#192026] p-1 transition-all hover:scale-[1.02] duration-300">
                        {/* New high-precision merchant QR: prefer PNG if uploaded, SVG fallback */}
                        <picture>
                          <source srcSet="/esewa_qr.png" type="image/png" />
                          <img src="/esewa_qr.svg" alt="eSewa QR Code" className="w-44 h-44 mx-auto object-contain rounded-xl" />
                        </picture>
                      </div>

                      <div className="mt-2.5">
                        <p className="text-[10px] text-brand-dark/65">Admission pricing fee:</p>
                        {discountPercent > 0 ? (
                          <div className="space-y-0.5 animate-pulse">
                            <p className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded inline-block">
                              🎉 {discountPercent}% Community Off Active!
                            </p>
                            <p className="text-sm font-bold text-brand-dark">
                              <span className="line-through text-brand-dark/40 mr-1.5">Rs. {selectedCourse.price}</span>
                              <span className="text-emerald-700 font-extrabold text-base">Rs. {getDiscountedPrice(selectedCourse.price)}</span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-brand-dark">Rs. {selectedCourse.price} Net</p>
                        )}
                      </div>
                    </div>

                    {/* Step Instructions text */}
                    <div className="sm:col-span-7 space-y-2 text-left text-xs text-brand-dark/90">
                      <p className="font-display font-bold text-[11px] tracking-widest text-brand-primary uppercase">Instructions:</p>
                      
                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 rounded-full bg-brand-primary/20 text-brand-dark text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</div>
                        <p className="text-[11px] leading-tight">Scan the Green eSewa code above on your mobile eSewa app or bank app scanner.</p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 rounded-full bg-brand-primary/20 text-brand-dark text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</div>
                        <p className="text-[11px] leading-tight">
                          Complete transfer equivalent to{" "}
                          <span className="font-bold text-brand-primary">
                            Rs. {getDiscountedPrice(selectedCourse.price)}
                          </span>{" "}
                          precisely.
                        </p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 rounded-full bg-brand-primary/20 text-brand-dark text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</div>
                        <p className="text-[11px] leading-tight">Retrieve the 10+ character <span className="font-bold">Transaction/Ref ID</span> from the receipt slip.</p>
                      </div>

                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 rounded-full bg-brand-primary/20 text-brand-dark text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</div>
                        <p className="text-[11px] leading-tight">Fill out ID below, upload/drop screen snap proof, and submit.</p>
                      </div>
                    </div>

                  </div>

                  {/* Transaction fields */}
                  <div className="space-y-4 text-left">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">eSewa Transaction ID: *</label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          placeholder="e.g. 562D7V8A9"
                          className="w-full px-3.5 py-2.5 bg-brand-cream/20 border border-brand-primary/25 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary text-brand-dark font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">Remarks / Custom Note:</label>
                        <input
                          type="text"
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="e.g. Saturday admission"
                          className="w-full px-3.5 py-2.5 bg-brand-cream/20 border border-brand-primary/25 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary text-brand-dark"
                        />
                      </div>
                    </div>

                    {/* Screenshot file upload zone - Drag & Drop / Click trigger matching instructions */}
                    <div>
                      <label className="block text-xs font-bold text-brand-dark mb-1.5 uppercase tracking-wide">
                        Receipt Screenshot Proof: *
                      </label>
                      
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                          isDragging 
                            ? 'border-brand-primary bg-brand-cream/50' 
                            : screenshotBase64 
                              ? 'border-emerald-500/50 bg-emerald-50/10' 
                              : 'border-brand-primary/20 hover:border-brand-primary/40 hover:bg-brand-cream/20'
                        }`}
                      >
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />

                        {screenshotBase64 ? (
                          <div className="space-y-1.5">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 mx-auto">
                              <CheckCircle size={20} />
                            </div>
                            <p className="text-xs font-bold text-emerald-800">Screenshot Uploaded Successfully</p>
                            <p className="text-[10px] text-brand-dark/70 font-mono line-clamp-1">{screenshotName}</p>
                            <p className="text-[10px] text-brand-primary underline">Click or drag another to replace</p>
                          </div>
                        ) : (
                          <div className="space-y-1 text-xs">
                            <Upload className="mx-auto text-brand-primary/70 mb-1" size={24} />
                            <p className="font-semibold text-brand-dark">Drag and Drop your transaction screenshot here</p>
                            <p className="text-[10px] text-brand-dark/60">or click to browse local files (PNG, JPG, JPEG)</p>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3 bg-brand-primary text-brand-white rounded-xl text-xs font-bold hover:bg-brand-primary/95 transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="w-4 h-4 border-2 border-brand-cream border-t-white rounded-full animate-spin mr-1.5" />
                          <span>Submitting Seat Request...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify and Finalize Seat Enrollment</span>
                          <ArrowRight size={13} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
