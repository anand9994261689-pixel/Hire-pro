import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../App';
import SummaryCards from '../components/SummaryCards';
import AnalyticsPanel from '../components/AnalyticsPanel';
import CandidateCard from '../components/CandidateCard';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const Results = () => {
  const { results } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  // Redirect to upload if no real results available
  useEffect(() => {
    if (!results || !results.candidates || results.candidates.length === 0) {
      navigate('/upload');
      return;
    }
    const timer = setTimeout(() => {
      const normalizedData = {
        candidates: results.candidates.map(c => ({
          ...c,
          role: c.role || "",
          matched_skills: c.matched_skills || [],
          missing_skills: c.missing_skills || [],
          strengths: c.strengths || [],
          weaknesses: c.weaknesses || [],
          semantic_score: c.semantic_score || 0,
          skill_score: c.skill_score || 0,
          experience_score: c.experience_score || (c.final_score ? c.final_score * 0.9 : 0),
          education: c.education || null,
          experience: c.experience || null,
          skills: c.skills || [],
          score: c.final_score || c.score || 0,
          status: c.classification || c.status || ""
        }))
      };
      setData(normalizedData);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [results, navigate]);

  const handleExport = () => {
    if (!data || !data.candidates || data.candidates.length === 0) return;

    const headers = ['Name', 'Role', 'Status', 'Score', 'Experience', 'Education'];
    const csvContent = [
      headers.join(','),
      ...data.candidates.map(c => 
        [
          `"${c.name || ''}"`, 
          `"${c.role || ''}"`, 
          `"${c.status || ''}"`, 
          `"${c.score ? (c.score * 100).toFixed(1) + '%' : '0%'}"`, 
          `"${c.experience || ''}"`, 
          `"${c.education || ''}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'screening_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin relative z-10" />
        </div>
        <p className="mt-6 text-cyan-400 font-medium animate-pulse tracking-wide text-lg">Analyzing Candidates...</p>
      </div>
    );
  }

  return (
    <div className="text-white font-sans selection:bg-blue-500/30">
      
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <button onClick={() => navigate('/upload')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group w-fit">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Upload</span>
        </button>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-cyan-300 mb-3 drop-shadow-sm">
              Screening Results
            </h1>
            <p className="text-gray-400 max-w-2xl text-lg">
              AI-driven insights and candidate rankings for <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">Selected Role</span>.
            </p>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:-translate-y-1 self-start md:self-auto group">
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Export Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <SummaryCards candidates={data.candidates} />
        <AnalyticsPanel candidates={data.candidates} />
        
        <div className="space-y-6 mt-12">
          <div className="flex items-center justify-between border-b border-gray-800 pb-4">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              Candidate Breakdown
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full border border-blue-500/20">{data.candidates.length}</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8">
            {data.candidates.map((candidate, index) => (
              <CandidateCard key={index} candidate={candidate} isTopMatch={index === 0 && data.candidates.length > 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
