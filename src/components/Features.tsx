import { motion } from "framer-motion";
import { Database, Brain, BarChart3, Telescope, Globe } from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";

const features = [
  {
    Icon: Database,
    name: "NASA Datasets",
    description: "Comprehensive K2, Kepler, and TESS datasets with thousands of exoplanet observations for training our AI models.",
    href: "https://exoplanetarchive.ipac.caltech.edu/docs/data.html",
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
  description:
    "Advanced machine learning algorithms trained on NASA data to classify celestial objects with 95%+ accuracy.",
  onClick: () => {
    const element = document.getElementById("classifier");
    const lenis: any = (window as any).lenis;
    if (lenis && element) lenis.scrollTo(element);
    else element?.scrollIntoView({ behavior: "smooth" });
  },
  cta: "Try Classifier",
  background: (
    <img
      src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1200&auto=format&fit=crop"
      alt="AI Brain"
      className="absolute inset-0 w-full h-full object-cover opacity-30 filter hue-rotate-30"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  ),
  className:
    "lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3 md:col-span-2",
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
      <div 
        className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600/30 via-blue-700/20 to-indigo-800/30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(120, 53, 255, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 53, 120, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 40% 40%, rgba(53, 120, 255, 0.2) 0%, transparent 50%)
          `
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
    href: "",
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
      className="py-24 px-4 relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(250 24% 5%) 0%, hsl(260 30% 8%) 100%)",
      }}
    >
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-light mb-3 text-white">
            Advanced <span className="text-primary">Technology</span>
          </h2>
          <p className="text-white/60 text-sm max-w-2xl mx-auto">
            Machine learning powered by NASA's comprehensive exoplanet datasets
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
