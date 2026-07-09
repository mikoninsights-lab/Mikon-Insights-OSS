import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_MAP = {
  flash: 'gemini-flash-lite-latest',
  pro: 'gemini-2.5-flash',
};

// Fallback chain if primary model is overloaded or quota-exceeded
const FALLBACK_MODELS = ['gemini-flash-lite-latest', 'gemini-2.5-flash-lite'];

const CONTENT_TYPE_INSTRUCTIONS = {
  linkedin: 'un post profesional para LinkedIn (máx 300 palabras, tono cercano y experto, con 2-3 emojis estratégicos, incluye un gancho inicial potente y termina con una pregunta que fomente el engagement, añade 3-5 hashtags relevantes al final)',
  email: 'un email comercial persuasivo (asunto atractivo, saludo personalizado, cuerpo claro con propuesta de valor, CTA explícito, firma profesional)',
  article: 'un artículo de blog (600-800 palabras, con título H1, subtítulos H2, párrafos escaneables, conclusión accionable, tono experto y didáctico)',
  proposal: 'una propuesta comercial breve (problema del cliente, solución propuesta, entregables, tiempos estimados, valor diferencial)',
  twitter: 'un thread de Twitter/X (6-8 tuits, cada uno <280 caracteres, numerados, gancho viral inicial, insight por tuit, cierre con CTA)',
};

export const generateContent = async (req, res) => {
  try {
    const { contentType, service, audience, model, context } = req.body || {};

    if (!contentType || !service || !audience || !model || !context) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: contentType, service, audience, model, context',
      });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: 'GEMINI_API_KEY no configurada en el servidor',
      });
    }

    const modelName = MODEL_MAP[model] || MODEL_MAP.flash;
    const typeInstruction = CONTENT_TYPE_INSTRUCTIONS[contentType] || CONTENT_TYPE_INSTRUCTIONS.linkedin;

    const systemPrompt = `Eres un ghostwriter senior especializado en Data Science y consultoría B2B para Mikon Insights OSS, una consultoría de anticipación estratégica basada en datos. Tu voz es experta, accesible, con un toque de autoridad técnica pero sin jerga innecesaria. Siempre respondes en español de España, con un tono directo y orientado a resultados.`;

    const userPrompt = `Genera ${typeInstruction}.

CONTEXTO DEL ENCARGO:
- Servicio que promocionar: ${service}
- Audiencia objetivo: ${audience}
- Contexto/briefing del cliente: ${context}

Entrega SOLO el contenido final listo para publicar, sin preámbulos, sin explicaciones, sin comillas envolventes.`;

    const genAI = new GoogleGenerativeAI(apiKey);

    // Build ordered list of candidate models: primary first, then fallbacks (deduped)
    const candidates = [modelName, ...FALLBACK_MODELS.filter((m) => m !== modelName)];

    const startedAt = Date.now();
    let result;
    let usedModel;
    let lastErr;

    for (const candidate of candidates) {
      const gModel = genAI.getGenerativeModel({
        model: candidate,
        systemInstruction: systemPrompt,
      });
      const maxAttempts = 3;
      let success = false;
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          result = await gModel.generateContent(userPrompt);
          usedModel = candidate;
          success = true;
          lastErr = null;
          break;
        } catch (err) {
          lastErr = err;
          const msg = err?.message || '';
          const retriable = /503|Service Unavailable|overloaded|high demand|UNAVAILABLE/i.test(msg);
          const quotaErr = /429|RESOURCE_EXHAUSTED|quota/i.test(msg);
          if (quotaErr) break; // move to next candidate model
          if (!retriable || attempt === maxAttempts) break;
          const delayMs = 600 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 300);
          await new Promise((r) => setTimeout(r, delayMs));
        }
      }
      if (success) break;
    }

    if (!result) {
      throw lastErr || new Error('No se pudo generar contenido con ningún modelo disponible');
    }

    const text = result?.response?.text?.() || '';
    const elapsed = Date.now() - startedAt;

    if (!text.trim()) {
      return res.status(502).json({
        success: false,
        message: 'El modelo devolvió una respuesta vacía. Inténtalo de nuevo.',
      });
    }

    return res.json({
      success: true,
      content: text.trim(),
      model: usedModel,
      elapsedMs: elapsed,
    });
  } catch (error) {
    console.error('Ghostwriter generate error:', error);
    const msg = error?.message || 'Error generando contenido';
    let status = 500;
    let userMsg = msg;
    if (/API key|PERMISSION_DENIED|invalid/i.test(msg)) {
      status = 401;
    } else if (/503|Service Unavailable|overloaded|high demand|UNAVAILABLE/i.test(msg)) {
      status = 503;
      userMsg = 'El modelo de Gemini está con alta demanda ahora mismo. Inténtalo de nuevo en unos segundos o cambia de modelo (Flash/Pro).';
    }
    return res.status(status).json({
      success: false,
      message: userMsg,
    });
  }
};
