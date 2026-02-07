import { Camera, BookOpen } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-slate-900 border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Camera className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Course Capture
              <BookOpen className="w-5 h-5 text-slate-400" />
            </h1>
            <p className="text-slate-400 text-sm">
              Automate course navigation & capture screenshots
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
