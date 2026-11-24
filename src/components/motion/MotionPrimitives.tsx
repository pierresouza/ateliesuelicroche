"use client";

import { ReactNode } from "react";
import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

export const EASE_ARTISAN: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.52,
      ease: EASE_ARTISAN,
    },
  },
};

interface FadeInProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  distance?: number;
  duration?: number;
  once?: boolean;
}

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 20,
  duration = 0.55,
  once = true,
  className,
  ...props
}: FadeInProps) {
  const offset = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  }[direction];

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-50px" }}
      transition={{ duration, delay, ease: EASE_ARTISAN }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  staggerDelay?: number;
  once?: boolean;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.08,
  once = true,
  className,
  ...props
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, margin: "-40px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.03,
          },
        },
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) {
  return (
    <motion.div variants={staggerItemVariants} className={className} {...props}>
      {children}
    </motion.div>
  );
}

export function ScaleHover({
  children,
  scale = 1.02,
  className,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode; scale?: number }) {
  return (
    <motion.div
      whileHover={{ scale, y: -3 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.28, ease: EASE_ARTISAN }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}
