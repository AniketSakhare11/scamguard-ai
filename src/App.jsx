import { useMemo, useState } from "react";
import Navbar from "./components/navbar";
import InputBox from "./components/inputbox";
import ResultPanel from "./components/ResultPanel";
import {
  SAMPLE_MESSAGES,
  analyzeMessageLocally,
  buildAiPrompt,
  mergeAnalyses,
  parseAiAnalysis,
} from "./lib/scamAnalysis";

function App() {
  const envApiKey = import.meta.env.VITE_API_KEY || "";
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [runtimeApiKey, setRuntimeApiKey] = useState(
    () => sessionStorage.getItem("scamguard_api_key") || "",
  );
  const [aiEnabled, setAiEnabled] = useState(Boolean(envApiKey || runtimeApiKey));
  const [copied, setCopied] = useState(false);

  const activeApiKey = useMemo(
    () => runtimeApiKey.trim() || envApiKey.trim(),
    [envApiKey, runtimeApiKey],
  );

  const analyzeText = async () => {
    const message = inputText.trim();
    if (!message) return;

    const localAnalysis = analyzeMessageLocally(message);
    setResult(localAnalysis);
    setError("");
    setCopied(false);

    if (!aiEnabled) {
      return;
    }

    if (!activeApiKey) {
      setError("Local analysis completed. Add a Gemini API key to enable AI-assisted analysis.");
      setShowSettings(true);
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${activeApiKey}`;
      const payload = {
        contents: [
          {
            parts: [{ text: buildAiPrompt(message, localAnalysis) }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              score: { type: "INTEGER" },
              riskLevel: { type: "STRING", enum: ["Minimal", "Low", "Medium", "High"] },
              summary: { type: "STRING" },
              redFlags: { type: "ARRAY", items: { type: "STRING" } },
              recommendedActions: { type: "ARRAY", items: { type: "STRING" } },
              safeReply: { type: "STRING" }
            },
            required: ["score", "riskLevel", "summary", "redFlags", "recommendedActions", "safeReply"]
          },
          temperature: 0.2,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errMsg = `Status ${res.status}`;
        try {
          const errData = await res.json();
          if (errData?.error?.message) {
            errMsg = errData.error.message;
          }
        } catch (err) {
          console.warn("Failed to parse Gemini error response:", err);
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const aiAnalysis = parseAiAnalysis(text);

      if (!aiAnalysis) {
        setError("Local analysis completed. The AI response was not in the expected format.");
        return;
      }

      setResult(mergeAnalyses(localAnalysis, aiAnalysis));
    } catch (err) {
      console.error(err);
      setError(`Local analysis completed. AI-assisted scan failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveRuntimeApiKey = (value) => {
    setRuntimeApiKey(value);

    if (value.trim()) {
      sessionStorage.setItem("scamguard_api_key", value.trim());
      setAiEnabled(true);
      return;
    }

    sessionStorage.removeItem("scamguard_api_key");
    setAiEnabled(Boolean(envApiKey));
  };

  const copySafeReply = async () => {
    if (!result?.safeReply) return;

    await navigator.clipboard.writeText(result.safeReply);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar
        toggleKeyInput={() => setShowSettings((value) => !value)}
        hasApiKey={Boolean(activeApiKey)}
        aiEnabled={aiEnabled}
      />

      <main className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="space-y-5">
          {showSettings && (
            <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label htmlFor="api-key" className="text-sm font-semibold text-white">
                    Gemini API key
                  </label>
                  <p className="mt-1 text-sm text-slate-400">
                    Optional. Without it, ScamGuard runs the local signal scan only.
                  </p>
                  <input
                    id="api-key"
                    value={runtimeApiKey}
                    onChange={(event) => saveRuntimeApiKey(event.target.value)}
                    placeholder={
                      envApiKey ? "Using VITE_API_KEY from .env" : "Paste API key for this session"
                    }
                    type="password"
                    className="mt-3 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={aiEnabled}
                    onChange={(event) => setAiEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                  />
                  AI-assisted scan
                </label>
              </div>
            </section>
          )}

          <InputBox
            inputText={inputText}
            setInputText={setInputText}
            analyzeText={analyzeText}
            isAnalyzing={isAnalyzing}
            samples={SAMPLE_MESSAGES}
            onUseSample={(sample) => {
              setInputText(sample);
              setResult(null);
              setError("");
            }}
            onClear={() => {
              setInputText("");
              setResult(null);
              setError("");
            }}
          />
        </div>

        <ResultPanel analysis={result} error={error} copied={copied} onCopy={copySafeReply} />
      </main>
    </div>
  );
}

export default App;
