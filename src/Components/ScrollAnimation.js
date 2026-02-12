import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const ScrollAnimation = ({ 
  children, 
  className = "",
  animation = "fadeInUp",
  delay = 0,
  duration = 0.6,
  threshold = 0.1
}) => {
  const [ref, inView] = useInView({
    threshold,
    triggerOnce: true
  });

  const animations = {
    fadeInUp: {
      initial: { opacity: 0, y: 60 },
      animate: inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }
    },
    fadeInLeft: {
      initial: { opacity: 0, x: -60 },
      animate: inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -60 }
    },
    fadeInRight: {
      initial: { opacity: 0, x: 60 },
      animate: inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 60 }
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.8 },
      animate: inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }
    }
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={animations[animation].initial}
      animate={animations[animation].animate}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export default ScrollAnimation;

