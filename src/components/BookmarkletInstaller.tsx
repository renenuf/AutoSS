import { Bookmark, GripHorizontal, MousePointer } from 'lucide-react';
import { getBookmarkletCode } from '../utils/bookmarkletGenerator';

export function BookmarkletInstaller() {
  const bookmarkletCode = getBookmarkletCode();

  return (
    <section className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Bookmark className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Install the Bookmarklet
          </h2>
          <p className="text-slate-400 text-sm">
            Drag the button below to your bookmarks bar to install Course Capture.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl opacity-20 group-hover:opacity-30 blur transition-opacity" />
          <a
            href={bookmarkletCode}
            className="relative flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-medium rounded-xl shadow-lg cursor-grab active:cursor-grabbing transition-all"
            onClick={(e) => e.preventDefault()}
            draggable="true"
          >
            <GripHorizontal className="w-5 h-5 opacity-60" />
            <span>Course Capture</span>
          </a>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <MousePointer className="w-4 h-4" />
          <span>Drag this button to your bookmarks bar</span>
        </div>
      </div>

      <div className="mt-8 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-3">
          How to install:
        </h3>
        <ol className="text-sm text-slate-400 space-y-2">
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">1</span>
            <span>Make sure your bookmarks bar is visible (Ctrl+Shift+B on Windows, Cmd+Shift+B on Mac)</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">2</span>
            <span>Click and drag the blue "Course Capture" button above</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">3</span>
            <span>Drop it onto your bookmarks bar</span>
          </li>
          <li className="flex gap-3">
            <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center text-xs flex-shrink-0">4</span>
            <span>Navigate to any course page and click the bookmark to activate</span>
          </li>
        </ol>
      </div>
    </section>
  );
}
