import { Eraser, FlaskConical, Search } from "lucide-react";

export default function InputBox({
    inputText,
    setInputText,
    analyzeText,
    isAnalyzing,
    samples,
    onUseSample,
    onClear
}) {
    const characterCount = inputText.length;

    return (
        <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-normal text-slate-400">
                        Analysis Input
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-white">
                        Paste the suspicious message
                    </h2>
                </div>

                <button
                    type="button"
                    onClick={onClear}
                    disabled={!inputText || isAnalyzing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:border-slate-500 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Eraser className="h-4 w-4" />
                    Clear
                </button>
            </div>

            <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a text message, email, marketplace DM, job offer, or support request..."
                className="mt-5 h-72 w-full resize-none rounded-lg border border-slate-800 bg-slate-950 p-4 text-left text-base text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />

            <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{characterCount} characters</span>
                <span>Local scan works without an API key</span>
            </div>

            <button
                onClick={analyzeText}
                disabled={!inputText.trim() || isAnalyzing}
                className="mt-4 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500"
            >
                {isAnalyzing ? "Analyzing..." : (
                    <>
                        <Search className="w-5 h-5 mr-2" />
                        Scan for Scams
                    </>
                )}
            </button>

            <div className="mt-5">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <FlaskConical className="h-4 w-4 text-slate-500" />
                    Try a sample
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                    {samples.map((sample) => (
                        <button
                            type="button"
                            key={sample.label}
                            onClick={() => onUseSample(sample.text)}
                            className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-left text-sm text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                        >
                            {sample.label}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}
