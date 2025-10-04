import Hero from "@/components/Hero";
import ExoplanetExplanation from "@/components/ExoplanetExplanation";
import Features from "@/components/Features";
import Classifier from "@/components/Classifier";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <ExoplanetExplanation />
      <Features />
      <Classifier />
      <Footer />
    </div>
  );
};

export default Index;
