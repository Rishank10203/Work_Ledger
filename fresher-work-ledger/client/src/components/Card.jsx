import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const Card = forwardRef(({ children, className = '', animate = false, ...props }, ref) => {
  const Comp = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 }
  } : {};

  return (
    <Comp 
      ref={ref}
      className={`rounded-3xl border border-white/20 bg-white/70 backdrop-blur-xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:border-gray-800/50 dark:bg-gray-900/80 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] ${className}`}
      {...animationProps}
      {...props}
    >
      {children}
    </Comp>
  );
});

Card.displayName = 'Card';
