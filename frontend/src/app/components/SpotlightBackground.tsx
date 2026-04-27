import React, { ReactNode, useState, useEffect } from "react";

interface SpotlightBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function SpotlightBackground({ children, className = "" }: SpotlightBackgroundProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      setPosition({
        x: e.clientX,
        y: e.clientY
      });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Fixed background spotlight effect that follows cursor */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isVisible ? 1 : 0,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(99, 102, 241, 0.1), transparent 50%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
