import React from 'react';
import { motion } from 'framer-motion';
export function HotelFooter() {
  return (
    <footer className="bg-[#1A1A1A] py-20 px-6 text-white">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center">
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
            className="font-heading text-4xl holographic-text tracking-[0.4em]">

            AURA
          </motion.h2>
          <motion.p
            initial={{
              opacity: 0
            }}
            whileInView={{
              opacity: 1
            }}
            viewport={{
              once: true
            }}
            transition={{
              delay: 0.2
            }}
            className="font-body text-xs tracking-widest text-gray-500 mt-2">

            The Future of Luxury
          </motion.p>
        </div>

        <div className="h-px w-full bg-gray-800 my-12"></div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          <div>
            <h3 className="font-body text-xs tracking-widest uppercase text-gray-400 mb-6">
              Explore
            </h3>
            <ul className="space-y-4">
              {['Rooms', 'Amenities', 'Dining', 'Spa'].map((item) =>
              <li key={item}>
                  <a
                  href="#"
                  className="font-body text-xs text-gray-500 hover:text-gray-300 tracking-wider transition-colors">

                    {item}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-xs tracking-widest uppercase text-gray-400 mb-6">
              Visit
            </h3>
            <ul className="space-y-4">
              {['Location', 'Directions', 'Parking', 'Accessibility'].map(
                (item) =>
                <li key={item}>
                    <a
                    href="#"
                    className="font-body text-xs text-gray-500 hover:text-gray-300 tracking-wider transition-colors">

                      {item}
                    </a>
                  </li>

              )}
            </ul>
          </div>

          <div>
            <h3 className="font-body text-xs tracking-widest uppercase text-gray-400 mb-6">
              Connect
            </h3>
            <ul className="space-y-4">
              {['Instagram', 'Press', 'Careers', 'Contact'].map((item) =>
              <li key={item}>
                  <a
                  href="#"
                  className="font-body text-xs text-gray-500 hover:text-gray-300 tracking-wider transition-colors">

                    {item}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-12 border-t border-gray-800 text-center">
          <p className="font-body text-xs text-gray-600">
            © 2025 Aura Hotel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>);

}