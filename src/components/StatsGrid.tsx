import React from 'react';
import { Users, BookOpen, GraduationCap, Calendar, Wallet, AlertTriangle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { DashboardStats } from '../types';

interface StatsGridProps {
  stats: DashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  // Collection rate calculations
  const totalRevenue = stats?.totalRevenue || 0;
  const pendingFees = stats?.pendingFees || 0;
  const totalStudents = stats?.totalStudents || 0;
  const totalTeachers = stats?.totalTeachers || 0;
  const totalCourses = stats?.totalCourses || 0;
  const totalBatches = stats?.totalBatches || 0;

  const totalDuesAssessed = totalRevenue + pendingFees;
  const collectionRate = totalDuesAssessed > 0 ? Math.round((totalRevenue / totalDuesAssessed) * 100) : 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      
      {/* 1. Total Enrollments (Col-span-2) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 md:col-span-2 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-300">
          <GraduationCap className="h-28 w-28 text-indigo-600" />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Enrollments</span>
            </div>
            <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center gap-1">
              Active Rosters <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
          
          <div className="mt-4 flex items-baseline gap-2">
            <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight">{totalStudents}</h3>
            <span className="text-xs font-bold text-slate-400">Enrolled Learners</span>
          </div>
        </div>

        {/* Dynamic breakdown graphics for the bento aesthetic */}
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">Course Distribution Estimation</p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>JEE Prep</span>
                <span>45%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>NEET Biology</span>
                <span>35%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                <span>AI Coding</span>
                <span>20%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Instructors (Col-span-1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Instructors</span>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="All verified faculty active"></span>
          </div>

          <div className="mt-4">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalTeachers}</h3>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider mt-1">Specialist Faculty</p>
          </div>
        </div>

        <div className="mt-6 pt-3 border-t border-slate-50 flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden">
            <div className="inline-block h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-600">NK</div>
            <div className="inline-block h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-600">RP</div>
            <div className="inline-block h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-600">SD</div>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
            Verified Shifts
          </span>
        </div>
      </div>

      {/* 3. Course Offerings (Col-span-1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Curriculums</span>
          </div>

          <div className="mt-4">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalCourses}</h3>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider mt-1">Academic Programs</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
            <span>JEE Advanced Foundations</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-500"></span>
            <span>NEET Biology & Chemistry</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <span>AI & Full Stack Development</span>
          </div>
        </div>
      </div>

      {/* 4. Scheduled Batches (Col-span-1) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Calendar className="h-5 w-5" />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Batches</span>
          </div>

          <div className="mt-4">
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{totalBatches}</h3>
            <p className="text-xxs font-bold text-slate-400 uppercase tracking-wider mt-1">Running Sessions</p>
          </div>
        </div>

        <div className="mt-4 text-[10px] font-bold text-slate-500 flex justify-between items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
          <span>Weekly Lectures</span>
          <span className="text-purple-700 font-extrabold">24 Scheduled</span>
        </div>
      </div>

      {/* 5. Pending Dues Balance (Col-span-1) */}
      <div className="bg-rose-50/25 border border-rose-100 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider">Outstanding Dues</span>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-3xl font-black text-rose-700 tracking-tight">₹{pendingFees.toLocaleString()}</h3>
            <p className="text-xxs font-extrabold text-rose-500 uppercase tracking-wider mt-1">Pending Collections</p>
          </div>
        </div>

        <div className="mt-4 text-[10px] font-bold text-rose-600/85 flex items-center gap-1 bg-rose-50 border border-rose-150 px-3 py-1.5 rounded-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
          <span>Automatic Reminders Equipped</span>
        </div>
      </div>

      {/* 6. Total Revenue Collected (Col-span-3 - Full-width high-impact footer block) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition-all duration-300 md:col-span-3 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:scale-110 transition-transform duration-300">
          <Wallet className="h-32 w-32 text-emerald-600" />
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tuition Fees Revenue Register</span>
            </div>
            
            <div className="mt-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Gross Collections</span>
              <h3 className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight flex items-baseline gap-2">
                ₹{totalRevenue.toLocaleString()}
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  +{collectionRate}% Collection Rate
                </span>
              </h3>
            </div>
          </div>

          <div className="sm:text-right shrink-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessed Receivable</p>
            <p className="text-sm font-bold text-slate-600">Total Bookings: <b className="text-slate-800">₹{totalDuesAssessed.toLocaleString()}</b></p>
          </div>
        </div>

        {/* Detailed Horizontal Collection Pipeline */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <div className="flex justify-between text-xxs font-black text-slate-400 uppercase tracking-widest mb-2">
            <span>Collected Revenue Pipeline</span>
            <span>Outstanding Tuition</span>
          </div>
          <div className="h-3 w-full bg-rose-200/60 rounded-full overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-l-full transition-all duration-500" 
              style={{ width: `${collectionRate}%` }}
              title={`Collected: ${collectionRate}%`}
            ></div>
            <div 
              className="h-full bg-rose-500 transition-all duration-500" 
              style={{ width: `${100 - collectionRate}%` }}
              title={`Pending: ${100 - collectionRate}%`}
            ></div>
          </div>
          <div className="mt-2.5 flex items-center gap-3.5 text-[9px] font-bold text-slate-400">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              <span>₹{totalRevenue.toLocaleString()} Received</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
              <span>₹{pendingFees.toLocaleString()} Outstanding</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
