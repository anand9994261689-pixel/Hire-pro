import React from 'react';
import { FileText, BarChart2, Trophy, CheckCircle } from 'lucide-react';

const SummaryCards = ({ candidates }) => {
  const totalResumes = candidates.length;
  const avgScore = candidates.length > 0 
    ? Math.round(candidates.reduce((acc, c) => acc + c.score, 0) / candidates.length * 100) 
    : 0;
  const highestScore = candidates.length > 0 
    ? Math.round(Math.max(...candidates.map(c => c.score)) * 100) 
    : 0;
  const strongMatches = candidates.filter(c => c.score >= 0.75).length;

  const cards = [
    { title: 'Total Resumes', value: totalResumes, icon: FileText, color: 'from-blue-500 to-cyan-400' },
    { title: 'Average Score', value: `${avgScore}%`, icon: BarChart2, color: 'from-purple-500 to-indigo-500' },
    { title: 'Highest Score', value: `${highestScore}%`, icon: Trophy, color: 'from-orange-400 to-pink-500' },
    { title: 'Strong Matches', value: strongMatches, icon: CheckCircle, color: 'from-green-400 to-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index} 
            className="relative overflow-hidden bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 group"
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity duration-300 transform translate-x-1/2 -translate-y-1/2`}></div>
            <div className="flex items-center justify-between relative z-10">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{card.title}</p>
                <h3 className="text-3xl font-bold text-white">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} bg-opacity-20`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
