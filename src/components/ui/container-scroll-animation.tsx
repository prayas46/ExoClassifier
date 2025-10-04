"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, type MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.3, 0.9] : [0.4, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 0.3], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 0.3], [20, -80]);
  const titleTranslate = useTransform(scrollYProgress, [0, 0.3], [50, -150]);
  
  // Updated timeline with final position reached at 30%
  const cardOpacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0, 1, 1, 0.8]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.15, 0.4, 0.6], [0, 1, 1, 0]);
  
  // Gradient overlay fading during peak visibility (35-50%)
  const overlayOpacity = useTransform(scrollYProgress, [0, 0, 0], [1, 1, 0]);
  
  // Blur effect for smooth entry with extended duration
  const blur = useTransform(scale, isMobile ? [0.3, 0.9] : [0.4, 1], [8, 0]);

  return (
    <div
      className="h-[60rem] md:h-[80rem] flex items-center justify-center relative p-2 md:p-4 overflow-hidden"
      ref={containerRef}
    >
      {/* Gradient overlay for smooth blending */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-10 w-screen h-screen"
        style={{ 
          opacity: overlayOpacity,
          background: "linear-gradient(to bottom, hsl(250 24% 5%) 0%, hsl(250 24% 5%) 20%, rgba(68, 5, 158, 0.8) 40%, rgba(107, 33, 168, 0.7) 55%, rgba(147, 51, 234, 0.6) 70%, rgba(168, 85, 247, 0.4) 80%, rgba(196, 129, 255, 0.2) 90%, transparent 100%)"
        }}
      />
      <div
        className="py-2 md:py-4 w-full relative"
        style={{
          perspective: "1000px",
        }}
      >
        <div className="relative z-40 mb-8">
          <Header 
            translate={titleTranslate} 
            titleComponent={titleComponent}
            opacity={headerOpacity}
          />
        </div>
        <div className="relative z-50">
          <Card 
            rotate={rotate} 
            translate={translate} 
            scale={scale}
            opacity={cardOpacity}
            blur={blur}
          >
            {children}
          </Card>
        </div>
        
        {/* Small Exoplanet Description */}
        <motion.div
          className="mt-16 max-w-4xl mx-auto text-center px-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="space-y-6 text-white">
            <h3 className="text-2xl md:text-3xl font-light text-primary">What Are Exoplanets?</h3>
            <p className="text-lg text-white/80 leading-relaxed max-w-3xl mx-auto">
              Exoplanets are planets that orbit stars beyond our solar system. Scientists detect them using methods like the transit technique, where a planet causes its star to dim slightly as it passes in front. With thousands confirmed and potentially billions more in our galaxy, these distant worlds help us understand planetary formation and the possibility of life elsewhere in the universe.
            </p>
            
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const Header = ({ translate, titleComponent, opacity }: any) => {
  return (
    <motion.div
      style={{
        translateY: translate,
        opacity,
      }}
      className="div max-w-7xl mx-auto text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  translate,
  opacity,
  blur,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  opacity?: MotionValue<number>;
  blur?: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        translateY: translate,
        opacity,
        filter: blur ? useTransform(blur, (b) => `blur(${b}px)`) : undefined,
        boxShadow:
          "0 0 0 1px rgba(155, 135, 245, 0.1), 0 4px 20px rgba(0, 0, 0, 0.8), 0 16px 40px rgba(0, 0, 0, 0.6), 0 32px 60px rgba(0, 0, 0, 0.4), 0 48px 80px rgba(13, 10, 25, 0.3)",
        transformOrigin: "center center",
        transformStyle: "preserve-3d",
      }}
      className="max-w-5xl -mt-16 mx-auto w-full aspect-video border border-primary/20 bg-gradient-to-br from-card/80 to-background/80 rounded-[30px] shadow-2xl overflow-hidden relative"
    >
      <div className="absolute inset-0 h-full w-full transform-gpu">{children}</div>
    </motion.div>
  );
};
