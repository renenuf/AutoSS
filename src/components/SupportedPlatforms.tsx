import { CheckCircle2 } from 'lucide-react';

const platforms = [
  'Moodle',
  'Blackboard',
  'Canvas',
  'Brightspace (D2L)',
  'Google Classroom',
  'Coursera',
  'edX',
  'Udemy',
  'LinkedIn Learning',
  'Custom University LMS'
];

export function SupportedPlatforms() {
  return (
    <section className="bg-slate-800/30 rounded-2xl p-8 border border-slate-700/50">
      <h2 className="text-xl font-semibold text-white mb-6">
        Supported Platforms
      </h2>
      <p className="text-slate-400 mb-6">
        Course Capture works with most Learning Management Systems and online course platforms:
      </p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {platforms.map((platform, index) => (
          <div
            key={index}
            className="flex items-center gap-2 text-sm text-slate-300"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{platform}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
