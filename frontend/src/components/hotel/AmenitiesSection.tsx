import React from 'react';
import { motion } from 'framer-motion';
import {
  Waves,
  Utensils,
  Dumbbell,
  Car,
  Wifi,
  Wind,
  Shield,
  Star } from
'lucide-react';
const amenities = [
{
  icon: Waves,
  label: 'Spa & Wellness'
},
{
  icon: Utensils,
  label: 'Fine Dining'
},
{
  icon: Dumbbell,
  label: 'Fitness Center'
},
{
  icon: Car,
  label: 'Valet Service'
},
{
  icon: Wifi,
  label: 'Connectivity'
},
{
  icon: Wind,
  label: 'Climate Control'
},
{
  icon: Shield,
  label: '24/7 Security'
},
{
  icon: Star,
  label: 'Concierge'
}];

export function AmenitiesSection() {
  return (
    <section id="amenities" className="py-32 px-6 bg-white">
      <div className="max-w-4xl mx-auto text-center">
        <motion.span
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          className="block font-body text-xs tracking-widest uppercase text-gray-400 mb-4">

          Beyond Ordinary
        </motion.span>
        <motion.h2
          initial={{
            opacity: 0,
            y: 20
          }}
          whileInView={{
            opacity: 1,
            y: 0
          }}
          viewport={{
            once: true
          }}
          transition={{
            delay: 0.1
          }}
          className="font-heading text-5xl holographic-text mb-16">

          Infinite Refinements
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-12 gap-x-8">
          {amenities.map((item, index) =>
          <motion.div
            key={item.label}
            initial={{
              opacity: 0,
              y: 20
            }}
            whileInView={{
              opacity: 1,
              y: 0
            }}
            viewport={{
              once: true
            }}
            transition={{
              delay: index * 0.05
            }}
            className="flex flex-col items-center group">

              <div className="w-14 h-14 rounded-full border border-gray-200 flex items-center justify-center mb-4 relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-tr from-[#b8a9ff]/20 via-[#a8d8ff]/20 to-[#ffb8d8]/20"></div>
                <div className="absolute inset-0 rounded-full border border-transparent group-hover:border-[#a8d8ff] transition-colors duration-300"></div>
                <item.icon
                size={20}
                className="text-gray-400 group-hover:text-gray-600 relative z-10 transition-colors" />

              </div>
              <span className="font-body text-xs tracking-widest uppercase text-gray-500 group-hover:text-gray-800 transition-colors">
                {item.label}
              </span>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}