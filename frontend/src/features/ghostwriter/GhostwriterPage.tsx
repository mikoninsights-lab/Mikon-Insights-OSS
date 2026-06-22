import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, FileText, ChevronDown, Sparkles, History, Send, BrainCircuit, Type, MessageSquareCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const topicAngles = ["Marketing Analytics", "People Analytics", "IA Aplicada", "Estrategia de Datos", "Caso de Éxito", "Liderazgo Técnico"];
const audiences = ["CMO / Director Marketing", "HR Director", "Founder / CEO", "Data Team Lead", "Inversores"];

const recentJobs = [
  { id: 1, title: "Nota de voz — ROI en marketing", status: "done", date: "Hace 2h", model: "Flash 2.5", type: 'audio' },
  { id: 2, title: "Artículo sobre People Analytics", status: "done", date: "Ayer", model: "Pro 1.5", type: 'text' },
  { id: 3, title: "Post LinkedIn — Data Strategy", status: "processing", date: "Ahora", model: "Flash 2.5", type: 'text' },
];

export default function GhostwriterPage() {
  const [inputType, setInputType] = useState<"audio" | "text">("audio");
  const [topicOpen, setTopicOpen] = useState(false);
  const [audienceOpen, setAudienceOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 flex gap-1 items-center">
              <Sparkles className="w-3 h-3" />
              Powered by Gemini
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Ghostwriter IA</h1>
          <p className="text-muted-foreground">Transforma ideas brutas en contenido de autoridad estratégica</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Generator Form */}
        <div className="lg:col-span-8">
          <Card className="tech-card border-primary/10 overflow-hidden bg-gradient-to-br from-card/50 to-primary/5">
            <CardHeader>
              <div className="flex p-1 bg-muted/30 rounded-xl border border-border/40 w-fit mb-4">
                <button
                  onClick={() => setInputType("audio")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputType === "audio" ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mic className="h-4 w-4" /> Audio
                </button>
                <button
                  onClick={() => setInputType("text")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputType === "text" ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Type className="h-4 w-4" /> Texto
                </button>
              </div>
              <CardTitle className="text-xl font-heading flex items-center gap-2">
                {inputType === "audio" ? <BrainCircuit className="w-5 h-5 text-primary" /> : <MessageSquareCode className="w-5 h-5 text-primary" />}
                Entrada de ideas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <AnimatePresence mode="wait">
                {inputType === "audio" ? (
                  <motion.div
                    key="audio"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="border-2 border-dashed border-primary/20 rounded-2xl p-12 text-center hover:border-primary/50 transition-all cursor-pointer group bg-primary/5"
                  >
                    <Upload className="h-10 w-10 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <p className="text-base font-medium text-foreground">Arrastra tu nota de voz</p>
                    <p className="text-sm text-muted-foreground mt-1">MP3, M4A — La IA transcribirá y estructurará tu mensaje</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <textarea
                      className="w-full h-40 bg-muted/30 border border-border/50 rounded-2xl p-5 text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder="Pega tus notas brutas, un esquema o simplemente escribe lo que tienes en mente..."
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Topic selector */}
                <div className="relative">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 ml-1">Ángulo Estratégico</p>
                  <button
                    onClick={() => { setTopicOpen(!topicOpen); setAudienceOpen(false); }}
                    className="w-full flex items-center justify-between bg-muted/40 border border-border/50 rounded-xl px-4 py-3 text-sm text-left hover:bg-muted/60 transition-colors"
                  >
                    <span className={selectedTopic ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {selectedTopic || "Seleccionar ángulo..."}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${topicOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {topicOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95">
                      {topicAngles.map((t) => (
                        <button
                          key={t}
                          onClick={() => { setSelectedTopic(t); setTopicOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audience selector */}
                <div className="relative">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground mb-2 ml-1">Audiencia Objetivo</p>
                  <button
                    onClick={() => { setAudienceOpen(!audienceOpen); setTopicOpen(false); }}
                    className="w-full flex items-center justify-between bg-muted/40 border border-border/50 rounded-xl px-4 py-3 text-sm text-left hover:bg-muted/60 transition-colors"
                  >
                    <span className={selectedAudience ? "text-foreground font-medium" : "text-muted-foreground"}>
                      {selectedAudience || "Seleccionar perfil..."}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${audienceOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {audienceOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-card/95 backdrop-blur-xl border border-primary/20 rounded-xl shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95">
                      {audiences.map((a) => (
                        <button
                          key={a}
                          onClick={() => { setSelectedAudience(a); setAudienceOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <Button className="w-full h-14 text-lg font-heading group relative overflow-hidden" size="lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90" />
                  <div className="relative flex items-center justify-center gap-2">
                    Generar Contenido de Autoridad
                    <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                  Este proceso consumirá créditos de Gemini para generar un borrador estructurado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Recent Jobs */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="tech-card border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                Historial Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-1">
                {recentJobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${job.type === 'audio' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {job.type === 'audio' ? <Mic className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold group-hover:text-primary transition-colors">{job.title}</p>
                        <p className="text-[10px] text-muted-foreground">{job.date} · {job.model}</p>
                      </div>
                    </div>
                    {job.status === "done" ? (
                      <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400 bg-emerald-500/5">LISTO</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] border-primary/20 text-primary animate-pulse">PROCESANDO</Badge>
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-2 text-xs text-muted-foreground hover:text-primary">
                Ver toda la biblioteca
              </Button>
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
            <h3 className="font-heading font-bold text-sm mb-3">Sugerencia del día</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Prueba a subir un audio de 2 minutos sobre tu última reunión. Ghostwriter extraerá los insights clave y redactará un post para LinkedIn enfocado en autoridad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
