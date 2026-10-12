import React from 'react';
import { Thermometer, Droplets, Zap, Activity } from 'lucide-react';

// Precision Responsive SVG Sparkline
function Sparkline({ data, color = '#22D3EE' }) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 80;
  const height = 32;
  const pad = 2;

  const coords = data.map((val, idx) => {
    const x = pad + (idx / (data.length - 1)) * (width - pad * 2);
    const y = height - pad - ((val - min) / range) * (height - pad * 2);
    return [x, y];
  });

  const linePoints = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const areaPoints = `${coords[0][0]},${height} ${linePoints} ${coords[coords.length - 1][0]},${height}`;
  const gradId = `spark-grad-${color.replace('#', '')}`;

  return (
    <div className="w-20 h-8 flex items-center justify-end shrink-0">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <polygon fill={`url(#${gradId})`} points={areaPoints} />
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={linePoints}
        />
        <circle
          cx={coords[coords.length - 1][0]}
          cy={coords[coords.length - 1][1]}
          r="2.5"
          fill={color}
        />
      </svg>
    </div>
  );
}

export default function TelemetrySparklines({ temperature, humidity, totalWatts, totalKwh, history }) {
  const cards = [
    {
      title: 'Ambient Temperature',
      val: `${temperature}`,
      unit: '°C',
      badge: 'DHT11 Sensor',
      icon: Thermometer,
      color: temperature > 30 ? '#EF4444' : '#22D3EE',
      data: history.temp,
    },
    {
      title: 'Relative Humidity',
      val: `${humidity}`,
      unit: '%',
      badge: 'DHT11 Sensor',
      icon: Droplets,
      color: '#38BDF8',
      data: history.hum,
    },
    {
      title: 'Active Power Draw',
      val: `${totalWatts}`,
      unit: 'W',
      badge: 'Real-time Wattage',
      icon: Zap,
      color: totalWatts > 0 ? '#F59E0B' : '#94A3B8',
      data: history.power,
    },
    {
      title: 'Cumulative Energy',
      val: `${totalKwh}`,
      unit: 'kWh',
      badge: 'Energy Consumed',
      icon: Activity,
      color: '#10B981',
      data: history.energy,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl glass-panel p-4 border border-white/10 hover:border-white/15 transition-all flex flex-col justify-between shadow-glass h-[112px]"
          >
            {/* Top row: Title on left, Icon badge on right */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                {card.title}
              </span>
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-white/5 shrink-0"
                style={{
                  backgroundColor: `${card.color}15`,
                  color: card.color,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Bottom row: Value & Sensor Badge on left, Sparkline on right */}
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-white tracking-tight leading-none">
                    {card.val}
                  </span>
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: card.color }}
                  >
                    {card.unit}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 block mt-1">
                  {card.badge}
                </span>
              </div>

              <Sparkline data={card.data} color={card.color} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
