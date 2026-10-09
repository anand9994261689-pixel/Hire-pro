import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Users, CheckCircle, AlertTriangle, FileWarning, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { results } = useContext(AppContext);
  
  const stats = [
    { label: 'Total Analyzed', value: results ? results.candidates.length : 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Eligible', value: results ? results.candidates.filter(c => c.status === 'Eligible').length : 0, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Moderate', value: results ? results.candidates.filter(c => c.status === 'Moderate').length : 0, icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { label: 'Low Match', value: results ? results.candidates.filter(c => c.status === 'Low').length : 0, icon: FileWarning, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-gray-400">Welcome back. Here is the summary of your latest resume screening session.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel p-6 rounded-2xl flex items-center justify-between hover:-translate-y-1 transition-transform duration-300">
            <div>
              <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold">{stat.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-8 border border-gray-800 flex flex-col items-center justify-center min-h-[300px]">
        {!results ? (
          <div className="text-center">
            <TrendingUp size={48} className="text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No active screening data</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">Upload resumes and a job description to generate AI-powered insights and candidate rankings.</p>
            <a href="/upload" className="px-6 py-3 bg-brand hover:bg-brand-dark text-white rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              Start Analysis
            </a>
          </div>
        ) : (
          <div className="w-full">
            <h2 className="text-xl font-semibold mb-4 border-b border-gray-800 pb-4">Top Candidate</h2>
            {results.candidates.length > 0 ? (
              <div className="flex items-center gap-6 p-6 bg-surface/50 rounded-xl border border-gray-700/50">
                <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-brand-light font-bold text-2xl">
                  {results.candidates[0].name.substring(0,2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{results.candidates[0].name}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm font-medium">
                      Score: {Math.round(results.candidates[0].score * 100)}%
                    </span>
                    <span className="text-gray-400 text-sm">{results.candidates[0].status} Match</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Dashboard;
