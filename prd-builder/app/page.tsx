'use client';

import React, { useState, useCallback } from 'react';
import { Plus, Download, Share2, Upload, Clock, Users, Search, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Feature {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'complete';
}

interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description: string;
}

export default function PRDBuilder() {
  const [prdData, setPRDData] = useState({
    title: 'New Product',
    overview: '',
    targetUsers: '',
    successMetrics: '',
    features: [] as Feature[],
    userStories: [] as string[],
    criteria: [] as { id: string; text: string; completed: boolean }[],
    design: '',
    technical: '',
    timeline: [] as Phase[]
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [collaborators, setCollaborators] = useState(['you@example.com']);
  const [newCollaborator, setNewCollaborator] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📋' },
    { id: 'features', label: 'Features', icon: '⭐' },
    { id: 'stories', label: 'User Stories', icon: '👥' },
    { id: 'criteria', label: 'Acceptance', icon: '✅' },
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'timeline', label: 'Timeline', icon: '📅' }
  ];

  const addFeature = () => {
    const newFeature: Feature = {
      id: Date.now().toString(),
      title: 'New Feature',
      description: '',
      priority: 'medium',
      status: 'planned'
    };
    setPRDData({ ...prdData, features: [...prdData.features, newFeature] });
  };

  const updateFeature = (id: string, updates: Partial<Feature>) => {
    setPRDData({
      ...prdData,
      features: prdData.features.map(f => f.id === id ? { ...f, ...updates } : f)
    });
  };

  const deleteFeature = (id: string) => {
    setPRDData({
      ...prdData,
      features: prdData.features.filter(f => f.id !== id)
    });
  };

  const addCollaborator = () => {
    if (newCollaborator && !collaborators.includes(newCollaborator)) {
      setCollaborators([...collaborators, newCollaborator]);
      setNewCollaborator('');
    }
  };

  const exportPDF = () => {
    alert('PDF export would generate a professional document from this PRD');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Product Title</label>
              <input
                type="text"
                value={prdData.title}
                onChange={(e) => setPRDData({ ...prdData, title: e.target.value })}
                placeholder="e.g., AI-Powered Analytics Platform"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Executive Summary</label>
              <textarea
                value={prdData.overview}
                onChange={(e) => setPRDData({ ...prdData, overview: e.target.value })}
                placeholder="High-level description of the product..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Target Users</label>
                <input
                  type="text"
                  value={prdData.targetUsers}
                  onChange={(e) => setPRDData({ ...prdData, targetUsers: e.target.value })}
                  placeholder="e.g., Enterprise teams"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">Success Metrics</label>
                <input
                  type="text"
                  value={prdData.successMetrics}
                  onChange={(e) => setPRDData({ ...prdData, successMetrics: e.target.value })}
                  placeholder="e.g., 50% faster analysis"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition"
                />
              </div>
            </div>
          </motion.div>
        );

      case 'features':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button
              onClick={addFeature}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 transition"
            >
              <Plus size={18} /> Add Feature
            </button>
            <div className="space-y-3">
              <AnimatePresence>
                {prdData.features.map((feature) => (
                  <motion.div
                    key={feature.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => updateFeature(feature.id, { title: e.target.value })}
                          className="font-semibold text-white bg-transparent border-b border-transparent hover:border-cyan-400/50 focus:border-cyan-400/50 outline-none transition w-full"
                        />
                        <textarea
                          value={feature.description}
                          onChange={(e) => updateFeature(feature.id, { description: e.target.value })}
                          placeholder="Feature description..."
                          className="w-full mt-2 p-2 bg-white/5 rounded border border-white/10 text-slate-400 text-sm focus:outline-none focus:border-cyan-400/50 transition resize-none"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => deleteFeature(feature.id)}
                        className="ml-2 p-2 rounded hover:bg-red-500/20 text-red-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <select
                        value={feature.priority}
                        onChange={(e) => updateFeature(feature.id, { priority: e.target.value as any })}
                        className="px-2 py-1 rounded text-sm bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-cyan-400/50"
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </select>
                      <select
                        value={feature.status}
                        onChange={(e) => updateFeature(feature.id, { status: e.target.value as any })}
                        className="px-2 py-1 rounded text-sm bg-white/5 border border-white/10 text-slate-300 focus:outline-none focus:border-cyan-400/50"
                      >
                        <option value="planned">Planned</option>
                        <option value="in-progress">In Progress</option>
                        <option value="complete">Complete</option>
                      </select>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        );

      case 'stories':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <textarea
              placeholder='Add user story: "As a [role], I want [action], so that [benefit]"'
              className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
              rows={3}
            />
            <div className="space-y-3">
              {prdData.userStories.map((story, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <p className="text-white italic">"{story}"</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'criteria':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:opacity-90 transition">
              <Plus size={18} /> Add Criteria
            </button>
            <div className="space-y-2">
              {prdData.criteria.map((criterion) => (
                <motion.label
                  key={criterion.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 transition"
                >
                  <input type="checkbox" checked={criterion.completed} className="w-4 h-4" readOnly />
                  <span className={criterion.completed ? 'line-through text-slate-500' : 'text-white'}>
                    {criterion.text}
                  </span>
                </motion.label>
              ))}
            </div>
          </motion.div>
        );

      case 'design':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Design Overview</label>
              <textarea
                value={prdData.design}
                onChange={(e) => setPRDData({ ...prdData, design: e.target.value })}
                placeholder="UI/UX approach, design system, brand guidelines..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Attachments</label>
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-400/50 transition cursor-pointer">
                <Upload size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-slate-400">Upload wireframes, mockups, or design files</p>
              </div>
            </div>
          </motion.div>
        );

      case 'technical':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-3">Technical Stack</label>
              <textarea
                value={prdData.technical}
                onChange={(e) => setPRDData({ ...prdData, technical: e.target.value })}
                placeholder="Backend: Node.js + PostgreSQL&#10;Frontend: Next.js + React&#10;Infra: AWS..."
                rows={6}
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition resize-none"
              />
            </div>
          </motion.div>
        );

      case 'timeline':
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="space-y-3">
              {prdData.timeline.map((phase) => (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 rounded-lg bg-white/5 border border-white/10"
                >
                  <h3 className="font-semibold text-white">{phase.name}</h3>
                  <p className="text-sm text-slate-400">{phase.startDate} → {phase.endDate}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const completionPercentage = Math.round(
    (Object.values(prdData).filter(v => v).length / Object.keys(prdData).length) * 100
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-slate-900/70 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                PRD Builder
              </h1>
              <p className="text-sm text-slate-400 mt-1">Product Requirements Document</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition"
              >
                <Download size={18} /> Export PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition">
                <Share2 size={18} /> Share
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                {tab.icon} {tab.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-8 shadow-2xl"
            >
              {renderContent()}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Search */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <Search className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400/50 transition"
              />
            </motion.div>

            {/* Collaborators */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Users size={20} className="text-cyan-400" />
                <h3 className="font-semibold text-white">Collaborators</h3>
              </div>
              <div className="space-y-2">
                {collaborators.map((email, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-2 rounded bg-white/5"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                      {email[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-slate-300">{email}</span>
                  </motion.div>
                ))}
              </div>
              <div className="flex gap-2 mt-4">
                <input
                  type="email"
                  placeholder="Add collaborator"
                  value={newCollaborator}
                  onChange={(e) => setNewCollaborator(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400/50 transition"
                />
                <button
                  onClick={addCollaborator}
                  className="px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 transition"
                >
                  <Plus size={18} />
                </button>
              </div>
            </motion.div>

            {/* Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="backdrop-blur-xl bg-white/5 rounded-2xl border border-white/10 p-6"
            >
              <h3 className="font-semibold text-white mb-4">Completion</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-300">Overall Progress</span>
                    <span className="text-cyan-400 font-semibold">{completionPercentage}%</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${completionPercentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
