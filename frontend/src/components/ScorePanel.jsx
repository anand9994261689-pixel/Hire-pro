import React from 'react';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const ScorePanel = ({ candidate }) => {
  const getStatusInfo = (status) => {
    switch (status) {
      case 'Eligible': return { color: 'text-green-400', bg: 'bg-green-400/10', bar: 'bg-green-500', icon: CheckCircle };
      case 'Moderate': return { color: 'text-yellow-400', bg: 'bg-yellow-400/10', bar: 'bg-yellow-500', icon: AlertTriangle };
      case 'Low': return { color: 'text-red-400', bg: 'bg-red-400/10', bar: 'bg-red-500', icon: XCircle };
      default: return { color: 'text-gray-400', bg: 'bg-gray-400/10', bar: 'bg-gray-500', icon: AlertTriangle };
    }
  };

  const statusInfo = getStatusInfo(candidate.status);
  const StatusIcon = statusInfo.icon;
  const overallScore = Math.round(candidate.score * 100);

  const BreakdownItem = ({ label, score, colorClass }) => (
    <div className="mb-3 group cursor-pointer">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300 group-hover:text-white transition-colors">{label}</span>
        <span className="text-white font-medium">{Math.round(score * 100)}%</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-2 rounded-full ${colorClass} transition-all duration-1000 ease-out group-hover:brightness-110`} 
          style={{ width: `${Math.round(score * 100)}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 flex flex-col h-full shadow-inner relative group/panel">
      {/* Tooltip on hover */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover/panel:opacity-100 transition-opacity border border-gray-700 whitespace-nowrap shadow-xl pointer-events-none z-10">
        Calculated from semantic, skill, and experience scores
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm mb-1">Overall Match</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-4xl font-bold ${statusInfo.color}`}>{overallScore}</span>
            <span className="text-xl text-gray-500">%</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${statusInfo.bg} border border-opacity-20 border-current`}>
          <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
          <span className={`text-sm font-semibold ${statusInfo.color}`}>{candidate.status}</span>
        </div>
      </div>

      <div className="flex-grow space-y-4">
        <BreakdownItem label="Semantic Match" score={candidate.semantic_score} colorClass="bg-blue-500" />
        <BreakdownItem label="Skill Match" score={candidate.skill_score} colorClass="bg-purple-500" />
        <BreakdownItem label="Experience Match" score={candidate.experience_score} colorClass="bg-cyan-500" />
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-700/50">
         <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
          <div 
            className={`h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-1000 ease-out relative`} 
            style={{ width: `${overallScore}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-r from-transparent to-white opacity-20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScorePanel;
