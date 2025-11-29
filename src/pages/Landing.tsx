import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { SafeRoLogo } from "@/components/icons/SafeRoLogo";
import { 
  Satellite, 
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
    icon: Satellite,
    title: "Dual-Satellite Integration",
    description: "Combines Sentinel-1 (Radar) and Sentinel-2 (Optical) data for comprehensive monitoring regardless of weather conditions.",
    color: "text-primary",
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Logo and Badge */}
            <div className="flex flex-col items-center gap-4 animate-fade-in-up">
              <SafeRoLogo size="xl" className="animate-float" />
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                <Radio className="w-4 h-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">
                  National Satellite Monitoring Platform
                </span>
              </div>
            </div>

            {/* Main Heading */}
            <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                <span className="text-foreground">SAFE-RO</span>
                <br />
                <span className="gradient-text">Hazard Monitoring</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto text-balance">
                Real-time satellite-based natural hazard detection for Romania using 
                Sentinel-1 &amp; Sentinel-2 Earth observation data.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Link to="/public">
                <Button variant="hero" size="xl" className="group">
                  Check Hazard Status
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="glass" size="xl">
                  Institutional Access
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className="glass-panel p-4 text-center"
                  style={{ animationDelay: `${0.4 + index * 0.1}s` }}
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
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
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Advanced Earth Observation
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Leveraging the Copernicus programme's Sentinel constellation for continuous, 
              weather-independent monitoring of natural hazards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass-panel-elevated p-6 group hover:border-primary/30 transition-all duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Coverage Section */}
      <section className="py-24 relative bg-gradient-to-b from-background to-card/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Regional Coverage</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Monitoring Romania's
                <br />
                <span className="gradient-text">Critical Regions</span>
              </h2>
              <p className="text-muted-foreground">
                Pre-configured bounding boxes for major Romanian regions enable rapid 
                deployment and analysis. The system automatically switches between 
                optical and radar imagery based on real-time cloud cover assessment.
              </p>
              
              <div className="grid grid-cols-2 gap-3 pt-4">
                {regions.map((region) => (
                  <div
                    key={region}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="w-2 h-2 rounded-full bg-accent" />
                    <span className="text-sm">{region}</span>
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
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass-panel-elevated p-8 md:p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
            <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-accent">Real-Time Monitoring</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Monitor Hazards?
              </h2>
              <p className="text-muted-foreground">
                Access the dashboard to start monitoring satellite imagery, analyze vegetation health, 
                and detect flood risks across Romanian regions.
              </p>
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="group">
                  Launch Dashboard
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <SafeRoLogo size="sm" />
              <span className="text-sm text-muted-foreground">
                SAFE-RO Platform • Built for disaster risk reduction
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Data: Copernicus Sentinel • Storage: Google Drive
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
}

export default Landing;
