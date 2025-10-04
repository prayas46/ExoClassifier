import { motion } from "framer-motion";
import ScrollExpandMedia from "@/components/ui/scroll-expand-media";

const ExoplanetExplanation = () => {
  return (
    <ScrollExpandMedia
      mediaType="video"
      mediaSrc="https://www.youtube.com/embed/EUU0-ZpFoK4?si=vLLk-r78JtRPqUMT&controls=0"
      bgImageSrc="https://images.unsplash.com/photo-1446776857632-70e0d1c5a7d3?q=80&w=2070&auto=format&fit=crop"
      title="How Exoplanets Work"
      scrollToExpand="Scroll to explore the science"
      textBlend={false}
    >
      <div className="space-y-12 max-w-4xl mx-auto text-white">
        {/* Detection Methods */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-3xl md:text-4xl font-light mb-4 text-primary">
            Detection Methods
          </h3>
          <p className="text-base text-white/70 leading-relaxed">
            Exoplanets orbit stars outside our solar system. The transit method detects them when they pass in front of their star, causing a measurable dip in brightness.
          </p>
        </motion.div>

        {/* Transit Method */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 items-center"
        >
          <div>
            <h4 className="text-2xl font-light mb-3 text-primary">Transit Photometry</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              NASA's missions monitor thousands of stars, detecting periodic dimming from planetary transits. Over 5,000 exoplanets discovered.
            </p>
          </div>
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">95%+</div>
              <div className="text-xs text-white/60 mt-1">Detection Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Data Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6 items-center"
        >
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/20 order-2 md:order-1">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">5,000+</div>
              <div className="text-xs text-white/60 mt-1">Confirmed Exoplanets</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h4 className="text-2xl font-light mb-3 text-primary">AI Classification</h4>
            <p className="text-white/70 text-sm leading-relaxed">
              Machine learning algorithms analyze light curves to distinguish real planetary transits from false positives.
            </p>
          </div>
        </motion.div>

        {/* Habitability */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h4 className="text-2xl font-light mb-3 text-primary">Habitable Worlds</h4>
          <p className="text-white/70 text-sm leading-relaxed mb-6">
            Identifying planets in the habitable zone where liquid water could exist.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <h5 className="text-base font-medium text-primary mb-1">Earth-like Size</h5>
              <p className="text-white/60 text-xs">Similar radius to Earth</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <h5 className="text-base font-medium text-primary mb-1">Habitable Zone</h5>
              <p className="text-white/60 text-xs">Optimal distance for water</p>
            </div>
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
              <h5 className="text-base font-medium text-primary mb-1">Rocky Surface</h5>
              <p className="text-white/60 text-xs">Terrestrial composition</p>
            </div>
          </div>
        </motion.div>
      </div>
    </ScrollExpandMedia>
  );
};

export default ExoplanetExplanation;