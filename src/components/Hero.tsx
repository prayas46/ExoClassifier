import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button-new";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import earthImage from "@/assets/earth-purple.png";

export default function Hero() {
  const [isUnmuted, setIsUnmuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  
  const scrollToClassifier = () => {
    const element = document.getElementById('classifier');
    const lenis: any = (window as any).lenis;
    if (lenis && element) lenis.scrollTo(element);
    else element?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    const lenis: any = (window as any).lenis;
    if (lenis && element) lenis.scrollTo(element);
    else element?.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <section
      className="relative w-full overflow-hidden pb-10 pt-32 md:pb-16 md:pt-20"
      style={{
        background: "linear-gradient(135deg, hsl(250 24% 5%) 0%, hsl(260 30% 10%) 100%)",
      }}
    >
      <div
        className="absolute right-0 top-0 h-1/2 w-1/2"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />
      <div
        className="absolute left-0 top-0 h-1/2 w-1/2 -scale-x-100"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.15) 0%, rgba(13, 10, 25, 0) 60%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-2xl px-4 text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex justify-center mb-6">
            <span className="inline-block rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">
              K2 • KEPLER • TESS
            </span>
          </div>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Discover <span className="text-primary">Exoplanets</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/60 md:text-xl">
            AI-powered classification of NASA's exoplanet datasets.
          </p>

          <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0 w-[30%] mx-auto">
            <Button 
              onClick={scrollToClassifier}
              variant="solid" 
              size="default" 
              className="w-full sm:w-auto my-1 whitespace-nowrap"
            >
              Explore Classifier
            </Button>
            <Button
              onClick={scrollToFeatures}
              variant="ghost"
              size="default"
              className="w-full sm:w-auto flex items-center justify-center gap-2 my-1 whitespace-nowrap"
            >
              <span>View Datasets</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6 9 6 6 6-6"></path>
              </svg>
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div
            className="w-full flex relative overflow-hidden h-48 md:h-80 lg:h-[420px]"
          >
            <img
              src={earthImage}
              alt="Earth"
              className="absolute top-0 left-0 -z-10 w-full h-full object-cover object-top opacity-90 select-none pointer-events-none"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 65%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, black 65%, transparent 100%)",
              }}
            />
          </div>

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
        </motion.div>
      </div>
    </section>
  );
}
