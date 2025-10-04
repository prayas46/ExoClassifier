import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button-new";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import earthImage from "@/assets/earth-purple.png";

export default function Hero() {
  const [isUnmuted, setIsUnmuted] = useState(false);
  
  const scrollToClassifier = () => {
    const element = document.getElementById('classifier');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      className="relative w-full overflow-hidden pb-16 pt-24 md:pt-32"
      style={{
        background: "linear-gradient(135deg, hsl(250 24% 5%) 0%, hsl(260 30% 10%) 100%)",
      }}
    >
      {/* Background glow effects */}
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 text-center md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-12"
        >
          <span className="mb-4 inline-block rounded-full border border-primary/30 px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-wider">
            K2 • KEPLER • TESS
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-light leading-tight md:text-6xl lg:text-7xl">
            Discover <span className="text-primary font-normal">Exoplanets</span> with AI
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-foreground/70 md:text-xl">
            AI-powered classification of NASA's exoplanet datasets. Analyze planets beyond our solar system.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button 
              onClick={scrollToClassifier}
              variant="default" 
              size="lg" 
              className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all"
            >
              Explore Classifier
            </Button>
            <Button
              onClick={scrollToFeatures}
              variant="ghost"
              size="lg"
              className="rounded-full px-8"
            >
              Learn More
            </Button>
          </div>
        </motion.div>

        {/* 3D Planet */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] -mb-32 md:-mb-40"
        >
          <iframe 
            src='https://my.spline.design/glowingplanetparticles-eZDupH8QhJfdVHRHNGdj9vvA/' 
            frameBorder='0' 
            width='100%' 
            height='100%'
            className="pointer-events-none"
            title="3D Exoplanet Visualization"
            style={{
              transform: 'translateY(-10%)',
              WebkitMaskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
              maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
            }}
          />
          <style>{`
            iframe[src*="spline.design"] + div { display: none !important; }
          `}</style>
        </motion.div>
      </div>
    </section>
  );
}
