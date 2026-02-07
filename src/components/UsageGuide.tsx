import { ArrowRight, AlertTriangle } from 'lucide-react';

const steps = [
  {
    step: 1,
    title: 'Install the bookmarklet',
    description: 'Drag the "Course Capture" button to your bookmarks bar.'
  },
  {
    step: 2,
    title: 'Open your course',
    description: 'Navigate to the first page/slide of the course content you want to capture.'
  },
  {
    step: 3,
    title: 'Activate Course Capture',
    description: 'Click the bookmarklet in your bookmarks bar. A floating panel will appear.'
  },
  {
    step: 4,
    title: 'Configure settings (optional)',
    description: 'Adjust delay timing or set custom selectors if the default detection doesn\'t work.'
  },
  {
    step: 5,
    title: 'Start capturing',
    description: 'Click "Start" and watch as the tool captures each page and advances automatically.'
  },
  {
    step: 6,
    title: 'Download your captures',
    description: 'When complete (or anytime), click ZIP or PDF to download all screenshots.'
  }
];

export function UsageGuide() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-6">How to Use</h2>

      <div className="space-y-4">
        {steps.map((item, index) => (
          <div key={index} className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-semibold">
                {item.step}
              </div>
            </div>
            <div className="flex-1 pb-4 border-b border-slate-800 last:border-0">
              <h3 className="font-medium text-white mb-1">{item.title}</h3>
              <p className="text-sm text-slate-400">{item.description}</p>
            </div>
            {index < steps.length - 1 && (
              <ArrowRight className="w-4 h-4 text-slate-600 self-center hidden md:block" />
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
        <div className="flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-200 mb-1">Important Note</h4>
            <p className="text-sm text-amber-200/70">
              This tool is designed for personal use to capture content from courses you have legitimate access to.
              Please respect copyright and terms of service of your educational institution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
