'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className={`fixed top-0 left-0 right-0 z-50 py-3 px-6 transition-all duration-300 ${
        scrolled ? 'bg-white bg-opacity-80 backdrop-blur-md shadow-md' : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Image 
              src="/theboho/logo.png" 
              alt="The Boho Logo" 
              width={40} 
              height={40}
              className="object-contain"
            />
          </motion.div>
          <motion.span 
            className="text-gray-800 font-bold text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            The Boho
          </motion.span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8 items-center">
          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Link href="/" className="text-gray-800 hover:text-green-600 transition-colors">
              Home
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Link href="/properties" className="text-gray-800 hover:text-green-600 transition-colors">
              Properties
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Link href="/about" className="text-gray-800 hover:text-green-600 transition-colors">
              About
            </Link>
          </motion.div>
          <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300 }}>
            <Link href="/contact" className="text-gray-800 hover:text-green-600 transition-colors">
              Contact
            </Link>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 text-white px-5 py-2 rounded-xl hover:bg-green-600 transition-all duration-200 font-medium"
          >
            Register Interest
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          className="md:hidden text-gray-800"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close Menu' : 'Open Menu'}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="w-6 h-6"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute top-16 left-0 right-0 bg-white bg-opacity-95 backdrop-blur-xl shadow-lg rounded-b-lg p-6 md:hidden"
            >
              <div className="flex flex-col space-y-4">
                <Link
                  href="/"
                  className="text-gray-800 hover:text-green-600 transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/properties"
                  className="text-gray-800 hover:text-green-600 transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Properties
                </Link>
                <Link
                  href="/about"
                  className="text-gray-800 hover:text-green-600 transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/contact"
                  className="text-gray-800 hover:text-green-600 transition-colors text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contact
                </Link>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  className="bg-green-500 text-white px-5 py-3 rounded-xl hover:bg-green-600 transition-colors font-medium text-lg"
                >
                  Register Interest
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
} 