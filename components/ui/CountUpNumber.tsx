'use client';

import { useEffect, useRef } from 'react';
import { useSpring, useTransform, motion, MotionValue } from 'framer-motion';

interface CountUpNumberProps {
  value: number;
  decimals?: number;
  className?: string;
  suffix?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  instant?: boolean;
}

/**
 * Animated number that counts up from 0 to target value
 * Uses spring physics for smooth, natural animation
 */
export function CountUpNumber({
  value,
  decimals = 0,
  className = '',
  suffix = '',
  style,
  onComplete,
  instant = false,
}: CountUpNumberProps) {
  const spring = useSpring(0, {
    stiffness: 80,
    damping: 24,
    mass: 1,
  });

  // Transform the spring value to a formatted string
  const display = useTransform(spring, (latest) => {
    const num = decimals > 0 ? latest.toFixed(decimals) : Math.round(latest);
    return Number(num).toLocaleString();
  });

  useEffect(() => {
    let called = false;
    const threshold = Math.max(0.0001, 1 / Math.pow(10, decimals + 2));

    const unsubscribe = spring.on('change', (latest) => {
      if (!called && Math.abs(latest - value) <= threshold) {
        called = true;
        onComplete?.();
      }
    });

    if (instant) {
      spring.set(value);
      called = true;
      onComplete?.();
    } else {
      spring.set(value);
    }

    return () => {
      called = true;
      unsubscribe();
    };
  }, [spring, value, decimals, onComplete, instant]);

  if (instant) {
    const num = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
    const finalDisplay = Number(num).toLocaleString();
    return (
      <span className={className} style={style}>
        {finalDisplay}
        {suffix}
      </span>
    );
  }

  return (
    <motion.span className={className} style={style}>
      <AnimatedText value={display} suffix={suffix} />
    </motion.span>
  );
}

/**
 * Helper component to handle the text display
 * Needed because useTransform returns a MotionValue
 */
function AnimatedText({
  value,
  suffix,
}: {
  value: MotionValue<string>;
  suffix: string;
}) {
  const textRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const unsubscribe = value.on('change', (latest) => {
      if (textRef.current) {
        textRef.current.textContent = latest + suffix;
      }
    });

    return unsubscribe;
  }, [value, suffix]);

  return <span ref={textRef}>0{suffix}</span>;
}
