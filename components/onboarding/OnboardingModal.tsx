'use client';

import React, { useState } from 'react';
import { Sparkles, Code2, Rocket, Brain, ArrowRight, Zap, Target } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: {
    prompt: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    technologies: string[];
    preference: 'learn_first' | 'balanced' | 'speed';
  }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [prompt, setPrompt] = useState<string>('I want to build a simple expense tracker');
  const [experience, setExperience] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [technologies, setTechnologies] = useState<string[]>(['React 18', 'TypeScript', 'Tailwind CSS']);
  const [preference, setPreference] = useState<'learn_first' | 'balanced' | 'speed'>('learn_first');

  if (!isOpen) return null;

  const handleFinish = () => {
    onComplete({
      prompt,
      experience,
      technologies,
      preference,
    });
  };

  const sampleTemplates = [
    {
      title: 'Smart Expense Tracker',
      desc: 'Build a personal finance dashboard with transaction lists, summary totals, and forms.',
      prompt: 'I want to build a simple expense tracker',
      badge: 'Recommended for Section 45 Walkthrough',
    },
    {
      title: 'Focus Task Manager',
      desc: 'Create an interactive task manager with priority tags, status filters, and toggle checks.',
      prompt: 'Build me a task management website using React, TypeScript and Node.js',
      badge: 'Core Project',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Welcome to LearnCraft AI</h2>
              <p className="text-xs text-slate-400">AI builds with you, but not everything for you.</p>
            </div>
          </div>
          <div className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
            Step {step} of 4
          </div>
        </div>

        {/* Step Content */}
        <div className="p-6 flex-1 text-xs">
          {/* Step 1: What do you want to build? */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">What would you like to build?</h3>
                <p className="text-slate-400">Choose a featured learning project or enter your own custom application idea.</p>
              </div>

              <div className="space-y-2.5">
                {sampleTemplates.map(tmpl => (
                  <div
                    key={tmpl.title}
                    onClick={() => setPrompt(tmpl.prompt)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      prompt === tmpl.prompt
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{tmpl.title}</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                        {tmpl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{tmpl.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Or write custom prompt:</label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Build an expense tracker with category filtering..."
                  className="w-full bg-slate-950 text-slate-200 border border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: What is your programming experience? */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">What is your current programming experience?</h3>
                <p className="text-slate-400">The AI tutor will calibrate its explanations and checkpoints to match your skill level.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'beginner',
                    title: 'Beginner / Student',
                    desc: 'Learning programming fundamentals, syntax, functions, and first React concepts.',
                  },
                  {
                    id: 'intermediate',
                    title: 'Intermediate Developer',
                    desc: 'Comfortable with JavaScript; want to master TypeScript, state architecture, and immutability.',
                  },
                  {
                    id: 'advanced',
                    title: 'Experienced Transitioning',
                    desc: 'Deep coding background in another language; looking to build fullstack React apps fast while understanding patterns.',
                  },
                ].map(exp => (
                  <div
                    key={exp.id}
                    onClick={() => setExperience(exp.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      experience === exp.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">{exp.title}</div>
                    <div className="text-[11px] text-slate-400">{exp.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Which technologies do you want to use? */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Recommended Modern Web Stack</h3>
                <p className="text-slate-400">Selected based on industry best practices for interactive web applications.</p>
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { name: 'React 18', role: 'Frontend UI Library', desc: 'Declarative component architecture & reactive state' },
                  { name: 'TypeScript', role: 'Programming Language', desc: 'Strong typing, interfaces, and compile-time contract safety' },
                  { name: 'Tailwind CSS', role: 'Styling Framework', desc: 'Utility-first modern responsive UI design' },
                ].map(tech => (
                  <div key={tech.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs text-white">{tech.name}</div>
                      <div className="text-[10px] text-slate-400">{tech.desc}</div>
                    </div>
                    <span className="text-[10px] bg-slate-900 text-indigo-400 px-2 py-0.5 rounded font-mono border border-slate-800">
                      {tech.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Learning vs Speed Preference */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">How should the AI collaborate with you?</h3>
                <p className="text-slate-400">You can dynamically toggle this anytime during the build.</p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'learn_first',
                    title: 'Guided Builder (Recommended)',
                    icon: Brain,
                    desc: 'AI builds structure & boilerplate; pauses at all foundational concepts so you personally write the core logic.',
                  },
                  {
                    id: 'speed',
                    title: 'Collaborative Builder',
                    icon: Zap,
                    desc: 'AI generates larger blocks faster with periodic review checkpoints for high-level architecture.',
                  },
                ].map(pref => (
                  <div
                    key={pref.id}
                    onClick={() => setPreference(pref.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      preference === pref.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm shadow-indigo-500/20'
                        : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <pref.icon className={`w-5 h-5 mt-0.5 shrink-0 ${preference === pref.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="font-bold text-xs mb-1">{pref.title}</div>
                      <div className="text-[11px] text-slate-400">{pref.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
            >
              Back
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm shadow-indigo-600/30"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/30"
            >
              <Rocket className="w-4 h-4" />
              <span>Launch Co-Builder Workspace</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
