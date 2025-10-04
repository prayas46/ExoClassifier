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
      <div className="space-y-16 max-w-4xl mx-auto text-white">
        {/* Detection Methods */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-3xl md:text-4xl font-light mb-6 text-primary">
            Detection Methods
          </h3>
          <p className="text-lg text-white/80 leading-relaxed">
            Exoplanets are planets that orbit stars outside our solar system. We detect them using several sophisticated methods, 
            with the transit method being the most successful. When a planet passes in front of its star, it causes a tiny but 
            measurable dip in the star's brightness.
          </p>
        </motion.div>

        {/* Transit Method */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div>
            <h4 className="text-2xl font-light mb-4 text-primary">Transit Photometry</h4>
            <p className="text-white/80 leading-relaxed">
              NASA's Kepler, K2, and TESS missions monitor thousands of stars simultaneously, 
              looking for the periodic dimming that indicates a planet crossing in front of its star. 
              This method has discovered over 5,000 confirmed exoplanets.
            </p>
          </div>
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/20">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">95%+</div>
              <div className="text-sm text-white/60">Detection Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Data Analysis */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-8 items-center"
        >
          <div className="bg-primary/10 rounded-xl p-6 border border-primary/20 order-2 md:order-1">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">5,000+</div>
              <div className="text-sm text-white/60">Confirmed Exoplanets</div>
            </div>
          </div>
          <div className="order-1 md:order-2">
            <h4 className="text-2xl font-light mb-4 text-primary">AI-Powered Classification</h4>
            <p className="text-white/80 leading-relaxed">
              Our machine learning algorithms analyze light curves from NASA missions to automatically 
              classify potential exoplanet signals. The AI can distinguish between real planetary transits 
              and false positives caused by stellar activity or instrumental noise.
            </p>
          </div>
        </motion.div>

        {/* Habitability */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h4 className="text-2xl font-light mb-4 text-primary">The Search for Habitable Worlds</h4>
          <p className="text-white/80 leading-relaxed mb-8">
            By studying exoplanets, we're not just cataloging distant worlds – we're searching for planets 
            that might harbor life. Our classification system helps identify planets in the "habitable zone" 
            where liquid water could exist on the surface.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h5 className="text-lg font-semibold text-primary mb-2">Earth-like Size</h5>
              <p className="text-white/70 text-sm">Planets with similar radius to Earth</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h5 className="text-lg font-semibold text-primary mb-2">Habitable Zone</h5>
              <p className="text-white/70 text-sm">Right distance for liquid water</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-6 border border-primary/10">
              <h5 className="text-lg font-semibold text-primary mb-2">Rocky Composition</h5>
              <p className="text-white/70 text-sm">Solid surface like terrestrial planets</p>
            </div>
          </div>
        </motion.div>
      </div>
    </ScrollExpandMedia>
  );
};

export default ExoplanetExplanation;