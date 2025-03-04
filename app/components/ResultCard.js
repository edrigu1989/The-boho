'use client';

import { motion } from 'framer-motion';

export default function ResultCard({ score, classification, background }) {
  const getScoreColor = () => {
    if (score >= 80) return 'text-[#040e00]';
    if (score >= 50) return 'text-[#544d41]';
    return 'text-[#800000]';
  };

  const getClassificationDescription = () => {
    switch (classification) {
      case 'Hot Lead':
        return 'This lead shows high intent and readiness to purchase. Follow up immediately.';
      case 'Warm Lead':
        return 'This lead has potential but may need more nurturing. Schedule a follow-up call.';
      case 'Cold Lead':
        return 'This lead needs significant nurturing. Add to your email campaign and check back in 30 days.';
      default:
        return '';
    }
  };

  return (
    <div className={`p-6 rounded-lg border relative overflow-hidden ${background}`}>
      <div className="absolute inset-0 opacity-10" style={{ backgroundColor: background }}></div>
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-2">Lead Score Result</h3>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm opacity-70">Classification</p>
            <p className={`text-xl font-bold ${getScoreColor()}`}>{classification}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-70">Score</p>
            <motion.p
              className={`text-3xl font-bold ${getScoreColor()}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 15,
                delay: 0.1
              }}
            >
              {score}/100
            </motion.p>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-50 p-4 rounded-md">
          <p className="text-sm">{getClassificationDescription()}</p>
        </div>
        
        <div className="mt-6">
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getScoreColor().replace('text-', 'bg-')}`}
              initial={{ width: '0%' }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            ></motion.div>
          </div>
          <div className="flex justify-between text-xs mt-1 text-gray-500">
            <span>0</span>
            <span>Cold Lead</span>
            <span>Warm Lead</span>
            <span>Hot Lead</span>
            <span>100</span>
          </div>
        </div>
        
        <motion.div
          className="mt-6 text-sm text-gray-700"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <p className="font-medium mb-2">Next steps:</p>
          {classification === 'Hot Lead' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Contact lead within 1 hour</li>
              <li>Prepare property suggestions based on their preferences</li>
              <li>Schedule a consultation call or meeting</li>
            </ul>
          )}
          {classification === 'Warm Lead' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Contact lead within 24 hours</li>
              <li>Send informational resources about the market</li>
              <li>Schedule a follow-up call in one week</li>
            </ul>
          )}
          {classification === 'Cold Lead' && (
            <ul className="list-disc list-inside space-y-1">
              <li>Add to email nurture campaign</li>
              <li>Send market updates monthly</li>
              <li>Check back in 30-60 days</li>
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
} 