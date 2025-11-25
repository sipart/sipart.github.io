import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Upload, Zap, Flame, Calendar, TrendingUp, TrendingDown, DollarSign, Activity, Sun, Cloud } from 'lucide-react';

/**
 * Utility to parse CSV string into array of objects
 * Handling the specific format: Consumption (kwh), Estimated Cost Inc. Tax (p), Start, End
 */
const parseCSV = (csvText) => {
  const lines = csvText.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    // Handle potential commas inside quotes if complex, but simple split usually works for this data
    const values = lines[i].split(',');
    
    if (values.length >= 4) {
      const entry = {
        consumption: parseFloat(values[0]),
        costPence: parseFloat(values[1]),
        start: values[2].trim(),
        end: values[3].trim(),
        date: new Date(values[2].trim())
      };
      
      // Validation to ensure date is valid
      if (!isNaN(entry.date.getTime())) {
        data.push(entry);
      }
    }
  }
  return data;
};

// --- Mock Data Generator for Initial State ---
const generateMockData = (type, days = 60) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    // 48 half-hour intervals per day
    for (let j = 0; j < 48; j++) {
      const intervalDate = new Date(date);
      intervalDate.setMinutes(j * 30);
      
      let consumption = Math.random() * (type === 'gas' ? 2 : 0.5);
      // Make winter higher for gas
      if (type === 'gas' && (date.getMonth() < 3 || date.getMonth() > 9)) consumption *= 3;
      
      data.push({
        consumption: consumption,
        costPence: consumption * (type === 'gas' ? 7 : 25), // Rough pence per kwh
        start: intervalDate.toISOString(),
        date: intervalDate
      });
    }
  }
  return data;
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-3xl shadow-sm border-2 border-slate-100 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, subValue, icon: Icon, colorClass, trend }) => (
  <Card className="p-6 flex items-center space-x-4 transition-transform hover:scale-105 duration-300">
    <div className={`p-4 rounded-2xl ${colorClass} bg-opacity-20 flex-shrink-0`}>
      <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <h3 className="text-slate-500 font-medium text-sm uppercase tracking-wider">{title}</h3>
      <div className="text-2xl font-bold text-slate-800">{value}</div>
      <div className={`text-sm flex items-center font-medium ${trend === 'up' ? 'text-red-500' : 'text-emerald-500'}`}>
        {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
        {subValue}
      </div>
    </div>
  </Card>
);

export default function EnergyDashboard() {
  const [gasData, setGasData] = useState([]);
  const [elecData, setElecData] = useState([]);
  const [timeRange, setTimeRange] = useState('30'); // days
  const [isDemo, setIsDemo] = useState(true);

  // Load demo data on mount
  useEffect(() => {
    setGasData(generateMockData('gas'));
    setElecData(generateMockData('electricity'));
  }, []);

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const parsed = parseCSV(text);
      if (type === 'gas') setGasData(parsed);
      else setElecData(parsed);
      setIsDemo(false);
    };
    reader.readAsText(file);
  };

  // --- Aggregation Logic ---
  const aggregateData = (data, rangeDays) => {
    const dailyMap = new Map();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - rangeDays);

    data.forEach(d => {
      if (d.date < cutoff) return;
      const dayKey = d.date.toISOString().split('T')[0];
      if (!dailyMap.has(dayKey)) {
        dailyMap.set(dayKey, { date: dayKey, consumption: 0, cost: 0, costPence: 0 });
      }
      const entry = dailyMap.get(dayKey);
      entry.consumption += d.consumption;
      entry.costPence += d.costPence;
    });

    return Array.from(dailyMap.values())
      .map(d => ({
        ...d,
        cost: d.costPence / 100, // Convert to Pounds
        displayDate: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const gasDaily = useMemo(() => aggregateData(gasData, parseInt(timeRange)), [gasData, timeRange]);
  const elecDaily = useMemo(() => aggregateData(elecData, parseInt(timeRange)), [elecData, timeRange]);

  // Combined Data for Charts
  const combinedData = useMemo(() => {
    const map = new Map();
    gasDaily.forEach(g => map.set(g.date, { date: g.date, displayDate: g.displayDate, gasCost: g.cost, gasKwh: g.consumption }));
    elecDaily.forEach(e => {
      const existing = map.get(e.date) || { date: e.date, displayDate: e.displayDate };
      map.set(e.date, { ...existing, elecCost: e.cost, elecKwh: e.consumption });
    });
    return Array.from(map.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [gasDaily, elecDaily]);

  // Totals
  const totals = useMemo(() => {
    const sum = (arr, key) => arr.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    return {
      gasCost: sum(gasDaily, 'cost'),
      elecCost: sum(elecDaily, 'cost'),
      gasKwh: sum(gasDaily, 'consumption'),
      elecKwh: sum(elecDaily, 'consumption'),
    };
  }, [gasDaily, elecDaily]);

  // Comparison Logic (Simple: First Half vs Second Half of selected range for demo purposes)
  // In a real app, this would be "This Month vs Last Month" more strictly.
  const comparison = useMemo(() => {
    const midPoint = Math.floor(gasDaily.length / 2);
    const recentGas = gasDaily.slice(midPoint);
    const oldGas = gasDaily.slice(0, midPoint);
    
    const recentGasCost = recentGas.reduce((a, b) => a + b.cost, 0);
    const oldGasCost = oldGas.reduce((a, b) => a + b.cost, 0);
    
    return {
      gasDiff: oldGasCost ? ((recentGasCost - oldGasCost) / oldGasCost) * 100 : 0,
    };
  }, [gasDaily]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 p-4 sm:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <span className="p-2 bg-indigo-500 rounded-xl text-white"><Activity /></span>
            Energy Pulse
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Tracking your home's heartbeat.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {['7', '30', '90', '365'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                timeRange === range 
                ? 'bg-indigo-500 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {range} Days
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* File Upload / Demo Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-dashed border-amber-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:scale-[1.01]">
              <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, 'electricity')} />
              <div className="bg-amber-100 p-3 rounded-full mb-3 group-hover:bg-amber-200 transition-colors">
                 <Zap className="text-amber-500 w-6 h-6" />
              </div>
              <span className="font-bold text-amber-900">Upload Electricity CSV</span>
              <span className="text-xs text-amber-700 mt-1 opacity-70">"Electricity last 732 days.csv"</span>
            </label>

            <label className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-dashed border-cyan-300 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all hover:shadow-lg hover:scale-[1.01]">
              <input type="file" className="hidden" accept=".csv" onChange={(e) => handleFileUpload(e, 'gas')} />
              <div className="bg-cyan-100 p-3 rounded-full mb-3 group-hover:bg-cyan-200 transition-colors">
                 <Flame className="text-cyan-500 w-6 h-6" />
              </div>
              <span className="font-bold text-cyan-900">Upload Gas CSV</span>
              <span className="text-xs text-cyan-700 mt-1 opacity-70">"Gas last 732 days.csv"</span>
            </label>
        </div>

        {isDemo && (
          <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-3 rounded-xl flex items-center justify-center text-sm font-medium">
             <span className="mr-2">✨</span> Using sample data. Upload your files above to see your real stats!
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Electric Cost" 
            value={`£${totals.elecCost.toFixed(2)}`} 
            subValue="Last period"
            icon={Zap} 
            colorClass="bg-amber-400"
            trend="up"
          />
          <StatCard 
            title="Gas Cost" 
            value={`£${totals.gasCost.toFixed(2)}`} 
            subValue="Last period"
            icon={Flame} 
            colorClass="bg-cyan-400"
            trend={comparison.gasDiff > 0 ? 'up' : 'down'}
          />
          <StatCard 
            title="Electric Usage" 
            value={`${totals.elecKwh.toFixed(0)} kWh`} 
            subValue="Total volume"
            icon={Sun} 
            colorClass="bg-yellow-400"
            trend="down"
          />
          <StatCard 
            title="Gas Usage" 
            value={`${totals.gasKwh.toFixed(0)} kWh`} 
            subValue="Total volume"
            icon={Cloud} 
            colorClass="bg-sky-400"
            trend="up"
          />
        </div>

        {/* Main Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Cost Trend */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Daily Cost Trends</h2>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Elec</span>
                <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-cyan-400"></div> Gas</span>
              </div>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorElec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `£${val}`}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                    formatter={(value) => `£${parseFloat(value).toFixed(2)}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="elecCost" 
                    stroke="#fbbf24" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorElec)" 
                    name="Electricity"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="gasCost" 
                    stroke="#22d3ee" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorGas)" 
                    name="Gas"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Efficiency / Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Cost Breakdown</h2>
            <div className="h-64 flex flex-col justify-center items-center relative">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Total', Gas: totals.gasCost, Electricity: totals.elecCost }]} barSize={60}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} tickFormatter={(val) => `£${val}`}/>
                    <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px' }} />
                    <Bar dataKey="Electricity" stackId="a" fill="#fbbf24" radius={[0, 0, 10, 10]} />
                    <Bar dataKey="Gas" stackId="a" fill="#22d3ee" radius={[10, 10, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
               <div className="mt-4 text-center">
                 <p className="text-sm text-slate-400">Total Spend ({timeRange} days)</p>
                 <p className="text-3xl font-extrabold text-slate-800">£{(totals.gasCost + totals.elecCost).toFixed(2)}</p>
               </div>
            </div>
          </Card>
        </div>

        {/* Detailed Usage Bar Chart */}
        <Card className="p-6">
           <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Daily Consumption (kWh)</h2>
              <div className="text-sm text-slate-400">View usage spikes</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={combinedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="displayDate" 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                  />
                  <YAxis 
                    tick={{fill: '#94a3b8', fontSize: 12}} 
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f1f5f9', radius: 4}}
                    formatter={(value) => `${parseFloat(value).toFixed(2)} kWh`}
                  />
                  <Legend iconType="circle" />
                  <Bar dataKey="elecKwh" name="Electricity kWh" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="gasKwh" name="Gas kWh" fill="#22d3ee" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
        </Card>

      </div>
    </div>
  );
}
