'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeadForm from './components/LeadForm';
import ThankYouScreen from './components/ThankYouScreen';
import Image from 'next/image';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [formStep, setFormStep] = useState(1);
  const [formResponses, setFormResponses] = useState({});
  const [formProgress, setFormProgress] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for subtle movement effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleSubmitForm = async (formData) => {
    setIsLoading(true);
    try {
      console.log('Enviando datos del formulario:', formData);
      
      // Send data to our endpoint
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (data.success) {
        // Show thank you screen and set redirect URL
        setShowThankYou(true);
        setRedirectUrl(data.redirectUrl);
      } else {
        console.error('Error submitting form:', data.error);
        alert('There was an error submitting the form. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting the form. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextStep = (formData) => {
    // Update form responses
    const updatedResponses = { ...formResponses, ...formData };
    setFormResponses(updatedResponses);
    console.log('Paso actual:', formStep, 'Datos actualizados:', updatedResponses);
    
    if (formStep < 11) {
      setFormStep(prev => prev + 1);
      setFormProgress((formStep / 11) * 100);
    } else {
      // Submit form when last step is completed
      console.log('Enviando formulario completo en el último paso:', updatedResponses);
      handleSubmitForm(updatedResponses);
    }
  };

  const handlePrevStep = () => {
    if (formStep > 1) {
      setFormStep(prev => prev - 1);
      setFormProgress(((formStep - 2) / 11) * 100);
    }
  };

  const resetForm = () => {
    setFormStep(1);
    setFormResponses({});
    setFormProgress(0);
  };

  // Subtle movement effect values
  const moveEffect = {
    x: mousePosition.x * -15,
    y: mousePosition.y * -15,
  };

  return (
    <main className="min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with blur and gradient overlay */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 backdrop-blur-[2px]"> {/* Subtle blur effect */}
          <Image
            src="/background.png"
            alt="Background"
            fill
            quality={100}
            priority
            style={{ objectFit: 'cover' }}
          />
        </div>
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[rgba(223,213,195,0.3)]"></div>
      </div>

      <div className="z-10 flex items-center justify-center w-full p-4">
        <div className="container max-w-xl mx-auto">
          <AnimatePresence mode="wait">
            {showThankYou ? (
              <motion.div
                key="thank-you"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ThankYouScreen redirectUrl={redirectUrl} />
              </motion.div>
            ) : (
              <motion.div
                key="form"
                style={{
                  x: moveEffect.x,
                  y: moveEffect.y,
                }}
                transition={{ type: 'spring', stiffness: 50 }}
                className="bg-white bg-opacity-80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {/* Progress bar */}
                <div className="px-6 pt-4">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-2">
                    <span>Question {formStep} of 11</span>
                    <span>{Math.round(formProgress)}% Complete</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${formProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={formStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LeadForm 
                        onSubmit={handleNextStep}
                        onReset={resetForm}
                        isLoading={isLoading}
                        currentStep={formStep}
                        onPrevStep={handlePrevStep}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
} 