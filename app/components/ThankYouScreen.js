'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ThankYouScreen({ redirectUrl }) {
  const [countdown, setCountdown] = useState(5);
  
  useEffect(() => {
    // Create countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      // Redirect after countdown
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    }
  }, [countdown, redirectUrl]);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="max-w-xl mx-auto p-8 bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.3 
          }}
          className="mb-6 mx-auto flex justify-center"
        >
          <div className="rounded-full bg-[#8C7851]/20 p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-[#8C7851]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>
        
        <motion.h2 
          className="text-3xl font-bold mb-4 text-gray-800"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          Thank You!
        </motion.h2>
        
        <motion.p 
          className="text-lg text-gray-600 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          Your response has been successfully submitted.
          {redirectUrl && (
            <span> You will be redirected in <span className="font-medium text-[#A65E3A]">{countdown}</span> seconds.</span>
          )}
        </motion.p>
        
        {redirectUrl && (
          <motion.div 
            className="relative h-1 bg-gray-200 rounded-full overflow-hidden mb-4"
            initial={{ width: "100%" }}
            animate={{ width: "100%" }}
          >
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#8C7851] to-[#A65E3A]"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
            />
          </motion.div>
        )}
        
        {redirectUrl && (
          <motion.a
            href={redirectUrl}
            className="inline-block text-sm text-[#8C7851] hover:text-[#A65E3A] hover:underline transition-colors duration-300 ease-in-out"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Click here if you are not redirected automatically
          </motion.a>
        )}
      </motion.div>
    </motion.div>
  );
} 