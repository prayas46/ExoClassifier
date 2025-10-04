import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button-new";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import earthImage from "@/assets/earth-purple.png";

export default function Hero() {
  const [isUnmuted, setIsUnmuted] = useState(false);
<<<<<<< HEAD
  const [isPlaying, setIsPlaying] = useState(true);
=======
  
  const scrollToClassifier = () => {
    const element = document.getElementById('classifier');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

>>>>>>> 5f296824ce1d5bb02f9175f50ca353b159d1eb88
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
<<<<<<< HEAD
          <div className="flex justify-center mb-6">
            <span className="inline-block rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">
              K2 • KEPLER • TESS
            </span>
          </div>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Discover <span className="text-primary">Exoplanets</span>
=======
          <span className="mb-4 inline-block rounded-full border border-primary/30 px-4 py-1.5 text-xs font-medium text-primary uppercase tracking-wider">
            K2 • KEPLER • TESS
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-light leading-tight md:text-6xl lg:text-7xl">
            Discover <span className="text-primary font-normal">Exoplanets</span> with AI
>>>>>>> 5f296824ce1d5bb02f9175f50ca353b159d1eb88
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

<<<<<<< HEAD
          <ContainerScroll
            titleComponent={
              <>
                <h2 className="text-3xl md:text-5xl font-light text-primary pb-5 mb-5 px-6 py-4">
                  Exoplanet Discovery
                </h2>
              </>
            }
          >
            <div className="relative w-full h-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/EUU0-ZpFoK4?si=yDxdRLaJzqPmRldP&controls=0&autoplay=${isPlaying ? 1 : 0}&mute=${isUnmuted ? 0 : 1}&playsinline=1&rel=0&modestbranding=1&loop=1&enablejsapi=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full rounded-2xl"
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl pointer-events-none" />
              
              {/* Custom Video Controls */}
              <div className="absolute top-4 right-4 flex gap-2">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => setIsUnmuted(!isUnmuted)}
                  variant="ghost"
                  size="sm"
                  className="bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm"
                >
                  {isUnmuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
              </div>
              
              <div className="absolute bottom-4 left-4 right-4 pointer-events-none">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                  <span className="text-xs opacity-75">Exoplanet Analysis</span>
                </div>
              </div>
            </div>
          </ContainerScroll>
=======
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
>>>>>>> 5f296824ce1d5bb02f9175f50ca353b159d1eb88
        </motion.div>
      </div>
    </section>
  );
}
