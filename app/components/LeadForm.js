'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Questions definition
const formSteps = [
  // Step 1: Full name
  {
    id: 'fullName',
    question: 'What is your full name?',
    type: 'text',
    placeholder: 'Enter your full name',
    validation: (value) => value.length > 0 ? null : 'Please enter your full name',
  },
  // Step 2: Email
  {
    id: 'email',
    question: 'What is your email address?',
    type: 'email',
    placeholder: 'Enter your email',
    validation: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : 'Please enter a valid email address',
  },
  // Step 3: Phone
  {
    id: 'phone',
    question: 'What is your phone number?',
    type: 'tel',
    placeholder: 'Enter your phone number',
    validation: (value) => value.length > 0 ? null : 'Please enter your phone number',
  },
  // Step 4: Preferred contact method
  {
    id: 'contactMethod',
    question: 'What is your preferred contact method?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'phone', label: 'Phone/WhatsApp', points: 10 },
      { value: 'email', label: 'Email', points: 7 },
      { value: 'text', label: 'Text', points: 5 },
    ],
    validation: (value) => value ? null : 'Please select your preferred contact method',
  },
  // Step 5: Primary buying reason
  {
    id: 'buyingReason',
    question: 'What is your primary reason for buying?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'firstHome', label: 'First Home', points: 15 },
      { value: 'investment', label: 'Investment', points: 12 },
      { value: 'secondHome', label: 'Second Home', points: 10 },
      { value: 'relocation', label: 'Relocation', points: 15 },
      { value: 'other', label: 'Other', points: 5 },
    ],
    validation: (value) => value ? null : 'Please select your reason for buying',
  },
  // Step 6: Purchase timeline
  {
    id: 'timeline',
    question: 'What is your purchase timeline?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'immediately', label: 'Immediately', points: 20 },
      { value: 'within3months', label: 'Within 3 months', points: 15 },
      { value: '3to6months', label: '3-6 months', points: 10 },
      { value: 'moreThan6months', label: 'More than 6 months', points: 5 },
      { value: 'justExploring', label: 'Just exploring', points: 0 },
    ],
    validation: (value) => value ? null : 'Please select your purchase timeline',
  },
  // Step 7: First-time buyer
  {
    id: 'firstTimeBuyer',
    question: 'Are you a first-time buyer?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'yes', label: 'Yes', points: 5 },
      { value: 'no', label: 'No', points: 0 },
    ],
    validation: (value) => value ? null : 'Please select an option',
  },
  // Step 8: Budget
  {
    id: 'budget',
    question: 'What is your budget range?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'under200k', label: 'Under $200,000', points: 5 },
      { value: '200kTo300k', label: '$200,000 - $300,000', points: 8 },
      { value: '300kTo500k', label: '$300,000 - $500,000', points: 10 },
      { value: '500kTo750k', label: '$500,000 - $750,000', points: 12 },
      { value: '750kTo1m', label: '$750,000 - $1,000,000', points: 15 },
      { value: 'over1m', label: 'Over $1,000,000', points: 20 },
    ],
    validation: (value) => value ? null : 'Please select your budget range',
  },
  // Step 9: Loan approval status
  {
    id: 'loanStatus',
    question: 'What is your loan approval status?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'preApproved', label: 'Pre-approved', points: 20 },
      { value: 'preQualified', label: 'Pre-qualified', points: 10 },
      { value: 'notStarted', label: 'Not started yet', points: 0 },
      { value: 'cashBuyer', label: 'I am a cash buyer', points: 25 },
    ],
    validation: (value) => value ? null : 'Please select your loan approval status',
  },
  // Step 10: Property type
  {
    id: 'propertyType',
    question: 'What type of property are you looking for?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'singleFamily', label: 'Single Family Home', points: 10 },
      { value: 'townhouse', label: 'Townhouse', points: 8 },
      { value: 'condo', label: 'Condo', points: 6 },
      { value: 'multifamily', label: 'Multi-Family', points: 12 },
      { value: 'land', label: 'Land', points: 4 },
    ],
    validation: (value) => value ? null : 'Please select a property type',
  },
  // Step 11: Credit Score (nueva pregunta)
  {
    id: 'creditScore',
    question: 'What is your credit score range?',
    type: 'select',
    options: [
      { value: '', label: 'Select an option', points: 0 },
      { value: 'excellent', label: '740 or Higher', points: 25 },
      { value: 'good', label: '700-739', points: 20 },
      { value: 'fair', label: '650-699', points: 15 },
      { value: 'poor', label: '600-649', points: 5 },
      { value: 'veryPoor', label: 'Below 600', points: 0 },
      { value: 'unknown', label: 'I don\'t know', points: 0 },
    ],
    validation: (value) => value ? null : 'Please select your credit score range',
  },
];

export default function LeadForm({ onSubmit, onReset, isLoading, currentStep, onPrevStep }) {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const currentStepData = formSteps[currentStep - 1];

  useEffect(() => {
    // Reset selected options when changing steps in case of multiselect
    if (currentStepData && currentStepData.type === 'multiselect') {
      setSelectedOptions(formData[currentStepData.id] || []);
    }
  }, [currentStep, currentStepData, formData]);

  const validateCurrentStep = () => {
    if (!currentStepData) return true;
    
    const value = formData[currentStepData.id] || '';
    const validationError = currentStepData.validation ? currentStepData.validation(value) : null;
    
    if (validationError) {
      setErrors({
        ...errors,
        [currentStepData.id]: validationError
      });
      return false;
    }
    
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    
    // Find selected option and its points
    let points = 0;
    let label = '';
    
    if (currentStepData && currentStepData.options) {
      const selectedOption = currentStepData.options.find(option => option.value === value);
      if (selectedOption) {
        points = selectedOption.points;
        label = selectedOption.label;
      }
    }
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when user selects an option
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleMultiselectChange = (option) => {
    let newSelectedOptions = [...selectedOptions];
    
    if (newSelectedOptions.includes(option.value)) {
      // Remove if already selected
      newSelectedOptions = newSelectedOptions.filter(val => val !== option.value);
    } else {
      // Add if not selected
      newSelectedOptions.push(option.value);
    }
    
    setSelectedOptions(newSelectedOptions);
    
    // Calculate total points for multiselect
    let totalPoints = 0;
    newSelectedOptions.forEach(optValue => {
      const opt = currentStepData.options.find(o => o.value === optValue);
      if (opt) {
        totalPoints += opt.points;
      }
    });
    
    setFormData({
      ...formData,
      [currentStepData.id]: newSelectedOptions
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateCurrentStep()) {
      const formDataWithPoints = {};
      
      // Prepare data with points for current step
      if (currentStepData) {
        if (currentStepData.type === 'multiselect') {
          // Calculate total points for multiselect
          let totalPoints = 0;
          selectedOptions.forEach(optValue => {
            const opt = currentStepData.options.find(o => o.value === optValue);
            if (opt) {
              totalPoints += opt.points;
            }
          });
          
          formDataWithPoints[currentStepData.id] = {
            value: selectedOptions,
            points: totalPoints,
            label: selectedOptions.map(optValue => {
              const opt = currentStepData.options.find(o => o.value === optValue);
              return opt ? opt.label : '';
            }).join(', ')
          };
        } else if (currentStepData.type === 'select') {
          const selectedOption = currentStepData.options.find(
            option => option.value === formData[currentStepData.id]
          );
          
          formDataWithPoints[currentStepData.id] = {
            value: formData[currentStepData.id],
            points: selectedOption ? selectedOption.points : 0,
            label: selectedOption ? selectedOption.label : '',
          };
        } else {
          // For text, email, tel inputs, etc.
          formDataWithPoints[currentStepData.id] = {
            value: formData[currentStepData.id] || '',
            points: 0,
            label: formData[currentStepData.id] || '',
          };
        }
      }
      
      onSubmit(formDataWithPoints);
    }
  };

  const renderFormField = () => {
    if (!currentStepData) return null;

    switch (currentStepData.type) {
      case 'text':
      case 'email':
      case 'tel':
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold mb-6 text-center text-gray-700"
            >
              {currentStepData.question}
            </motion.h2>
            
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <input
                type={currentStepData.type}
                id={currentStepData.id}
                name={currentStepData.id}
                placeholder={currentStepData.placeholder}
                value={formData[currentStepData.id] || ''}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`w-full p-4 text-lg border rounded-xl transition-all duration-300 focus:outline-none ${
                  errors[currentStepData.id] 
                    ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                    : isFocused 
                      ? 'border-[#8C7851] focus:border-[#8C7851] focus:ring-2 focus:ring-[#8C7851]/20 shadow-sm' 
                      : 'border-gray-300 hover:border-[#8C7851]/50'
                } bg-white bg-opacity-90`}
              />
              
              {errors[currentStepData.id] && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-red-500 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors[currentStepData.id]}
                </motion.p>
              )}
            </motion.div>
          </div>
        );
        
      case 'select':
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold mb-6 text-center text-gray-700"
            >
              {currentStepData.question}
            </motion.h2>
            
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <select
                  id={currentStepData.id}
                  name={currentStepData.id}
                  value={formData[currentStepData.id] || ''}
                  onChange={handleSelectChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  className={`w-full p-4 text-lg border rounded-xl appearance-none transition-all duration-300 focus:outline-none ${
                    errors[currentStepData.id] 
                      ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                      : isFocused 
                        ? 'border-[#8C7851] focus:border-[#8C7851] focus:ring-2 focus:ring-[#8C7851]/20 shadow-sm' 
                        : 'border-gray-300 hover:border-[#8C7851]/50'
                  } bg-white bg-opacity-90`}
                >
                  {currentStepData.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {errors[currentStepData.id] && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-2 text-red-500 text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {errors[currentStepData.id]}
                </motion.p>
              )}
            </motion.div>
          </div>
        );
        
      case 'multiselect':
        return (
          <div>
            <motion.h2 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold mb-6 text-center text-gray-700"
            >
              {currentStepData.question}
            </motion.h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentStepData.options.map((option, index) => (
                <motion.div
                  key={option.value}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  onClick={() => handleMultiselectChange(option)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 border rounded-xl cursor-pointer transition-all duration-300 ease-in-out ${
                    selectedOptions.includes(option.value)
                      ? 'bg-[#8C7851] text-white border-[#8C7851] shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-[#8C7851]'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded-full border ${
                      selectedOptions.includes(option.value)
                        ? 'bg-white border-white'
                        : 'border-gray-400'
                    } mr-3 flex-shrink-0 flex items-center justify-center`}>
                      {selectedOptions.includes(option.value) && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span>{option.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-sm text-gray-500 text-right mb-2">
        Question {currentStep} of 11
      </div>
      
      {renderFormField()}
      
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <motion.button
            type="button"
            onClick={onPrevStep}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center border border-gray-200"
            disabled={isLoading}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </motion.button>
        ) : (
          <div></div> // Empty space to maintain layout
        )}
        
        <motion.button
          type="submit"
          className="px-6 py-3 bg-[#8C7851] text-white rounded-xl hover:bg-[#A65E3A] transition-all duration-300 ease-in-out flex items-center shadow-lg border border-[#8C7851]/30"
          disabled={isLoading}
          whileHover={{ x: 3, boxShadow: "0 0 15px rgba(140, 120, 81, 0.5)" }}
          whileTap={{ scale: 0.97 }}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              {currentStep === 11 ? 'Submit' : 'Next'}
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
} 