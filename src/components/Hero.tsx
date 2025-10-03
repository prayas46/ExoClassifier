import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import earthImage from "@/assets/earth-purple.png";

export default function Hero() {
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
            NASA DATASETS • MACHINE LEARNING • K2 • KEPLER • TESS
          </span>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
            Discover Exoplanets with{" "}
            <span className="text-primary">AI-Powered</span> Classification
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-foreground/60 md:text-xl">
            Advanced machine learning algorithms analyze NASA's K2, Kepler, and TESS datasets 
            to classify celestial objects as Confirmed Exoplanets, Planet Candidates, or False Positives.
          </p>

          <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="neumorphic-button relative w-full overflow-hidden rounded-full border border-foreground/10 bg-gradient-to-b from-foreground/10 to-foreground/5 px-8 py-6 text-foreground shadow-lg transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_20px_rgba(155,135,245,0.5)] sm:w-auto"
            >
              Explore Classifier
            </Button>
            <button
              onClick={() => {
                const element = document.getElementById('features');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex w-full items-center justify-center gap-2 text-foreground/70 transition-colors hover:text-foreground sm:w-auto"
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
            </button>
          </div>
        </motion.div>
        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <div className="w-full flex h-40 md:h-64 relative overflow-hidden">
            <img
              src={earthImage}
              alt="Earth"
              className="absolute px-4 top-0 left-1/2 -translate-x-1/2 mx-auto -z-10 opacity-80 w-auto h-full object-contain"
            />
          </div>
          <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-lg cosmic-glow">
            <div className="aspect-video w-full rounded-lg border border-foreground/10 bg-gradient-to-br from-card to-background p-8">
              <div className="grid grid-cols-3 gap-4 h-full">
                <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20 flex flex-col items-center justify-center">
                  <div className="text-3xl md:text-5xl font-light text-primary mb-2">K2</div>
                  <div className="text-xs text-foreground/60">Dataset</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20 flex flex-col items-center justify-center">
                  <div className="text-3xl md:text-5xl font-light text-primary mb-2">Kepler</div>
                  <div className="text-xs text-foreground/60">Dataset</div>
                </div>
                <div className="rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 p-4 border border-primary/20 flex flex-col items-center justify-center">
                  <div className="text-3xl md:text-5xl font-light text-primary mb-2">TESS</div>
                  <div className="text-xs text-foreground/60">Dataset</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
