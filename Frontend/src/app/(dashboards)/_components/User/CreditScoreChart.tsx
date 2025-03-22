'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const CreditScoreChart = ({ data }) => {
  // Define color mapping for each bureau with improved colors
  const bureauColors = {
    CIBIL: '#4F46E5', // Indigo
    Equifax: '#0EA5E9', // Sky blue
    Experian: '#10B981', // Emerald
    'CRIF HighMark': '#F59E0B', // Amber
  };

  // Get all bureaus from the data
  const bureaus = Object.keys(data[0] || {}).filter((key) => key !== 'date');

  // Find min and max values across all bureaus for better axis visualization
  let minScore = 300;
  let maxScore = 900;
  
  data.forEach(entry => {
    bureaus.forEach(bureau => {
      if (entry[bureau] && !isNaN(entry[bureau])) {
        minScore = Math.min(minScore, entry[bureau]);
        maxScore = Math.max(maxScore, entry[bureau]);
      }
    });
  });
  
  // Create a padding to ensure data points don't touch edges
  minScore = Math.max(300, Math.floor(minScore / 50) * 50 - 50);
  maxScore = Math.min(900, Math.ceil(maxScore / 50) * 50 + 50);

  // Reference values for good and excellent credit
  const goodCreditLine = 670;
  const excellentCreditLine = 800;

  // Custom tooltip to display all scores for the selected date
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          <div className="space-y-2">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="font-medium text-gray-700">{entry.name}:</span>
                </div>
                <span className="font-bold ml-4">{entry.value || 'N/A'}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom legend that shows colored dots instead of lines
  const CustomLegend = (props) => {
    const { payload } = props;
    
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-2">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className="text-sm font-medium text-gray-700">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" opacity={0.5} />
        
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={{ stroke: '#E5E7EB' }}
          axisLine={{ stroke: '#E5E7EB' }}
        />
        
        <YAxis 
          domain={[minScore, maxScore]} 
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickLine={{ stroke: '#E5E7EB' }}
          axisLine={{ stroke: '#E5E7EB' }}
          tickCount={7}
        />
        
        {/* Reference lines for credit score ranges */}
        <ReferenceLine 
          y={excellentCreditLine} 
          stroke="#10B981" 
          strokeDasharray="3 3"
          label={{ 
            value: 'Excellent', 
            position: 'right', 
            fill: '#10B981',
            fontSize: 12
          }} 
        />
        
        <ReferenceLine 
          y={goodCreditLine} 
          stroke="#F59E0B" 
          strokeDasharray="3 3"
          label={{ 
            value: 'Good', 
            position: 'right', 
            fill: '#F59E0B',
            fontSize: 12
          }} 
        />
        
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        
        {bureaus.map((bureau, index) => (
          <Line
            key={index}
            type="monotone"
            dataKey={bureau}
            name={bureau}
            stroke={bureauColors[bureau] || `#${Math.floor(Math.random() * 16777215).toString(16)}`}
            strokeWidth={2.5}
            dot={{ stroke: bureauColors[bureau], strokeWidth: 2, r: 4, fill: 'white' }}
            activeDot={{ 
              stroke: bureauColors[bureau],
              strokeWidth: 2,
              r: 6,
              fill: 'white',
              boxShadow: '0 0 0 2px rgba(255,255,255,0.8)'
            }}
            connectNulls={true}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default CreditScoreChart;