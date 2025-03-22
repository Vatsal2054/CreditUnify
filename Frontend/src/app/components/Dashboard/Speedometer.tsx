'use client';
import CountUp from '@/components/animations/CountUp';
import { useState, useEffect, useRef } from 'react';

const EnhancedSpeedometer = ({ data }) => {
  const { bureau, score, rangeStart, rangeEnd } = data;
  const [isAnimating, setIsAnimating] = useState(false);
  const [needleAngle, setNeedleAngle] = useState(-90); // Start at -90 degrees
  const [displayScore, setDisplayScore] = useState(rangeStart);
  const requestRef = useRef(null);
  const startTimeRef = useRef(null);

  // Parse score as number if it's a string
  const numericScore =
    typeof score === 'string' ? Number.parseInt(score, 10) : score;

  // Calculate the percentage and target angle
  const percentage = Math.min(
    100,
    Math.max(0, ((numericScore - rangeStart) / (rangeEnd - rangeStart)) * 100),
  );
  const targetAngle = -90 + percentage * 1.8; // 180 degree arc mapped to percentage
  const displayPercentage = Math.round(percentage);

  // Animation function using requestAnimationFrame for needle
  const animateNeedle = (timestamp) => {
    if (!startTimeRef.current) startTimeRef.current = timestamp;
    const elapsed = timestamp - startTimeRef.current;

    // Animation duration in ms
    const duration = 1500;

    if (elapsed < duration) {
      // Easing function (ease-out-cubic)
      const progress = 1 - Math.pow(1 - elapsed / duration, 3);
      const currentAngle = -90 + (targetAngle + 90) * progress;

      // Also animate the score counter
      const currentScore = Math.round(
        rangeStart + (numericScore - rangeStart) * progress,
      );
      setDisplayScore(currentScore);

      setNeedleAngle(currentAngle);
      requestRef.current = requestAnimationFrame(animateNeedle);
    } else {
      setNeedleAngle(targetAngle);
      setDisplayScore(numericScore);
      setIsAnimating(false);
    }
  };

  // Start animation when component mounts or when relevant props change
  useEffect(() => {
    // Reset animation state
    setIsAnimating(false);
    setNeedleAngle(-90);
    setDisplayScore(rangeStart);

    // Reset the start time reference
    startTimeRef.current = null;

    // Clear any existing animation frame
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = null;
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsAnimating(true);
      requestRef.current = requestAnimationFrame(animateNeedle);
    }, 300);

    return () => {
      clearTimeout(timer);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [rangeStart, rangeEnd, numericScore, targetAngle]); // Add all dependencies

  // Get color based on percentage - for the score text
  const getScoreColor = () => {
    if (displayPercentage < 33) return 'text-orange-500';
    if (displayPercentage < 67) return 'text-amber-400';
    return 'text-emerald-500';
  };

  // Generate tick marks around the full speedometer
  const generateTicks = () => {
    const ticks = [];
    // Generate 11 ticks (fewer for compactness) for a full 180 degree arc
    for (let i = 0; i <= 10; i++) {
      const tickAngle = -180 + i * 18;
      const isMajor = i % 2 === 0;
      const tickLength = isMajor ? 8 : 5;

      const x1 = 100 + 78 * Math.cos((tickAngle * Math.PI) / 180);
      const y1 = 100 + 78 * Math.sin((tickAngle * Math.PI) / 180);
      const x2 =
        100 + (78 - tickLength) * Math.cos((tickAngle * Math.PI) / 180);
      const y2 =
        100 + (78 - tickLength) * Math.sin((tickAngle * Math.PI) / 180);

      ticks.push(
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#666"
          strokeWidth={isMajor ? '2' : '1'}
        />,
      );
    }
    return ticks;
  };

  return (
    <div className="bg-white rounded-lg p-3 shadow-sm w-full border border-gray-100 h-full">
      <div className="flex flex-col items-center">
        {/* Bureau name with badge */}
        <div className="flex items-center mb-2">
          <h3 className="text-lg font-bold text-gray-800">{bureau}</h3>
          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            Score
          </span>
        </div>

        {/* Score display */}
        <div className="flex justify-center mb-1">
          <CountUp
            from={0}
            to={score}
            separator=","
            direction="up"
            duration={0.5}
            className={`${getScoreColor()} text-3xl font-bold`}
          />
        </div>

        {/* Range display */}
        <div className="text-xs text-gray-500 mb-2">
          Range: {rangeStart} - {rangeEnd}
        </div>

        {/* Gauge */}
        <div className="relative w-full h-24 mb-2">
          <svg width="100%" height="100%" viewBox="0 0 200 120">
            {/* Background circle for the full 180-degree arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="#f1f1f1"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Orange section (0-33%) */}
            <path
              d="M 10 100 A 90 90 0 0 1 42 31"
              fill="none"
              stroke="#FF7A50"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Yellow section (33-67%) */}
            <path
              d="M 42 31 A 90 90 0 0 1 158 31"
              fill="none"
              stroke="#FFC93C"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Green section (67-100%) */}
            <path
              d="M 158 31 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="#34C77B"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* Tick marks */}
            {generateTicks()}

            {/* Needle */}
            <g transform={`rotate(${needleAngle}, 100, 100)`}>
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="5" fill="#333" />
            </g>

            {/* Center point */}
            <circle
              cx="100"
              cy="100"
              r="8"
              fill="white"
              stroke="#ccc"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Labels and value display */}
        <div className="w-full grid grid-cols-3 text-center">
          <span className="text-xs font-semibold text-orange-500">Poor</span>
          <span className="text-xs font-semibold text-amber-400">Average</span>
          <span className="text-xs font-semibold text-emerald-500">
            Excellent
          </span>
        </div>

        <div className="w-full flex justify-between px-2 mt-1">
          <span className="text-xs font-medium text-gray-700">
            {rangeStart}
          </span>
          <span className={`text-xs font-bold ${getScoreColor()}`}>
            {displayPercentage}%
          </span>
          <span className="text-xs font-medium text-gray-700">{rangeEnd}</span>
        </div>
      </div>
    </div>
  );
};

export default EnhancedSpeedometer;