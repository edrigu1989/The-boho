'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [errorMessage, setErrorMessage] = useState('');
  const submitTimeoutRef = useRef(null);
  const isSubmittingRef = useRef(false);

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

  // Función con debounce para evitar envíos múltiples
  const handleSubmitForm = async (formData) => {
    // Si ya estamos enviando, cancelar
    if (isSubmittingRef.current) {
      console.log("Operación de envío ya en progreso, ignorando solicitud adicional");
      return;
    }
    
    // Limpiar cualquier mensaje de error anterior
    setErrorMessage('');
    
    // Marcar como enviando y mostrar el spinner
    isSubmittingRef.current = true;
    setIsLoading(true);
    
    // Limpiar cualquier timeout previo
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }

    console.log("Enviando datos del formulario:", formData);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundo timeout
      
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const data = await response.json();
      console.log("Respuesta del servidor:", data);
      
      if (data.success) {
        // Guardar los datos del formulario y la URL de redirección
        setFormResponses(formData);
        
        if (data.redirectUrl) {
          console.log("URL de redirección recibida:", data.redirectUrl);
          setRedirectUrl(data.redirectUrl);
        }
        
        // Mostrar pantalla de agradecimiento
        setShowThankYou(true);
      } else {
        // Manejar respuesta de error pero con código 200
        console.warn("Error reportado por el servidor:", data.message);
        setErrorMessage(data.message || "Hubo un problema al procesar tu información. Por favor, inténtalo de nuevo.");
        
        // Permitir intentar de nuevo después de un breve tiempo
        setTimeout(() => {
          isSubmittingRef.current = false;
          setIsLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error al enviar el formulario:", error);
      
      if (error.name === 'AbortError') {
        setErrorMessage("La solicitud tardó demasiado tiempo. Por favor, verifica tu conexión e inténtalo de nuevo.");
      } else {
        setErrorMessage(`Hubo un error al enviar el formulario. Por favor, inténtalo nuevamente más tarde. ${error.message}`);
      }
      
      // Permitir intentar nuevamente después de un tiempo
      setTimeout(() => {
        isSubmittingRef.current = false;
        setIsLoading(false);
      }, 2000);
    }
  };

  const handleNextStep = (formData) => {
    // Limpiar cualquier mensaje de error
    setErrorMessage('');
    
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
    // Limpiar cualquier mensaje de error
    setErrorMessage('');
    
    if (formStep > 1) {
      setFormStep(prev => prev - 1);
      setFormProgress(((formStep - 2) / 11) * 100);
    }
  };

  const resetForm = () => {
    setFormStep(1);
    setFormResponses({});
    setFormProgress(0);
    setErrorMessage('');
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

                {/* Error message display */}
                {errorMessage && (
                  <motion.div 
                    className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-start">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errorMessage}</span>
                    </div>
                    <button 
                      onClick={() => {
                        setErrorMessage('');
                        isSubmittingRef.current = false;
                        setIsLoading(false);
                      }}
                      className="mt-2 text-sm text-red-700 underline hover:text-red-800"
                    >
                      Intentar nuevamente
                    </button>
                  </motion.div>
                )}

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