import { Transition } from 'motion/react';

// Standard springs for desktop feel
export const springBouncy: Transition = {
    type: 'spring',
    stiffness: 400,
    damping: 25,
};

export const springSmooth: Transition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
};

export const easeOut: Transition = {
    type: 'tween',
    ease: 'easeOut',
    duration: 0.2,
};

export const pageTransition = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.98 },
    transition: springSmooth,
};

// hover effect config (remember to NOT use transition-all in tailwind classes)
export const buttonHover = {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: springBouncy,
};
