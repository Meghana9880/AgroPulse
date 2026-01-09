import React from 'react';
import { Loader2, Layers, Leaf, Lightbulb } from 'lucide-react';

interface SoilData {
  soilType: string;
  characteristics: string[];
  suitableCrops: string[];
  tips: string;
}

interface SoilInfoCardProps {
  soilData: SoilData | null;
  isLoading: boolean;
  error: string | null;
}

const SoilInfoCard: React.FC<SoilInfoCardProps> = ({ soilData, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-secondary/50 border border-border rounded-xl p-4 mt-4 animate-pulse">
        <div className="flex items-center gap-3">
          <Loader2 className="animate-spin text-primary" size={20} />
          <span className="text-sm text-muted-foreground">Analyzing soil type based on your location...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 mt-4">
        <p className="text-sm text-danger">{error}</p>
      </div>
    );
  }

  if (!soilData) return null;

  return (
    <div className="bg-gradient-to-br from-primary/5 to-secondary border border-primary/20 rounded-xl p-4 mt-4 animate-fade-in">
      {/* Soil Type Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Layers className="text-primary" size={20} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Detected Soil Type</p>
          <h3 className="text-lg font-bold text-foreground">{soilData.soilType}</h3>
        </div>
      </div>

      {/* Characteristics */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
          Soil Characteristics
        </h4>
        <ul className="space-y-1.5">
          {soilData.characteristics.map((char, idx) => (
            <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              {char}
            </li>
          ))}
        </ul>
      </div>

      {/* Suitable Crops */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Leaf size={14} className="text-success" />
          Crops Suitable for This Soil
        </h4>
        <div className="flex flex-wrap gap-2">
          {soilData.suitableCrops.map((crop, idx) => (
            <span 
              key={idx} 
              className="px-3 py-1 bg-success/10 text-success border border-success/30 rounded-full text-xs font-medium"
            >
              {crop}
            </span>
          ))}
        </div>
      </div>

      {/* Farming Tip */}
      <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Lightbulb size={16} className="text-warning mt-0.5 shrink-0" />
          <p className="text-sm text-foreground">{soilData.tips}</p>
        </div>
      </div>
    </div>
  );
};

export default SoilInfoCard;
