import { motion } from "framer-motion";
import { Telescope, Database, Brain, BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    icon: Database,
    title: "NASA Datasets",
    description: "Combined K2, Kepler, and TESS exoplanet datasets for comprehensive analysis",
  },
  {
    icon: Brain,
    title: "RandomForest ML",
    description: "Advanced machine learning classifier trained on thousands of celestial observations",
  },
  {
    icon: BarChart3,
    title: "High Accuracy",
    description: "Precise classification into Confirmed Exoplanets, Candidates, or False Positives",
  },
  {
    icon: Telescope,
    title: "Real-time Analysis",
    description: "Instant classification results with detailed probability scores and insights",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-light mb-4">
            Powered by <span className="text-primary">Advanced Technology</span>
          </h2>
          <p className="text-foreground/60 max-w-2xl mx-auto">
            Our platform combines cutting-edge machine learning with NASA's most comprehensive exoplanet datasets
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="p-6 bg-card border-primary/20 hover:border-primary/40 transition-all duration-300 hover:cosmic-glow h-full">
                <feature.icon className="w-10 h-10 text-primary mb-4" strokeWidth={1} />
                <h3 className="text-xl font-light mb-2">{feature.title}</h3>
                <p className="text-foreground/60 text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
