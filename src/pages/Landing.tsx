import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import saferoLogo from "@/assets/safero-logo.png";
import { 
  Flame, 
  Shield, 
  Waves, 
  Leaf, 
  ArrowRight, 
  Radio, 
  Radar,
  MapPin,
  Clock
} from "lucide-react";

const features = [
  {
    icon: Flame,
    title: "Fire Detection",
    description: "Thermal anomaly detection identifies active wildfires and burn scars using multi-spectral satellite imagery.",
    color: "text-fire",
  },
  {
    icon: Waves,
    title: "Flood Detection",
    description: "SAR intensity thresholding algorithms detect flood extent with high accuracy, even through cloud cover.",
    color: "text-flood",
  },
  {
    icon: Leaf,
    title: "Vegetation Health",
    description: "NDVI calculation reveals vegetation stress, drought impact, and agricultural conditions across regions.",
    color: "text-vegetation",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description: "Automated hazard classification and alert generation for emergency response coordination.",
    color: "text-alert",
  },
];

const regions = [
  "Făgăraș Mountains",
  "Iași County",
  "Timișoara",
  "Craiova",
  "Constanța Coast",
  "Baia Mare",
  "București",
  "Cluj-Napoca",
];

const stats = [
  { value: "8", label: "Regions Monitored" },
  { value: "2", label: "Satellite Sensors" },
  { value: "24/7", label: "Continuous Coverage" },
  { value: "<20%", label: "Cloud Threshold" },
];

export function Landing() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden px-2">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 sm:w-96 h-64 sm:h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {/* Logo and Badge */}
            <div className="flex flex-col items-center gap-4 sm:gap-6 animate-fade-in-up">
              <img 
                src={saferoLogo} 
                alt="safeRo Logo" 
                className="w-28 h-28 sm:w-40 sm:h-40 md:w-52 md:h-52 object-contain animate-float drop-shadow-2xl" 
              />
              <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 border border-primary/20">
                <Radio className="w-3 h-3 sm:w-4 sm:h-4 text-primary animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-primary">
                  National Satellite Monitoring
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-3 sm:space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tight">
                <span className="text-foreground">safeRo</span>
                <br />
                <span className="gradient-text">Hazard Monitoring</span>
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance px-2">
                Real-time satellite-based natural hazard detection for Romania using 
                Sentinel-1 &amp; Sentinel-2 Earth observation data.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up px-4" style={{ animationDelay: "0.2s" }}>
              <Link to="/public" className="w-full sm:w-auto">
                <Button variant="hero" size="lg" className="group w-full sm:w-auto">
                  Check Hazard Status
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="glass" size="lg" className="w-full sm:w-auto">
                  Institutional Access
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-6 sm:pt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass-panel p-3 sm:p-4 text-center"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="text-lg sm:text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
            <div className="w-1.5 h-3 bg-muted-foreground/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 relative">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Advanced Earth Observation
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-2">
              Leveraging the Copernicus programme's Sentinel constellation for continuous, 
              weather-independent monitoring of natural hazards.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-panel-elevated p-4 sm:p-6 group hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-base sm:text-lg mb-2">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="py-16 sm:py-24 relative bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                <span className="text-xs sm:text-sm font-medium text-primary">Regional Coverage</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
                Monitoring Romania's
                <br />
                <span className="gradient-text">Critical Regions</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Pre-configured bounding boxes for major Romanian regions enable rapid 
                deployment and analysis. The system automatically switches between 
                optical and radar imagery based on real-time cloud cover assessment.
              </p>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2 sm:pt-4">
                {regions.map((region) => (
                  <div
                    key={region}
                    className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-accent" />
                    <span className="text-xs sm:text-sm truncate">{region}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Preview */}
            <div className="glass-panel-elevated p-4 aspect-square lg:aspect-auto lg:h-[500px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="absolute inset-4 border-2 border-dashed border-primary/20 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Radar className="w-16 h-16 text-primary/40 mx-auto mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Interactive map available in dashboard</p>
                  <Link to="/dashboard" className="mt-4 inline-block">
                    <Button variant="outline" size="sm">
                      View Live Map
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="glass-panel-elevated p-5 sm:p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10 space-y-5 sm:space-y-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                <span className="text-xs sm:text-sm font-medium text-accent">Real-Time Monitoring</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed">
                Ready to Monitor Hazards?
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground sm:text-lg leading-relaxed px-2">
                Access the dashboard to start monitoring satellite imagery, analyze vegetation health, 
                and detect flood risks across Romanian regions.
              </p>
              <Link to="/dashboard">
                <Button variant="hero" size="lg" className="group">
                  Launch Dashboard
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-border">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <img src={saferoLogo} alt="safeRo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              <span className="text-xs sm:text-sm text-muted-foreground">
                safeRo Platform • Disaster risk reduction
              </span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
              Data: Copernicus Sentinel
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

export default Landing;
