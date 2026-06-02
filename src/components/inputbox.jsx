import { Search } from "lucide-react";

export default function InputBox({
    inputText,
    setInputText,
    analyzeText,
    isAnalyzing
}) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

            <h2 className="text-lg font-semibold mb-4">Analysis Input</h2>

            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste suspicious message here..."
                className="w-full h-60 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white resize-none"
            />

            <button
                onClick={analyzeText}
                disabled={!inputText.trim() || isAnalyzing}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 px-4 py-3 rounded-xl flex items-center justify-center"
            >
                {isAnalyzing ? "Analyzing..." : (
                    <>
                        <Search className="w-5 h-5 mr-2" />
                        Scan for Scams
                    </>
                )}
            </button>

        </div>
    );
}