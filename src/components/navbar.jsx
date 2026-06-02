import { ShieldAlert, Key } from "lucide-react";

export default function Navbar({ toggleKeyInput }) {
    return (
        <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

                <div className="flex items-center space-x-3">
                    <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                        <ShieldAlert className="w-6 h-6 text-blue-400" />
                    </div>
                    <span className="text-xl font-bold text-white">
                        ScamGuard AI
                    </span>
                </div>

                <button onClick={toggleKeyInput}>
                    <Key className="w-5 h-5 text-slate-400 hover:text-white" />
                </button>
            </div>
        </nav>
    );
}