import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
export function HotelNav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return (
    <motion.nav
      initial={{
        opacity: 0,
        y: -20
      }}
      animate={{
        opacity: 1,
        y: 0
      }}
      transition={{
        duration: 0.6,
        ease: 'easeOut'
      }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-black/[0.06] h-16">

      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <a
            href="#"
            className="font-heading text-xl tracking-[0.3em] text-gray-900 font-semibold">

            AURA
          </a>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {['Rooms', 'Amenities', 'About', 'Contact'].map((item) =>
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="font-body text-xs tracking-widest uppercase text-gray-500 hover:text-gray-900 transition-colors">

              {item}
            </a>
          )}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <button className="holographic-btn rounded-full px-5 py-2 text-xs tracking-widest uppercase">
            Book Now
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-gray-900 p-2">

            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen &&
      <motion.div
        initial={{
          opacity: 0,
          height: 0
        }}
        animate={{
          opacity: 1,
          height: 'auto'
        }}
        exit={{
          opacity: 0,
          height: 0
        }}
        className="md:hidden bg-white border-b border-black/[0.06] absolute w-full">

          <div className="px-6 py-4 flex flex-col space-y-4">
            {['Rooms', 'Amenities', 'About', 'Contact'].map((item) =>
          <a
            key={item}
            href={`#${item.toLowerCase()}`}
            className="font-body text-sm tracking-widest uppercase text-gray-600 py-2"
            onClick={() => setIsMobileMenuOpen(false)}>

                {item}
              </a>
          )}
            <button className="holographic-btn rounded-full px-5 py-3 text-xs tracking-widest uppercase w-full mt-4">
              Book Now
            </button>
          </div>
        </motion.div>
      }
    </motion.nav>);

}