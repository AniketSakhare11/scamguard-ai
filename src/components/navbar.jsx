import { Key, ShieldAlert, Sparkles } from "lucide-react";

export default function Navbar({ toggleKeyInput, hasApiKey, aiEnabled }) {
    return (
        <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

                <div className="flex items-center gap-3">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-2">
                        <ShieldAlert className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <span className="block text-lg font-bold leading-tight text-white sm:text-xl">
                            ScamGuard AI
                        </span>
                        <span className="hidden text-xs text-slate-400 sm:block">
                            Scam checks for texts, emails, and DMs
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={toggleKeyInput}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-800 px-3 py-2 text-sm text-slate-300 hover:border-slate-600 hover:bg-slate-900 hover:text-white"
                    aria-label="API key settings"
                >
                    {aiEnabled && hasApiKey ? (
                        <Sparkles className="h-4 w-4 text-blue-300" />
                    ) : (
                        <Key className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{aiEnabled && hasApiKey ? "AI on" : "AI setup"}</span>
                </button>
            </div>
        </nav>
    );
}
