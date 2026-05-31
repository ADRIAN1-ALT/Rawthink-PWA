import { useState, useEffect } from 'react';
import { QuizQuestion, QuizHistory, User } from '../types';
import { Trophy, HelpCircle, Star, Sparkles, ArrowRight, Play, CheckCircle2, RotateCcw } from 'lucide-react';

interface QuizDashboardProps {
  currentUser: User | null;
  setView: (view: string) => void;
  showNotification: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function QuizDashboard({ currentUser, setView, showNotification }: QuizDashboardProps) {
  // Static questions synchronized with standard prompt engineering frameworks
  const questions: QuizQuestion[] = [
    {
      id: 'q-1',
      question: 'What does system role prompting refer to in ChatGPT?',
      options: [
        'Setting the conversational limit of ChatGPT',
        'Instructing the chatbot to adopt a specific persona, background, and set of guidelines',
        'Choosing the theme or background color of OpenAI interface',
        'Paying for ChatGPT Plus subscription'
      ],
      correctOptionIndex: 1,
      explanation: 'System role prompting anchors the model behaviour by guiding its specific identity, credentials, rules, tone, and processing goals before handling prompt inputs.'
    },
    {
      id: 'q-2',
      question: 'Which prompting pattern forces the LLM to explain thoughts sequentially before concluding?',
      options: [
        'Few-Shot Prompting',
        'Chain-of-Thought (CoT) Prompting',
        'Zero-Shot Prompting',
        'Direct Instruction Pattern'
      ],
      correctOptionIndex: 1,
      explanation: 'Chain-of-Thought (CoT) prompting explicitly triggers the model to output intermediate reasoning steps, which improves logic precision.'
    },
    {
      id: 'q-3',
      question: 'What is a hallucination in generative AI?',
      options: [
        'When the server fails to load because of traffic overload',
        'When the AI outputs plausible-sounding but factually incorrect or fabricated claims',
        'When the AI screen flickers red under dark mode settings',
        'A state-of-the-art model specialized in mental health diagnostics'
      ],
      correctOptionIndex: 1,
      explanation: 'Hallucination occurs when an LLM synthesizes statements that sound fluent, but are entirely invented or factually incorrect.'
    },
    {
      id: 'q-4',
      question: 'Which of the following is optimal for fine-tuning prompt adherence without writing custom APIs?',
      options: [
        'Providing clear examples (Few-Shot Prompting) and structured XML tag indicators',
        'Re-installing Node modules',
        'Typing prompts in ALL-CAPS screaming format',
        'Ignoring system instructions'
      ],
      correctOptionIndex: 0,
      explanation: 'Providing structure like XML tags (<examples>, <context>) and few-shot examples optimizes structured outputs dramatically.'
    }
  ];

  const [leaderboard, setLeaderboard] = useState<QuizHistory[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const fetchLeaderboard = async () => {
    setLoadingLeaderboard(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (res.ok) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('Leaderboard error', e);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const handleStartQuiz = () => {
    if (!currentUser) {
      showNotification('Please Sign In to play and capture ranks on the dynamic leaderboard.', 'info');
      setView('auth');
      return;
    }
    setIsPlaying(true);
    setCurrentQuestionIdx(0);
    setSelectedOptionIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
    setPointsEarned(0);
  };

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOptionIdx(idx);
  };

  const handleConfirmAnswer = () => {
    if (selectedOptionIdx === null || isAnswered) return;
    
    setIsAnswered(true);
    const correctIdx = questions[currentQuestionIdx].correctOptionIndex;
    if (selectedOptionIdx === correctIdx) {
      setScore(prev => prev + 1);
      showNotification('Splendid! That is the correct answer!', 'success');
    } else {
      showNotification('Incorrect selection, study the lesson explanation below.', 'error');
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswered(false);
    } else {
      finalizeQuiz();
    }
  };

  const finalizeQuiz = async () => {
    setQuizFinished(true);
    setIsPlaying(false);
    
    try {
      const resp = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id,
          score: score,
          totalQuestions: questions.length
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        setPointsEarned(data.pointsEarned);
        showNotification(`Quiz completed! You earned +${data.pointsEarned} Points!`, 'success');
        fetchLeaderboard();
      } else {
        throw new Error(data.error);
      }
    } catch (err: any) {
      // Offline fallback point calculations
      setPointsEarned(score * 25);
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8 bg-brand-cream/20">
      <div className="max-w-4xl mx-auto">
        
        {/* Caption */}
        <div id="quiz-section-header" className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold tracking-widest text-brand-primary uppercase">Knowledge Sandbox</span>
          <h2 className="font-display font-black text-3xl text-brand-dark tracking-tight mt-1 mb-2">
            RAWTHINK AI Assessments
          </h2>
          <p className="font-sans text-sm text-brand-dark/70">
            Practice conceptual assessments, gain experience coins, boost learning streak scores, and lock in career badges.
          </p>
        </div>

        {/* Dynamic Quiz Frame */}
        <div className="bg-brand-white rounded-3xl p-6 sm:p-8 border border-brand-primary/15 shadow-sm mb-12">
          
          {!isPlaying && !quizFinished && (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-brand-cream rounded-full mx-auto flex items-center justify-center text-brand-primary">
                <Play size={28} className="ml-1" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-brand-dark mb-1">Evaluate Your AI Concepts</h3>
                <p className="text-xs text-brand-dark/75 max-w-sm mx-auto">
                  A high-velocity module containing {questions.length} situational questions on prompt boundaries, system personas and autonomous systems.
                </p>
              </div>

              {currentUser && (
                <div className="text-xs text-brand-primary font-bold">
                  Active Student profile: {currentUser.name} <span>(Streak: {currentUser.streak || 1} 🔥)</span>
                </div>
              )}

              <button
                id="start-quiz-btn"
                onClick={handleStartQuiz}
                className="px-6 py-2.5 bg-brand-primary text-brand-white text-xs font-bold rounded-xl hover:bg-brand-primary/95 shadow transition cursor-pointer"
              >
                Launch Active Assessment
              </button>
            </div>
          )}

          {isPlaying && (
            <div className="space-y-6">
              {/* Progess indicator */}
              <div className="flex justify-between items-center text-xs font-semibold text-brand-dark/60 pb-3 border-b border-brand-primary/10">
                <span className="font-display uppercase tracking-widest">Question {currentQuestionIdx + 1} of {questions.length}</span>
                <span className="font-mono text-brand-primary">Current Score: {score}</span>
              </div>

              {/* Title Question */}
              <h3 className="font-display font-bold text-base sm:text-lg text-brand-dark leading-snug">
                {questions[currentQuestionIdx].question}
              </h3>

              {/* Options Listing */}
              <div className="space-y-3">
                {questions[currentQuestionIdx].options.map((opt, idx) => {
                  const isSelected = selectedOptionIdx === idx;
                  const isCorrectAnswerIdx = questions[currentQuestionIdx].correctOptionIndex === idx;
                  
                  let optionClass = 'border-brand-primary/15 hover:bg-brand-cream/20';
                  if (isSelected) optionClass = 'border-brand-primary bg-brand-primary/5';
                  
                  if (isAnswered) {
                    if (isCorrectAnswerIdx) {
                      optionClass = 'border-emerald-500 bg-emerald-50/40 text-emerald-950 font-semibold';
                    } else if (isSelected) {
                      optionClass = 'border-rose-500 bg-rose-50/40 text-rose-950';
                    } else {
                      optionClass = 'opacity-60 border-brand-primary/5';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex items-start space-x-3 cursor-pointer ${optionClass}`}
                    >
                      <span className="font-display font-extrabold text-brand-primary/80 uppercase shrink-0 mt-0.5">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Explanation lesson details rendered upon prompt validation */}
              {isAnswered && (
                <div className="bg-brand-cream/30 border border-brand-primary/15 rounded-xl p-4 text-xs space-y-1 text-left animate-fadeIn">
                  <p className="font-display font-black text-[10px] tracking-widest text-brand-primary uppercase">Lesson Tutorial Explanation:</p>
                  <p className="text-brand-dark/85 leading-relaxed">
                    {questions[currentQuestionIdx].explanation}
                  </p>
                </div>
              )}

              {/* Check / Next triggers */}
              <div className="flex justify-end pt-2">
                {!isAnswered ? (
                  <button
                    onClick={handleConfirmAnswer}
                    disabled={selectedOptionIdx === null}
                    className="px-6 py-2.5 bg-brand-dark text-brand-cream text-xs font-bold rounded-xl hover:bg-brand-dark/95 transition disabled:opacity-50 cursor-pointer"
                  >
                    Lock Answer Choice
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="px-6 py-2.5 bg-brand-primary text-brand-white text-xs font-bold rounded-xl hover:bg-brand-primary/95 flex items-center space-x-1 shadow cursor-pointer animate-pulse"
                  >
                    <span>{currentQuestionIdx === questions.length - 1 ? 'Finish Assessment' : 'Next Question'}</span>
                    <ArrowRight size={13} />
                  </button>
                )}
              </div>

            </div>
          )}

          {quizFinished && (
            <div className="text-center py-6 space-y-5 animate-scaleUp">
              <div className="w-16 h-16 bg-emerald-50 rounded-full mx-auto flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="font-display font-black text-xl text-brand-dark">Evaluation Completed!</h3>
                <p className="text-xs text-brand-dark/70 font-display mt-1">Excellent study effort!</p>
              </div>

              <div className="max-w-xs mx-auto bg-brand-cream/30 border border-brand-primary/10 rounded-2xl p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-brand-dark/50">Score</p>
                  <p className="font-display font-black text-lg text-brand-dark">{score} / {questions.length}</p>
                </div>
                <div>
                  <p className="text-[10px] text-brand-dark/50">Points Granted</p>
                  <p className="font-display font-black text-lg text-brand-primary">+{pointsEarned} Pts</p>
                </div>
              </div>

              {score === questions.length && (
                <div className="text-xs font-bold text-brand-primary py-1 px-3 bg-brand-primary/10 rounded-full inline-block">
                  🎖️ Unlocked Achievement Badge: "AI Mastermind"
                </div>
              )}

              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleStartQuiz}
                  className="px-5 py-2 border border-brand-primary/30 text-brand-dark text-xs font-bold rounded-xl hover:bg-brand-cream/30 flex items-center space-x-1 cursor-pointer"
                >
                  <RotateCcw size={12} />
                  <span>Try Again</span>
                </button>
                <button
                  onClick={() => setView('dashboard')}
                  className="px-5 py-2 bg-brand-dark text-brand-cream text-xs font-bold rounded-xl hover:bg-brand-dark/95 cursor-pointer"
                >
                  View My Credentials
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Global Leaderboard Panel */}
        <div className="bg-brand-white rounded-3xl p-6 border border-brand-primary/15 shadow-sm">
          <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-brand-primary/10">
            <Trophy className="text-[#C19A6B]" size={20} />
            <h3 className="font-display font-extrabold text-base text-brand-dark">RAWTHINK Top Learners Leaderboard</h3>
          </div>

          {loadingLeaderboard ? (
            <div className="py-6 text-center text-xs text-brand-dark/50">Recalculating rank indexing...</div>
          ) : leaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-brand-primary/5 text-brand-dark/60 font-semibold uppercase tracking-wider">
                    <th className="py-3 px-2">Rank</th>
                    <th className="py-3 px-2">Learner</th>
                    <th className="py-3 px-2 text-center">Score</th>
                    <th className="py-3 px-2 text-right">Points Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-primary/5">
                  {leaderboard.map((entry, index) => (
                    <tr 
                      key={entry.id}
                      className={`hover:bg-brand-cream/15 ${entry.userId === currentUser?.id ? 'bg-brand-primary/10 font-bold text-brand-dark' : 'text-brand-dark/85'}`}
                    >
                      <td className="py-3.5 px-2">
                        {index === 0 ? '🏆 1st' : index === 1 ? '🥈 2nd' : index === 2 ? '🥉 3rd' : `${index + 1}th`}
                      </td>
                      <td className="py-3.5 px-2 font-medium">
                        {entry.userName}
                      </td>
                      <td className="py-3.5 px-2 text-center font-mono">
                        {entry.score} / {entry.totalQuestions}
                      </td>
                      <td className="py-3.5 px-2 text-right font-bold text-brand-primary font-mono">
                        +{entry.pointsEarned} Pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-brand-dark/50">No score history records recorded yet. Start quiz above!</div>
          )}
        </div>

      </div>
    </div>
  );
}
