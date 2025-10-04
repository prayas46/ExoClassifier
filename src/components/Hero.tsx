import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button-new";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import earthImage from "@/assets/earth-purple.png";

export default function Hero() {
  const [isUnmuted, setIsUnmuted] = useState(false);
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
          <span className="mb-6 inline-block rounded-full border border-primary/30 px-3 py-1 text-xs text-primary">
            K2 • KEPLER • TESS
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Discover <span className="text-primary">Exoplanets</span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/60 md:text-xl">
            AI-powered classification of NASA's exoplanet datasets.
          </p>

          <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0 w-[30%] mx-auto">
            <Button 
              variant="solid" 
              size="default" 
              className="w-full sm:w-auto my-1 whitespace-nowrap"
            >
              Explore Classifier
            </Button>
            <Button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
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
            <iframe 
              src='https://my.spline.design/glowingplanetparticles-eZDupH8QhJfdVHRHNGdj9vvA/' 
              frameBorder='0' 
              width='100%' 
              height='100%'
              className="absolute top-0 left-0 -z-10 w-full h-full opacity-90 select-none pointer-events-none"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 60%, transparent 100%)",
                maskImage: "linear-gradient(to bottom, black 60%, transparent 100%)",
                transform: "translateY(-10%)",
              }}
            />
            <style dangerouslySetInnerHTML={{
              __html: `
                iframe[src*="spline.design"] {
                  position: relative;
                }
                iframe[src*="spline.design"]::after {
                  content: '';
                  position: absolute;
                  bottom: 0;
                  right: 0;
                  width: 200px;
                  height: 50px;
                  background: linear-gradient(135deg, hsl(250 24% 5%) 0%, hsl(260 30% 10%) 100%);
                  pointer-events: none;
                  z-index: 10;
                }
              `
            }} />
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
                src={`https://www.youtube.com/embed/44pt8w67S8I?si=HnIy3KuKLbfuY5lE&controls=0&autoplay=1&mute=${isUnmuted ? 0 : 1}&playsinline=1&rel=0&modestbranding=1&loop=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full rounded-2xl"
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-2xl" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3 text-white">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium">LIVE</span>
                  <span className="text-xs opacity-75">Exoplanet Analysis</span>
                </div>
              </div>
              {!isUnmuted && (
                <Button
                  onClick={() => setIsUnmuted(true)}
                  variant="ghost"
                  size="sm"
                  className="absolute top-4 right-4"
                >
                  Unmute
                </Button>
              )}
            </div>
          </ContainerScroll>
        </motion.div>
      </div>
    </section>
  );
}
