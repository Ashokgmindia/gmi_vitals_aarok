import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart, Droplet, Wind, Thermometer } from "lucide-react";
import { VitalSignCard } from "@/components/vital-sign-card";
import { ECGWaveform } from "@/components/ecg-waveform";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EcgData } from "@shared/schema";

// Generate realistic ECG waveform data
const generateWaveform = (type: string, count: number = 200): number[] => {
  const data: number[] = [];
  
  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 4;
    let value = 0;
    
    switch (type) {
      case "pleth":
        value = Math.sin(t) * 0.6 + Math.random() * 0.1;
        break;
      case "spo2":
        value = Math.sin(t * 1.5) * 0.5 + Math.cos(t * 0.5) * 0.3 + Math.random() * 0.1;
        break;
      case "resp":
        value = Math.sin(t * 0.3) * 0.7 + Math.random() * 0.05;
        break;
      case "cvp":
        value = Math.sin(t * 2) * 0.4 + Math.sin(t * 0.8) * 0.2 + Math.random() * 0.1;
        break;
      case "ecg":
        const qrs = Math.abs(t % (Math.PI / 2)) < 0.1 ? Math.sin(t * 20) * 0.8 : 0;
        value = Math.sin(t) * 0.3 + qrs + Math.random() * 0.05;
        break;
      case "etco2":
        value = t % Math.PI < Math.PI / 2 ? 0.6 : 0.1 + Math.random() * 0.05;
        break;
      default:
        value = Math.sin(t) * 0.5;
    }
    
    data.push(value);
  }
  
  return data;
};

export default function DashboardPage() {
  const userId = localStorage.getItem("userId");
  const [waveforms, setWaveforms] = useState({
    pleth: generateWaveform("pleth"),
    spo2: generateWaveform("spo2"),
    resp: generateWaveform("resp"),
    cvp: generateWaveform("cvp"),
    ecg: generateWaveform("ecg"),
    etco2: generateWaveform("etco2"),
  });

  const { data: latestEcg, isLoading } = useQuery<EcgData>({
    queryKey: [`/api/ecg-data/latest/${userId}`],
    enabled: !!userId,
  });

  // Simulate real-time waveform updates
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveforms({
        pleth: generateWaveform("pleth"),
        spo2: generateWaveform("spo2"),
        resp: generateWaveform("resp"),
        cvp: generateWaveform("cvp"),
        ecg: generateWaveform("ecg"),
        etco2: generateWaveform("etco2"),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  const ecgData = latestEcg || {
    heartRate: 60,
    spo2: 98,
    systolicBP: 120,
    diastolicBP: 80,
    temperature: 37.7,
    respiratoryRate: 20,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Medical Dashboard</h1>
        <p className="text-muted-foreground">Real-time patient vital signs monitoring</p>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <VitalSignCard
          icon={Heart}
          label="Heart Rate"
          value={ecgData.heartRate}
          unit="BPM"
          color="cyan"
          trend="stable"
        />
        <VitalSignCard
          icon={Droplet}
          label="SpO2"
          value={ecgData.spo2}
          unit="%"
          color="cyan"
          trend="stable"
        />
        <VitalSignCard
          icon={Heart}
          label="Blood Pressure"
          value={`${ecgData.systolicBP}/${ecgData.diastolicBP}`}
          unit=""
          color="yellow"
          trend="stable"
        />
        <VitalSignCard
          icon={Thermometer}
          label="Temperature"
          value={ecgData.temperature}
          unit="°C"
          color="red"
          trend="stable"
        />
      </div>

      {/* ECG Waveforms Section */}
      <div id="ecg" className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">ECG Parameters</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ECGWaveform
            data={waveforms.pleth}
            color="cyan"
            label="PLETH"
            value={ecgData.spo2}
          />
          <ECGWaveform
            data={waveforms.spo2}
            color="cyan"
            label="SPO2"
            value={`${ecgData.heartRate}`}
          />
          <ECGWaveform
            data={waveforms.resp}
            color="yellow"
            label="RESP"
            value={ecgData.respiratoryRate || 20}
          />
          <ECGWaveform
            data={waveforms.cvp}
            color="red"
            label="CVP/ART"
            value={`${ecgData.systolicBP}/${ecgData.diastolicBP}`}
          />
        </div>

        {/* Main ECG Strip */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3 text-foreground">ECG-OXP</h3>
          <ECGWaveform
            data={waveforms.ecg}
            color="green"
            label="ECG"
            height={120}
          />
        </Card>

        {/* ETCO2 Strip */}
        <Card className="p-4 bg-card/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-3 text-foreground">ETCO2</h3>
          <ECGWaveform
            data={waveforms.etco2}
            color="yellow"
            label="ETCO2"
            value="28"
            height={100}
          />
        </Card>
      </div>
    </div>
  );
}
