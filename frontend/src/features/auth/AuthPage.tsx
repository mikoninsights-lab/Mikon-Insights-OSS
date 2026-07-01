import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function AuthPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await register(username, email, password);
      } else {
        await login(email, password);
      }
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <img src="/logos/isotipo.png" alt="Mikon Insights" className="w-16 h-16 object-contain" />
          <div className="text-center">
            <h1 className="font-heading font-bold text-xl tracking-wide leading-none">
              <span style={{ color: '#ffffff' }}>MIKON </span>
              <span style={{ color: '#EA711B' }}>INSIGHTS</span>
            </h1>
            <p className="text-[9px] uppercase tracking-[0.2em] mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              OSS
            </p>
          </div>
        </div>

        <div className="tech-card p-8">
          <h1 className="text-2xl font-heading font-bold mb-2 text-center">
            {mode === "login" ? t("auth.loginTitle") : t("auth.signupTitle")}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {mode === "login" ? t("auth.loginSubtitle") : t("auth.signupSubtitle")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === "signup" && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t("auth.fullName")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder={t("auth.email")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder={t("auth.password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full pl-11 pr-4 py-3 bg-muted/30 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2 animate-fade-in">{error}</p>
            )}

            <Button type="submit" className="w-full btn-primary h-12 text-base" disabled={loading}>
              {loading ? t("auth.verifying") : mode === "login" ? t("auth.enter") : t("auth.signup")}
              {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              className="text-xs text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider font-medium"
            >
              {mode === "login" ? t("auth.switchToSignup") : t("auth.switchToLogin")}
            </button>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground/40">
          © {new Date().getFullYear()} {t("auth.footer")}
        </p>
      </div>
    </div>
  );
}
