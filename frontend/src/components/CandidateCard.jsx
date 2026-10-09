import React from 'react';
import { GraduationCap, Briefcase, FileCode2, ChevronRight } from 'lucide-react';
import ScorePanel from './ScorePanel';

const CandidateCard = ({ candidate, isTopMatch }) => {
  return (
    <div className={`bg-gray-800 rounded-2xl border ${isTopMatch ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'border-gray-700 shadow-xl'} overflow-hidden hover:shadow-2xl hover:border-gray-600 transition-all duration-300 group`}>
      <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Candidate Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{candidate.name}</h2>
                {isTopMatch && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 text-yellow-400 text-xs font-bold rounded-full shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                    🏆 Top Match
                  </span>
                )}
              </div>
              <p className="text-cyan-400 font-medium">{candidate.role}</p>
            </div>
            <div className="p-3 bg-gray-700/50 rounded-xl group-hover:bg-blue-500/20 group-hover:scale-110 transition-all duration-300">
              <FileCode2 className="w-6 h-6 text-blue-400" />
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-4 mb-6 border border-gray-700/50">
            <p className="text-gray-300 italic">"{candidate.summary || 'No summary available.'}"</p>
          </div>

          {((candidate.education && candidate.education.length > 0) || (candidate.experience && candidate.experience.length > 0)) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {candidate.education && candidate.education.length > 0 && (
                <div className="flex items-start gap-3 text-gray-300">
                  <div className="bg-gray-700 p-2 rounded-lg mt-0.5">
                    <GraduationCap className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Education</p>
                    {candidate.education.map((edu, i) => (
                      <p key={i} className="text-sm font-medium">
                        <span className="text-purple-300 font-semibold">{edu.level}:</span> {edu.details}
                      </p>
                    ))}
                  </div>
                </div>
              )}
              {candidate.experience && candidate.experience.length > 0 && (
                <div className="flex items-start gap-3 text-gray-300">
                  <div className="bg-gray-700 p-2 rounded-lg mt-0.5">
                    <Briefcase className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Experience</p>
                    {candidate.experience.map((exp, i) => (
                      <p key={i} className="text-sm font-medium">
                        <span>{exp.role}</span>
                        {exp.company && <span className="text-gray-400"> at {exp.company}</span>}
                        {exp.duration && <span className="text-orange-300 text-xs block mt-0.5">{exp.duration}</span>}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-2">
            <p className="text-sm text-gray-400 mb-2 font-medium">Skills</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill, i) => (
                <span key={i} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-full border border-gray-600 cursor-default transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Score Panel */}
        <div className="lg:w-[350px] min-w-[300px]">
          <ScorePanel candidate={candidate} />
        </div>
      </div>

      {/* Extra Details Section */}
      <div className="bg-gray-900/60 px-6 md:px-8 py-6 border-t border-gray-700 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Matched Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.matched_skills?.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs rounded-md border border-green-500/20 transition-colors">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            Missing Skills
          </h4>
          <div className="flex flex-wrap gap-2">
            {candidate.missing_skills?.map((skill, i) => (
              <span key={i} className="px-2.5 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs rounded-md border border-red-500/20 transition-colors">
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-green-400">Strengths</h4>
          {candidate.strengths && candidate.strengths.length > 0 ? (
            <ul className="space-y-1.5">
              {candidate.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-green-400 mt-0.5 font-bold">✓</span> {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No strengths identified.</p>
          )}
        </div>
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 text-red-400">Weaknesses</h4>
          {candidate.weaknesses && candidate.weaknesses.length > 0 ? (
            <ul className="space-y-1.5">
              {candidate.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-red-400 mt-0.5 font-bold">✗</span> {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-500 italic">No weaknesses identified.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CandidateCard;
