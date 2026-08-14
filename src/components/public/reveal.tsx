'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '@/lib/scroll';

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
};

/**
 * Wraps children with a fade-in + subtle y-shift animation triggered on scroll.
 * Respects prefers-reduced-motion (returns plain children if reduced motion is set).
 *
 * NOTE: always renders a <div> wrapper. For semantic <section>/<article> wrapping,
 * wrap Reveal inside that element instead.
 */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y }}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.16, 1, 0.3, 1], // expo-out
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
