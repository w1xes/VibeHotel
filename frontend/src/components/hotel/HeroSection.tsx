import React, { Children } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
export function HeroSection() {
  const containerVariants = {
    hidden: {
      opacity: 0
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };
  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut'
      }
    }
  };
  return (
    <section className="relative h-screen w-full hero-bg flex flex-col items-center justify-center overflow-hidden px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col items-center text-center max-w-5xl mx-auto z-10">

        <motion.span
          variants={itemVariants}
          className="font-body text-xs tracking-[0.3em] uppercase text-gray-400 mb-8">

          Welcome to the future of hospitality
        </motion.span>

        <motion.h1
          variants={itemVariants}
          className="font-heading text-7xl md:text-9xl leading-none holographic-text whitespace-pre-line mb-6">

          WHERE LIGHT{'\n'}BECOMES HOME
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="font-body text-lg text-gray-400 mt-4 tracking-widest max-w-lg">

          A sanctuary beyond time.
        </motion.p>

        <motion.button
          variants={itemVariants}
          className="holographic-btn rounded-full px-10 py-4 text-xs tracking-[0.2em] uppercase mt-12 font-medium">

          Reserve Your Stay
        </motion.button>
      </motion.div>

      <motion.div
        initial={{
          opacity: 0
        }}
        animate={{
          opacity: 1,
          y: [0, 10, 0]
        }}
        transition={{
          delay: 2,
          duration: 2,
          repeat: Infinity
        }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-gray-300">

        <ChevronDown size={32} strokeWidth={1} />
      </motion.div>
    </section>);

}