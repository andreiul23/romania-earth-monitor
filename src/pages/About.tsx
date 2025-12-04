import { Layout } from "@/components/layout/Layout";
import saferoLogo from "@/assets/safero-logo.png";
import { 
  Satellite, 
  Radio, 
  Cloud, 
  Waves, 
  Leaf, 
  Database, 
  Cpu,
  ExternalLink,
  Github,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";

const sensors = [
  {
    name: "Sentinel-1",
    type: "Synthetic Aperture Radar (SAR)",
    icon: Radio,
    color: "text-flood",
    description: "C-band SAR providing all-weather, day-and-night imaging capability. Ideal for flood detection as radar can penetrate clouds.",
    specs: [
      "Resolution: 5×20m to 25×100m",
      "Swath: 80km to 400km",
      "Revisit: 6 days (constellation)",
      "Polarization: VV, VH, HH, HV",
    ],
    useCases: ["Flood extent mapping", "Soil moisture estimation", "Ground deformation monitoring"],
  },
  {
    name: "Sentinel-2",
    type: "Multi-Spectral Instrument (MSI)",
    icon: Satellite,
    color: "text-vegetation",
    description: "13-band optical imagery optimized for land monitoring. Critical for vegetation indices and environmental assessment.",
    specs: [
      "Resolution: 10m, 20m, 60m bands",
      "Swath: 290km",
      "Revisit: 5 days (constellation)",
      "Bands: 13 spectral bands",
    ],
    useCases: ["NDVI vegetation health", "Crop monitoring", "Land use classification"],
  },
];

const algorithms = [
  {
    name: "NDVI Calculation",
    formula: "(NIR - Red) / (NIR + Red)",
    description: "Normalized Difference Vegetation Index measures vegetation health. Values range from -1 to +1, with healthy vegetation typically above 0.3.",
    source: "Sentinel-2 Bands 4 & 8",
  },
  {
    name: "SAR Flood Thresholding",
    formula: "Backscatter < Threshold → Water",
    description: "Water surfaces appear dark in SAR imagery due to specular reflection. Adaptive thresholding identifies flooded areas.",
    source: "Sentinel-1 VV/VH",
  },
  {
    name: "Hybrid Sensor Selection",
    formula: "Cloud Cover > 20% → Use Radar",
    description: "Automatic sensor switching based on atmospheric conditions. Ensures continuous monitoring regardless of weather.",
    source: "Metadata Analysis",
  },
];

const architecture = [
  {
    layer: "Frontend",
    tech: "React + TypeScript + Tailwind",
    icon: Cpu,
    description: "Modern web interface with interactive mapping for hazard visualization",
  },
  {
    layer: "Backend",
    tech: "Supabase Edge Functions",
    icon: Database,
    description: "Serverless functions connecting to GEE and NASA FIRMS APIs",
  },
  {
    layer: "Data Pipeline",
    tech: "GEE + NASA FIRMS",
    icon: Cloud,
    description: "Google Earth Engine for NDVI/flood analysis, FIRMS for fire detection",
  },
];

export function About() {
  return (
    <Layout>
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-16">
          <img src={saferoLogo} alt="safeRo Logo" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6 object-contain" />
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">About SAFE-RO</h1>
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            A dual-interface software platform designed to monitor natural hazards in Romania 
            using Earth Observation data from the Copernicus programme.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-10 sm:mb-16">
          <div className="glass-panel-elevated p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              SAFE-RO bridges the gap between raw satellite telemetry and local crisis management 
              by processing data from Google Earth Engine (Sentinel-2) and NASA FIRMS into actionable insights. 
              The platform aligns with national disaster risk reduction strategies by serving both 
              citizens (simplified alerts) and institutions (advanced analytics).
            </p>
          </div>
        </section>

        {/* Sensors */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Satellite className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Satellite Sensors
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            {sensors.map((sensor) => {
              const Icon = sensor.icon;
              return (
              <div key={sensor.name} className="glass-panel-elevated p-4 sm:p-6 space-y-3 sm:space-y-4 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${sensor.color}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-base sm:text-lg">{sensor.name}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">{sensor.type}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{sensor.description}</p>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Specifications</h4>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {sensor.specs.map((spec) => (
                        <li key={spec} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <h4 className="text-sm font-medium mb-2">Applications</h4>
                    <div className="flex flex-wrap gap-2">
                      {sensor.useCases.map((use) => (
                        <span
                          key={use}
                          className="px-2 py-1 text-xs bg-secondary rounded-md"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Algorithms */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Processing Algorithms
          </h2>
          <div className="space-y-4">
            {algorithms.map((algo) => (
              <div key={algo.name} className="glass-panel p-4 sm:p-6 transition-all duration-300 hover:border-primary/20">
                <div className="flex flex-col md:flex-row md:items-center gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base sm:text-lg mb-1">{algo.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{algo.description}</p>
                  </div>
                  <div className="md:text-right">
                    <code className="text-xs sm:text-sm font-mono text-primary bg-primary/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg inline-block">
                      {algo.formula}
                    </code>
                    <p className="text-xs text-muted-foreground mt-2">
                      Source: {algo.source}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            System Architecture
          </h2>
          <div className="glass-panel-elevated p-4 sm:p-6">
            <div className="space-y-4">
              {architecture.map((layer, index) => {
                const Icon = layer.icon;
                return (
                  <div
                    key={layer.layer}
                    className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{layer.layer}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <code className="text-xs font-mono text-primary">{layer.tech}</code>
                      </div>
                      <p className="text-sm text-muted-foreground">{layer.description}</p>
                    </div>
                    {index < architecture.length - 1 && (
                      <div className="hidden md:block w-px h-full bg-border absolute right-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Data Sources */}
        <section className="mb-10 sm:mb-16">
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Cloud className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Data Sources
          </h2>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="glass-panel p-4 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1">
              <h3 className="font-semibold text-sm sm:text-base mb-2">Google Earth Engine</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Cloud-based geospatial analysis platform providing access to Sentinel-2 imagery 
                for NDVI vegetation health analysis and flood detection algorithms.
              </p>
              <a
                href="https://earthengine.google.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  Visit GEE
                </Button>
              </a>
            </div>
            <div className="glass-panel p-4 sm:p-6 transition-all duration-300 hover:border-primary/30 hover:-translate-y-1">
              <h3 className="font-semibold text-sm sm:text-base mb-2">NASA FIRMS</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                Fire Information for Resource Management System provides real-time active fire 
                detection data from VIIRS and MODIS satellite sensors worldwide.
              </p>
              <a
                href="https://firms.modaps.eosdis.nasa.gov/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <Flame className="w-4 h-4" />
                  Visit FIRMS
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Source Code */}
        <section className="mb-10 sm:mb-16">
          <div className="glass-panel-elevated p-5 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Open Source</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-xl mx-auto px-2">
              SAFE-RO is open source. The Python backend contains the core processing logic 
              while this React frontend provides the modern web interface.
            </p>
            <a
              href="https://github.com/tiberiafarkas/SAFE-RO"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="hero" size="lg">
                <Github className="w-5 h-5" />
                View on GitHub
              </Button>
            </a>
          </div>
        </section>

        {/* Hazard Indicators Legend */}
        <section>
          <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
            <Waves className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            Hazard Indicators
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-4">
            <div className="glass-panel p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 hover:border-flood/50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-flood mx-auto mb-2 flex items-center justify-center">
                <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <h4 className="font-medium text-xs sm:text-sm">Flood Risk</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Water detection zones</p>
            </div>
            <div className="glass-panel p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 hover:border-danger/50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-fire mx-auto mb-2 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <h4 className="font-medium text-xs sm:text-sm">Fire Risk</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Thermal anomalies</p>
            </div>
            <div className="glass-panel p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 hover:border-vegetation/50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-vegetation mx-auto mb-2 flex items-center justify-center">
                <Leaf className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <h4 className="font-medium text-xs sm:text-sm">Vegetation</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">NDVI health index</p>
            </div>
            <div className="glass-panel p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 hover:border-alert/50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-alert mx-auto mb-2" />
              <h4 className="font-medium text-xs sm:text-sm">Warning</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">Moderate risk</p>
            </div>
            <div className="glass-panel p-3 sm:p-4 text-center transition-all duration-300 hover:scale-105 hover:border-danger/50">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-danger mx-auto mb-2" />
              <h4 className="font-medium text-xs sm:text-sm">Critical</h4>
              <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">High priority</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default About;
