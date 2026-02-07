import {
  Camera,
  MousePointer2,
  Clock,
  Download,
  Settings2,
  Play,
  Pause,
  FileImage,
  FileText
} from 'lucide-react';

const features = [
  {
    icon: MousePointer2,
    title: 'Auto-detect Navigation',
    description: 'Automatically finds and clicks "Next", "Continue", "Siguiente" buttons across different LMS platforms.'
  },
  {
    icon: Camera,
    title: 'Smart Screenshots',
    description: 'Captures the main content area, not the entire page. Clean, focused screenshots every time.'
  },
  {
    icon: Clock,
    title: 'Configurable Timing',
    description: 'Adjust the delay between pages to ensure content loads properly before capturing.'
  },
  {
    icon: Play,
    title: 'Start/Pause/Stop',
    description: 'Full control over the automation. Pause at any time and resume when ready.'
  },
  {
    icon: FileImage,
    title: 'Export as ZIP',
    description: 'Download all screenshots as numbered PNG files in a ZIP archive.'
  },
  {
    icon: FileText,
    title: 'Export as PDF',
    description: 'Compile all screenshots into a single PDF document for easy reference.'
  },
  {
    icon: Settings2,
    title: 'Custom Selectors',
    description: 'Specify custom CSS selectors for navigation buttons and content areas when needed.'
  },
  {
    icon: Pause,
    title: 'Manual Capture',
    description: 'Take individual screenshots manually without starting the automation.'
  }
];

export function Features() {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-6">Features</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <div
            key={index}
            className="p-5 bg-slate-800/30 rounded-xl border border-slate-700/50 hover:border-slate-600 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
              <feature.icon className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-medium text-white mb-2">{feature.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
