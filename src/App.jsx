import { useState } from "react";
import Navbar from "./components/Navbar";
import InputBox from "./components/InputBox";

function App() {
  // 🔑 Get API key from .env
  const apiKey = import.meta.env.VITE_API_KEY;

  // 🧠 State
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // 🚀 Main function (AI call)
  const analyzeText = async () => {
    if (!inputText.trim()) return;

    if (!apiKey) {
      setError("API Key not found. Check your .env file.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError("");

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
      contents: [
        {
          parts: [{ text: inputText }]
        }
      ]
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // 🧪 Debug (you can remove later)
      console.log(data);

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      setResult(text || "No response from AI");
    } catch (err) {
      console.error(err);
      setError("Something went wrong while analyzing.");
    }

    setIsAnalyzing(false);
  };

  return (
    <div className="bg-slate-950 min-h-screen text-white">
      <Navbar toggleKeyInput={() => { }} />

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT SIDE */}
        <InputBox
          inputText={inputText}
          setInputText={setInputText}
          analyzeText={analyzeText}
          isAnalyzing={isAnalyzing}
        />

        {/* RIGHT SIDE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4">Result</h2>

          {error && (
            <p className="text-red-400 mb-2">{error}</p>
          )}

          <pre className="text-sm text-slate-300 whitespace-pre-wrap">
            {result || "No analysis yet"}
          </pre>
        </div>

      </div>
    </div>
  );
}

export default App;