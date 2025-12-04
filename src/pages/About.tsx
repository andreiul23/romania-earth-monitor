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
    description: "Modern web interface with React-Leaflet for interactive mapping",
  },
  {
    layer: "Backend",
    tech: "FastAPI (Python)",
    icon: Database,
    description: "REST API exposing processing functions from SAFE-RO core modules",
  },
  {
    layer: "Data Pipeline",
    tech: "Copernicus + Google Drive",
    icon: Cloud,
    description: "Automated acquisition from CDSE with cloud storage caching",
  },
];

export function About() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <img src={saferoLogo} alt="safeRo Logo" className="w-32 h-32 mx-auto mb-6 object-contain" />
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About SAFE-RO</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A dual-interface software platform designed to monitor natural hazards in Romania 
            using Earth Observation data from the Copernicus programme.
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16">
          <div className="glass-panel-elevated p-8">
            <h2 className="text-2xl font-bold mb-4">Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              SAFE-RO bridges the gap between raw satellite telemetry and local crisis management 
              by processing Sentinel-1 (Radar) and Sentinel-2 (Optical) data into actionable insights. 
              The platform aligns with national disaster risk reduction strategies by serving both 
              citizens (simplified alerts) and institutions (advanced analytics).
            </p>
          </div>
        </section>

        {/* Sensors */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Satellite className="w-6 h-6 text-primary" />
            Satellite Sensors
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {sensors.map((sensor) => {
              const Icon = sensor.icon;
              return (
                <div key={sensor.name} className="glass-panel-elevated p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                      <Icon className={`w-6 h-6 ${sensor.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{sensor.name}</h3>
                      <p className="text-sm text-muted-foreground">{sensor.type}</p>
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
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" />
            Processing Algorithms
          </h2>
          <div className="space-y-4">
            {algorithms.map((algo) => (
              <div key={algo.name} className="glass-panel p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{algo.name}</h3>
                    <p className="text-sm text-muted-foreground">{algo.description}</p>
                  </div>
                  <div className="md:text-right">
                    <code className="text-sm font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
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
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            System Architecture
          </h2>
          <div className="glass-panel-elevated p-6">
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
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Cloud className="w-6 h-6 text-primary" />
            Data Sources
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h3 className="font-semibold mb-2">Copernicus Data Space Ecosystem</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Primary source for Sentinel satellite data. Provides free, open access to 
                European Space Agency's Earth observation archives.
              </p>
              <a
                href="https://dataspace.copernicus.eu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  <ExternalLink className="w-4 h-4" />
                  Visit CDSE
                </Button>
              </a>
            </div>
            <div className="glass-panel p-6">
              <h3 className="font-semibold mb-2">Google Drive Integration</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Cloud storage for processed imagery and cached data. Reduces local disk usage 
                and enables sharing between users.
              </p>
              <Button variant="outline" size="sm" disabled>
                <Cloud className="w-4 h-4" />
                OAuth Required
              </Button>
            </div>
          </div>
        </section>

        {/* Source Code */}
        <section className="mb-16">
          <div className="glass-panel-elevated p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Open Source</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
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
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Waves className="w-6 h-6 text-primary" />
            Hazard Indicators
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-panel p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-flood mx-auto mb-2 flex items-center justify-center">
                <Waves className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-medium text-sm">Flood Risk</h4>
              <p className="text-xs text-muted-foreground">Water detection zones</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-fire mx-auto mb-2 flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-medium text-sm">Fire Risk</h4>
              <p className="text-xs text-muted-foreground">Thermal anomalies</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-vegetation mx-auto mb-2 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-medium text-sm">Vegetation</h4>
              <p className="text-xs text-muted-foreground">NDVI health index</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-alert mx-auto mb-2" />
              <h4 className="font-medium text-sm">Warning</h4>
              <p className="text-xs text-muted-foreground">Moderate risk areas</p>
            </div>
            <div className="glass-panel p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-danger mx-auto mb-2" />
              <h4 className="font-medium text-sm">Critical</h4>
              <p className="text-xs text-muted-foreground">High priority alerts</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default About;
