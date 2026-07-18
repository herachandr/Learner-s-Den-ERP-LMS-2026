import React, { useState, useEffect } from 'react';
import { Timer, AlertCircle, CheckCircle2, XCircle, BrainCircuit, Sparkles, ChevronRight, ChevronLeft, Send, Home } from 'lucide-react';
import { Quiz, Question, Grade } from '../types';

interface QuizRunnerProps {
  quiz: Quiz;
  studentId: string;
  isTeacherPreview?: boolean;
  onClose: () => void;
  onSubmitGrade: (gradeData: Omit<Grade, 'id' | 'completedAt'>) => Promise<void>;
}

export default function QuizRunner({
  quiz,
  studentId,
  isTeacherPreview = false,
  onClose,
  onSubmitGrade,
}: QuizRunnerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(quiz.durationMinutes * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [gradeResult, setGradeResult] = useState<{ score: number; total: number } | null>(null);

  // Timer Effect
  useEffect(() => {
    if (isSubmitted || isTeacherPreview) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, isTeacherPreview]);

  const currentQuestion = quiz.questions[currentIdx];

  const handleSelectOption = (qId: string, optionIdx: number) => {
    if (isSubmitted || isTeacherPreview) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx,
    }));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;

    // Calculate score
    let score = 0;
    quiz.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        score += 1;
      }
    });

    const total = quiz.questions.length;
    setGradeResult({ score, total });
    setIsSubmitted(true);

    if (!isTeacherPreview) {
      await onSubmitGrade({
        quizId: quiz.id,
        studentId,
        score,
        totalQuestions: total,
        answers: selectedAnswers,
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Panel with Timer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xxs">
        <div>
          <span className="text-xxs font-bold uppercase tracking-wider text-violet-600 px-2.5 py-1 rounded-md bg-violet-50">
            {quiz.subject} Exam
          </span>
          <h3 className="font-bold text-base text-slate-800 mt-2 tracking-tight">{quiz.title}</h3>
          {isTeacherPreview && (
            <p className="text-xxs text-slate-400 font-semibold mt-1">INSTRUCTOR PREVIEW MODE (Grading is simulated)</p>
          )}
        </div>

        {!isTeacherPreview && !isSubmitted && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold ${
            timeLeft < 60 ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <Timer className="h-4 w-4" />
            <span>Time Left: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {!isSubmitted ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Question Navigator */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 h-fit space-y-3">
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Question Navigator</p>
            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((_, i) => {
                const isSelected = selectedAnswers[quiz.questions[i].id] !== undefined;
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIdx(i)}
                    className={`h-8 w-8 rounded-lg text-xs font-bold transition-all border ${
                      currentIdx === i
                        ? 'bg-violet-600 border-violet-600 text-white shadow-xs'
                        : isSelected
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-1.5 text-xxs font-semibold text-slate-500">
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-200" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>

          {/* Active Question Panel */}
          <div className="md:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-5">
                <span className="text-xxs text-slate-400 font-bold uppercase tracking-wider">
                  Question {currentIdx + 1} of {quiz.questions.length}
                </span>
                <span className="text-xxs font-bold bg-violet-50 text-violet-700 px-2.5 py-0.5 rounded-md">
                  Single Choice
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800 leading-snug mb-6">
                {currentQuestion.questionText}
              </h4>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => {
                  const isChecked = selectedAnswers[currentQuestion.id] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQuestion.id, idx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-violet-50/70 border-violet-500 text-violet-800 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span>{option}</span>
                      <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                        isChecked ? 'border-violet-600 bg-violet-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <div className="h-2 w-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-100">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((p) => p - 1)}
                className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 disabled:opacity-40 disabled:pointer-events-none transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>

              {currentIdx === quiz.questions.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-xs font-bold hover:opacity-95 transition-all shadow-md shadow-emerald-100"
                >
                  <span>Submit Exam</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIdx((p) => p + 1)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-600 transition-all"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Detailed Post-Test Report Review */
        <div className="space-y-6">
          {/* Result Banner Card */}
          <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row justify-between items-center gap-6 shadow-lg shadow-indigo-100">
            <div className="text-center sm:text-left">
              <h3 className="text-xl sm:text-2xl font-black tracking-tight">Test Completed successfully!</h3>
              <p className="text-xs text-indigo-100 mt-1 font-medium">Your submission has been graded and archived in student records.</p>
              
              <div className="flex gap-4 mt-6 justify-center sm:justify-start">
                <button
                  onClick={onClose}
                  className="flex items-center gap-1 bg-white text-indigo-700 font-bold px-4 py-2 rounded-xl text-xs hover:bg-slate-50 transition-all"
                >
                  <Home className="h-4 w-4" /> Return to LMS
                </button>
              </div>
            </div>

            <div className="bg-white/10 p-5 rounded-2xl border border-white/15 text-center shrink-0 min-w-[150px]">
              <p className="text-xxs font-bold uppercase tracking-wider text-indigo-200">Your Grade</p>
              <h2 className="text-4xl font-extrabold tracking-tight mt-1">
                {gradeResult?.score} <span className="text-lg opacity-70">/ {gradeResult?.total}</span>
              </h2>
              <p className="text-xxs font-semibold text-indigo-200 mt-2">
                Accuracy: {Math.round(((gradeResult?.score || 0) / (gradeResult?.total || 1)) * 100)}%
              </p>
            </div>
          </div>

          {/* Detailed Question Review List */}
          <div className="space-y-4">
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider">Detailed Solution Guide</p>
            {quiz.questions.map((q, qIdx) => {
              const selectedIdx = selectedAnswers[q.id];
              const isCorrect = selectedIdx === q.correctOptionIndex;

              return (
                <div key={q.id} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm">
                      Question {qIdx + 1}: {q.questionText}
                    </h4>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xxs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Correct
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xxs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full shrink-0">
                        <XCircle className="h-3.5 w-3.5 text-rose-500" /> Incorrect
                      </span>
                    )}
                  </div>

                  {/* Option values */}
                  <div className="space-y-2 pl-2">
                    {q.options.map((option, oIdx) => {
                      const wasSelected = selectedIdx === oIdx;
                      const isCorrectOption = q.correctOptionIndex === oIdx;

                      let btnStyle = 'border-slate-100 text-slate-600 bg-slate-50/30';
                      if (wasSelected && isCorrect) {
                        btnStyle = 'border-emerald-300 bg-emerald-50 text-emerald-800 font-semibold';
                      } else if (wasSelected && !isCorrect) {
                        btnStyle = 'border-rose-300 bg-rose-50 text-rose-800 font-semibold';
                      } else if (isCorrectOption) {
                        btnStyle = 'border-emerald-300 bg-emerald-50/50 text-emerald-800 font-semibold';
                      }

                      return (
                        <div key={oIdx} className={`p-2.5 rounded-xl border text-xxs flex items-center justify-between ${btnStyle}`}>
                          <span>{option}</span>
                          {isCorrectOption ? (
                            <span className="text-xxs font-bold text-emerald-600">Correct Answer</span>
                          ) : wasSelected ? (
                            <span className="text-xxs font-bold text-rose-600">Your Choice</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>

                  {/* Logical Explanation */}
                  {q.explanation && (
                    <div className="p-3 bg-violet-50/50 border border-violet-100 rounded-xl flex gap-2.5 items-start">
                      <BrainCircuit className="h-4.5 w-4.5 text-violet-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xxs font-bold text-violet-800 uppercase tracking-wide">Conceptual Analysis</p>
                        <p className="text-xxs text-slate-600 mt-1 leading-relaxed">{q.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
