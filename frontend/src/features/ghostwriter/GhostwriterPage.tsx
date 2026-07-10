import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Mic, FileText, Sparkles, History, Send, BrainCircuit, Type, MessageSquareCode, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getServices, generateGhostwriterContent, type GhostwriterResult } from "@/lib/api";

const topicAngles = ["Marketing Analytics", "People Analytics", "IA Aplicada", "Estrategia de Datos", "Caso de Éxito", "Liderazgo Técnico"];
const audiences = ["CMO / Director Marketing", "HR Director", "Founder / CEO", "Data Team Lead", "Inversores"];

interface HistoryEntry extends GhostwriterResult {
  id: number;
  title: string;
}

export default function GhostwriterPage() {
  const { t } = useTranslation();
  const [inputType, setInputType] = useState<"audio" | "text">("text");
  const [contentType, setContentType] = useState("linkedin");
  const [model, setModel] = useState("flash");
  const [selectedService, setSelectedService] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedAudience, setSelectedAudience] = useState("");
  const [context, setContext] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<HistoryEntry | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const CONTENT_TYPES = [
    { value: "linkedin", label: t('ghostwriter.contentTypeLinkedin') },
    { value: "email", label: t('ghostwriter.contentTypeEmail') },
    { value: "article", label: t('ghostwriter.contentTypeArticle') },
    { value: "proposal", label: t('ghostwriter.contentTypeProposal') },
    { value: "twitter", label: t('ghostwriter.contentTypeTwitter') },
  ];

  const MODELS = [
    { value: "flash", label: t('ghostwriter.modelFlash') },
    { value: "pro", label: t('ghostwriter.modelPro') },
  ];

  const { data: services = [] } = useQuery({ queryKey: ['services'], queryFn: getServices });

  const handleGenerate = async () => {
    if (inputType === "audio") {
      toast.error(t('ghostwriter.audioModeError'));
      return;
    }
    if (!selectedService) { toast.error(t('ghostwriter.selectServiceError')); return; }
    if (!selectedAudience) { toast.error(t('ghostwriter.selectAudienceError')); return; }
    if (!context.trim()) { toast.error(t('ghostwriter.contextRequiredError')); return; }

    setIsGenerating(true);
    try {
      const fullContext = selectedTopic ? `Ángulo estratégico: ${selectedTopic}. ${context}` : context;
      const res = await generateGhostwriterContent({
        contentType,
        service: selectedService,
        audience: selectedAudience,
        model,
        context: fullContext,
      });
      const entry: HistoryEntry = {
        ...res,
        id: Date.now(),
        title: `${CONTENT_TYPES.find((c) => c.value === contentType)?.label} — ${selectedService}`,
      };
      setResult(entry);
      setHistory((prev) => [entry, ...prev]);
      toast.success(t('ghostwriter.generateSuccess'));
    } catch (err: any) {
      toast.error(err.message || t('ghostwriter.contextRequiredError'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    toast.success(t('ghostwriter.copiedToClipboard'));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-primary/10 text-primary border-primary/20 flex gap-1 items-center">
              <Sparkles className="w-3 h-3" />
              {t('ghostwriter.poweredBy')}
            </Badge>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">{t('ghostwriter.title')}</h1>
          <p className="text-muted-foreground">{t('ghostwriter.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Generator Form */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="tech-card border-primary/10 overflow-hidden bg-gradient-to-br from-card/50 to-primary/5">
            <CardHeader>
              <div className="flex p-1 bg-muted/30 rounded-xl border border-border/40 w-fit mb-4">
                <button
                  onClick={() => setInputType("audio")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputType === "audio" ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Mic className="h-4 w-4" /> {t('ghostwriter.audio')}
                </button>
                <button
                  onClick={() => setInputType("text")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    inputType === "text" ? "bg-background text-foreground shadow-sm border border-border/50" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Type className="h-4 w-4" /> {t('ghostwriter.text')}
                </button>
              </div>
              <CardTitle className="text-xl font-heading flex items-center gap-2">
                {inputType === "audio" ? <BrainCircuit className="w-5 h-5 text-primary" /> : <MessageSquareCode className="w-5 h-5 text-primary" />}
                {t('ghostwriter.ideaInput')}
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
                    <p className="text-base font-medium text-foreground">{t('ghostwriter.dragAudio')}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('ghostwriter.audioComingSoon')}</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    <textarea
                      value={context}
                      onChange={(e) => setContext(e.target.value)}
                      className="w-full h-40 bg-muted/30 border border-border/50 rounded-2xl p-5 text-base text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      placeholder={t('ghostwriter.textPlaceholder')}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('ghostwriter.contentType')}</p>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('ghostwriter.model')}</p>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger className="input-field"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('ghostwriter.serviceToPromote')}</p>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger className="input-field"><SelectValue placeholder={t('ghostwriter.selectService')} /></SelectTrigger>
                    <SelectContent>
                      {(services as any[]).map((s) => <SelectItem key={s._id} value={s.name}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('ghostwriter.targetAudience')}</p>
                  <Select value={selectedAudience} onValueChange={setSelectedAudience}>
                    <SelectTrigger className="input-field"><SelectValue placeholder={t('ghostwriter.selectAudience')} /></SelectTrigger>
                    <SelectContent>
                      {audiences.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground ml-1">{t('ghostwriter.strategicAngle')}</p>
                <Select value={selectedTopic || "none"} onValueChange={(val) => setSelectedTopic(val === "none" ? "" : val)}>
                  <SelectTrigger className="input-field"><SelectValue placeholder={t('ghostwriter.noAngle')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t('ghostwriter.noAngle')}</SelectItem>
                    {topicAngles.map((angle) => <SelectItem key={angle} value={angle}>{angle}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-4">
                <Button
                  className="w-full h-14 text-lg font-heading group relative overflow-hidden"
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || inputType === "audio"}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-600 opacity-90" />
                  <div className="relative flex items-center justify-center gap-2">
                    {isGenerating ? (
                      <>
                        {t('ghostwriter.generating')}
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </>
                    ) : (
                      <>
                        {t('ghostwriter.generate')}
                        <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 italic">
                  {inputType === "audio"
                    ? t('ghostwriter.audioComingSoonNote')
                    : t('ghostwriter.creditsNote')}
                </p>
              </div>
            </CardContent>
          </Card>

          {result && (
            <Card className="tech-card border-emerald-500/20">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-heading">{result.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400 bg-emerald-500/5">
                    {result.model}
                  </Badge>
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {t('ghostwriter.copy')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm text-foreground bg-muted/20 rounded-xl p-5 max-h-96 overflow-y-auto">
                  {result.content}
                </div>
                <p className="text-[10px] text-muted-foreground mt-3 text-right">
                  {t('ghostwriter.generatedIn', { seconds: (result.elapsedMs / 1000).toFixed(1) })}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar: Recent Jobs */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="tech-card border-border/40">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-heading flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                {t('ghostwriter.sessionHistory')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {history.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">
                  {t('ghostwriter.noHistory')}
                </p>
              ) : (
                <div className="space-y-1">
                  {history.map((job) => (
                    <button
                      key={job.id}
                      onClick={() => setResult(job)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-all cursor-pointer group text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold group-hover:text-primary transition-colors truncate">{job.title}</p>
                          <p className="text-[10px] text-muted-foreground">{job.model}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[9px] border-emerald-500/20 text-emerald-400 bg-emerald-500/5 shrink-0">
                        {t('ghostwriter.ready')}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
            <h3 className="font-heading font-bold text-sm mb-3">{t('ghostwriter.tipTitle')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('ghostwriter.tipBody')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
