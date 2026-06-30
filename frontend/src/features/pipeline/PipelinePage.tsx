import { motion } from "framer-motion";
import { Clock, MoreHorizontal, Filter, Plus, Target, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Stage = "new" | "nurturing" | "contacted" | "proposal" | "negotiation" | "won" | "lost";
type Temp = "hot" | "warm" | "cold";

interface Lead {
  id: string;
  name: string;
  company: string;
  score: number;
  temp: Temp;
  stage: Stage;
  daysInStage: number;
  value: string;
}

const stageLabels: Record<Stage, string> = {
  new: "Nuevo Lead",
  nurturing: "Nutriendo",
  contacted: "Contactado",
  proposal: "Propuesta",
  negotiation: "Negociación",
  won: "Ganado",
  lost: "Perdido",
};

const stageColors: Record<Stage, string> = {
  new: "border-t-primary",
  nurturing: "border-t-sky-400",
  contacted: "border-t-amber-400",
  proposal: "border-t-orange-400",
  negotiation: "border-t-red-500",
  won: "border-t-emerald-500",
  lost: "border-t-muted-foreground",
};

const tempClasses: Record<Temp, string> = {
  hot: "bg-red-500/20 text-red-400 border-red-500/30",
  warm: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  cold: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const mockLeads: Lead[] = [
  { id: "1", name: "María García", company: "DataCorp", score: 87, temp: "hot", stage: "new", daysInStage: 1, value: "1.850€" },
  { id: "2", name: "Pedro Sánchez", company: "Medi360", score: 91, temp: "hot", stage: "contacted", daysInStage: 3, value: "12.000€" },
  { id: "3", name: "Carlos Ruiz", company: "AnalyticsPro", score: 62, temp: "warm", stage: "nurturing", daysInStage: 5, value: "3.200€" },
  { id: "4", name: "Ana López", company: "TechStart", score: 45, temp: "cold", stage: "nurturing", daysInStage: 12, value: "950€" },
  { id: "5", name: "Laura Martín", company: "GrowthLab", score: 78, temp: "hot", stage: "proposal", daysInStage: 2, value: "7.500€" },
  { id: "6", name: "Diego Fernández", company: "CloudBI", score: 55, temp: "warm", stage: "contacted", daysInStage: 8, value: "2.800€" },
  { id: "7", name: "Elena Ruiz", company: "DataFlow", score: 82, temp: "hot", stage: "negotiation", daysInStage: 4, value: "15.000€" },
  { id: "8", name: "Javier Torres", company: "MetricaIA", score: 70, temp: "warm", stage: "new", daysInStage: 0, value: "1.850€" },
  { id: "9", name: "Isabel Moreno", company: "InsightCo", score: 95, temp: "hot", stage: "won", daysInStage: 0, value: "33.600€" },
];

const visibleStages: Stage[] = ["new", "nurturing", "contacted", "proposal", "negotiation", "won"];

export default function PipelinePage() {
  const [leads] = useState(mockLeads);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Sales Pipeline</h1>
          <p className="text-muted-foreground text-sm mt-1">Gestión visual del embudo de conversión y autoridad</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="bg-card/50">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm" className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Lead
          </Button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-thin">
        {visibleStages.map((stage, colIdx) => {
          const stageLeads = leads.filter((l) => l.stage === stage);
          const stageTotal = stageLeads.reduce((acc, l) => acc + parseInt(l.value.replace(/\D/g, '')), 0);

          return (
            <motion.div
              key={stage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: colIdx * 0.06 }}
              className="min-w-[300px] w-[300px] shrink-0"
            >
              <div className={`rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm border-t-4 ${stageColors[stage]} flex flex-col h-full shadow-lg shadow-black/20`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                      {stageLabels[stage]}
                    </h3>
                    <p className="text-sm font-mono font-bold text-primary">
                      {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(stageTotal)}
                    </p>
                  </div>
                  <Badge variant="outline" className="bg-muted/50 border-border/50 text-[10px]">
                    {stageLeads.length}
                  </Badge>
                </div>

                <div className="p-3 space-y-3 min-h-[500px]">
                  {stageLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="rounded-xl bg-card border border-border/50 p-4 cursor-pointer hover:border-primary/50 transition-all group shadow-sm hover:shadow-primary/5"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-bold group-hover:text-primary transition-colors">{lead.name}</p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {lead.company}
                          </p>
                        </div>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-foreground">{lead.value}</span>
                          <Badge className={`text-[9px] font-bold px-2 py-0.5 border ${tempClasses[lead.temp]}`}>
                            {lead.temp.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="h-1 w-12 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${lead.score}%` }} />
                          </div>
                          <span className="text-[9px] font-mono text-muted-foreground">{lead.score}</span>
                        </div>
                      </div>

                      {lead.daysInStage > 7 && (
                        <div className="mt-3 flex items-center gap-1.5 text-[9px] text-red-400 font-bold uppercase tracking-wider">
                          <Clock className="h-3 w-3" />
                          {lead.daysInStage} días estancado
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-border/20 rounded-2xl flex flex-col items-center justify-center gap-2 text-muted-foreground/30">
                      <ChevronRight className="w-6 h-6 rotate-90" />
                      <span className="text-[10px] font-bold uppercase">Sin actividad</span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
