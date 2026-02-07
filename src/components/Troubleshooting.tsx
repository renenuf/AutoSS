import { HelpCircle, Code, Timer, Layers } from 'lucide-react';

const tips = [
  {
    icon: Timer,
    problem: 'Pages not fully loading before capture',
    solution: 'Increase the delay in Settings (try 5000ms or higher for slow-loading content).'
  },
  {
    icon: Code,
    problem: 'Next button not being detected',
    solution: 'Use browser Developer Tools (F12) to inspect the button and copy its CSS selector, then paste it in the Custom Next Button Selector field.'
  },
  {
    icon: Layers,
    problem: 'Content in iframe not captured',
    solution: 'Try clicking directly inside the iframe content first, then activate Course Capture. Some iframe content may have cross-origin restrictions.'
  },
  {
    icon: HelpCircle,
    problem: 'Screenshots are capturing wrong area',
    solution: 'Set a Custom Content Selector in Settings. Inspect the page to find the main content container\'s CSS selector.'
  }
];

export function Troubleshooting() {
  return (
    <section className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
      <h2 className="text-xl font-semibold text-white mb-6">Troubleshooting Tips</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {tips.map((tip, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
              <tip.icon className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h3 className="font-medium text-white mb-1">{tip.problem}</h3>
              <p className="text-sm text-slate-400">{tip.solution}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
