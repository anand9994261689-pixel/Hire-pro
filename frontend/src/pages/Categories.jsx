import React, { useState, useEffect } from 'react';
import { getCategories } from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Cpu } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState(null);
  const [activeTab, setActiveTab] = useState('Software Roles');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand"></div>
    </div>
  );

  if (!categories) return <div>Failed to load categories</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-bold mb-2">Role Categories</h1>
        <p className="text-gray-400">Explore available job roles and their mapped skills criteria.</p>
      </header>

      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('Software Roles')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'Software Roles' 
              ? 'bg-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
              : 'bg-surface text-gray-400 hover:bg-gray-800'
          }`}
        >
          <Code2 size={20} /> Software
        </button>
        <button
          onClick={() => setActiveTab('Hardware Roles')}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            activeTab === 'Hardware Roles' 
              ? 'bg-brand text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]' 
              : 'bg-surface text-gray-400 hover:bg-gray-800'
          }`}
        >
          <Cpu size={20} /> Hardware
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {Object.entries(categories[activeTab]).map(([role, skills]) => (
            <div key={role} className="glass-panel p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
              <h3 className="text-xl font-bold mb-4 text-white">{role}</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill} 
                    className="px-3 py-1 bg-surface border border-gray-700 rounded-full text-sm text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Categories;
