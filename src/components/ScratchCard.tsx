import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Compensation } from '../lib/supabase';

interface ScratchCardProps {
  compensation: Compensation;
  isScratched: boolean;
  isSelected: boolean;
  onScratch: () => void;
  onSelect: () => void;
  disabled?: boolean;
}

export function ScratchCard({
  compensation,
  isScratched,
  isSelected,
  onScratch,
  onSelect,
  disabled = false,
}: ScratchCardProps) {
  const [isRevealed, setIsRevealed] = useState(isScratched);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    setIsRevealed(isScratched);
  }, [isScratched]);

  const handleReveal = () => {
    if (!disabled && !isRevealed) {
      setIsRevealed(true);
      onScratch();
    }
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative w-full aspect-[3/4] rounded-lg overflow-hidden ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      }`}
      whileHover={!disabled ? { scale: 1.02 } : {}}
      onHoverStart={() => setIsHovering(true)}
      onHoverEnd={() => setIsHovering(false)}
      onClick={handleReveal}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br from-primary-100 to-secondary-100 p-4 flex flex-col justify-between ${
          isSelected ? 'ring-4 ring-primary-500' : ''
        }`}
      >
        {isRevealed ? (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-900">
                {compensation.title}
              </h3>
              <p className="text-sm text-gray-600">{compensation.description}</p>
            </div>
            {!disabled && !isSelected && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="btn-primary w-full"
              >
                Select
              </button>
            )}
            {isSelected && (
              <div className="text-center text-primary-600 font-medium">
                Selected ✓
              </div>
            )}
          </>
        ) : (
          <div className="h-full flex items-center justify-center">
            <motion.div
              animate={isHovering ? { scale: 1.1 } : { scale: 1 }}
              className="text-4xl"
            >
              🎁
            </motion.div>
          </div>
        )}
      </div>
      {!isRevealed && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-primary-500 to-secondary-500"
          initial={false}
          animate={isHovering ? { opacity: 0.8 } : { opacity: 1 }}
        >
          <div className="h-full flex items-center justify-center text-white text-lg font-medium">
            Scratch to reveal!
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 