import { motion } from "framer-motion";
import { Database, Brain, BarChart3, Telescope, Globe } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: Database,
    name: "NASA Datasets",
    description: "Comprehensive K2, Kepler, and TESS datasets with thousands of exoplanet observations for training our AI models.",
    href: "/datasets",
    cta: "Explore Data",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1502134249126-9f3755a50d78?q=80&w=1200&auto=format&fit=crop" 
        alt="Space data" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 filter hue-rotate-30" 
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    ),
    className: "lg:row-start-1 lg:row-end-4 lg:col-start-2 lg:col-end-3 md:col-span-2",
  },
  {
    Icon: Brain,
    name: "AI Classification",
    description: "Advanced machine learning algorithms trained on NASA data to classify celestial objects with 95%+ accuracy.",
    href: "/classifier",
    cta: "Try Classifier",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200&auto=format&fit=crop" 
        alt="AI Brain" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 filter hue-rotate-30" 
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3 md:col-span-2",
  },
  {
    Icon: Telescope,
    name: "Real-time Analysis",
    description: "Instant classification results with probability scores.",
    href: "",
    cta: "",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1446776877081-d282a0f896e2?q=80&w=1200&auto=format&fit=crop" 
        alt="Telescope" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 filter hue-rotate-30" 
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    ),
    className: "lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4 md:col-span-2",
    noHover: true,
  },
  {
    Icon: BarChart3,
    name: "Scientific Accuracy",
    description: "Precise classification into Confirmed Exoplanets.",
    href: "",
    cta: "",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?q=80&w=1200&auto=format&fit=crop" 
        alt="Data visualization" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 filter hue-rotate-30" 
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-1 lg:row-end-2 md:col-span-2",
    noHover: true,
  },
  {
    Icon: Globe,
    name: "Global Research",
    description: "Supporting international exoplanet research with open-source tools and collaborative datasets.",
    href: "/research",
    cta: "Join Research",
    background: (
      <img 
        src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=1200&auto=format&fit=crop" 
        alt="Earth from space" 
        className="absolute inset-0 w-full h-full object-cover opacity-30 filter hue-rotate-30" 
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    ),
    className: "lg:col-start-3 lg:col-end-3 lg:row-start-2 lg:row-end-4 md:col-span-2",
  },
];

export default function Features() {
  return (
    <section 
      id="features" 
      className="py-20 px-4 relative overflow-hidden -mt-20"
      style={{
        background: "linear-gradient(135deg, hsl(250 24% 5%) 0%, hsl(260 30% 10%) 100%)",
      }}
    >
      {/* Background Effects */}
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
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-light mb-4 text-white">
            Powered by <span className="text-primary">Advanced Technology</span>
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Our platform combines cutting-edge machine learning with NASA's most comprehensive exoplanet datasets
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <BentoGrid className="lg:grid-rows-3">
            {features.map((feature) => (
              <BentoCard key={feature.name} {...feature} />
            ))}
          </BentoGrid>
        </motion.div>
      </div>
    </section>
  );
}
