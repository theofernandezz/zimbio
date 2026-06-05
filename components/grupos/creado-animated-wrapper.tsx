"use client";

import { motion } from "framer-motion";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const card = {
  hidden: { opacity: 0, scale: 0.97, y: 10 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export function CreadoAnimatedWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="w-full max-w-lg space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {children}
    </motion.div>
  );
}

export function CreadoAnimatedCard({ children }: { children: React.ReactNode }) {
  return <motion.div variants={card}>{children}</motion.div>;
}
