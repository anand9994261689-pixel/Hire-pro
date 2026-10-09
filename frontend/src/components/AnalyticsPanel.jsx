import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, PieChart as PieChartIcon } from 'lucide-react';

const AnalyticsPanel = ({ candidates }) => {
  // Process status distribution data
  const statusCounts = candidates.reduce((acc, c) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'Eligible', value: statusCounts['Eligible'] || 0, color: '#22c55e' }, // green-500
    { name: 'Moderate', value: statusCounts['Moderate'] || 0, color: '#eab308' }, // yellow-500
    { name: 'Low', value: statusCounts['Low'] || 0, color: '#ef4444' }, // red-500
  ].filter(d => d.value > 0);

  // Process skills frequency data
  const skillCounts = {};
  candidates.forEach(c => {
    c.skills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });
  });

  const barData = Object.entries(skillCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 skills

  // Top candidates
  const topCandidates = [...candidates].sort((a, b) => b.score - a.score).slice(0, 3);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-xl shadow-2xl backdrop-blur-md">
          <p className="text-white font-medium flex items-center gap-2">
            {payload[0].payload.color && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></span>
            )}
            {`${payload[0].name}: ${payload[0].value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      
      {/* Top Candidates Widget */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Top Candidates</h3>
        </div>
        <div className="space-y-4">
          {topCandidates.map((c, i) => (
            <div key={i} className={`flex items-center justify-between p-3 rounded-xl border transition-transform hover:-translate-y-1 ${i === 0 ? 'bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-gray-900/50 border-gray-700/50 hover:bg-gray-700/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-gray-700 text-gray-300'}`}>
                  #{i + 1}
                </div>
                <div>
                  <p className="text-white font-medium text-sm truncate max-w-[120px] sm:max-w-[150px]">{c.name.replace('.pdf', '')}</p>
                  <p className="text-xs text-gray-400">{c.role}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${c.status === 'Eligible' ? 'text-green-400' : c.status === 'Moderate' ? 'text-yellow-400' : 'text-red-400'}`}>
                  {Math.round(c.score * 100)}%
                </span>
              </div>
            </div>
          ))}
          {topCandidates.length === 0 && <p className="text-gray-500 text-center py-4">No candidates yet</p>}
        </div>
      </div>

      {/* Skills Overview */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Top Skills Found</h3>
        </div>
        <div className="h-52 w-full">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={24}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(260, 70%, ${65 - index * 5}%)`} className="hover:opacity-80 transition-opacity" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
          )}
        </div>
      </div>

      {/* Score Distribution Chart */}
      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg hover:border-gray-600 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
            <PieChartIcon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-white">Score Distribution</h3>
        </div>
        <div className="h-44 w-full relative">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">No data available</div>
          )}
          
          {/* Legend */}
          {pieData.length > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white leading-none">{candidates.length}</span>
              <span className="text-xs text-gray-400 mt-1">Total</span>
            </div>
          )}
        </div>
        {pieData.length > 0 && (
          <div className="flex justify-center gap-5 mt-4">
            {pieData.map(entry => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }}></div>
                <span className="text-xs text-gray-300 font-medium">{entry.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AnalyticsPanel;
