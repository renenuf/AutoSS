import { Github, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800 py-8 mt-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 flex items-center gap-2">
            Made with <Heart className="w-4 h-4 text-red-400" /> for students everywhere
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-2"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
