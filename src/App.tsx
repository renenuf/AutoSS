import { Header } from './components/Header';
import { BookmarkletInstaller } from './components/BookmarkletInstaller';
import { Features } from './components/Features';
import { SupportedPlatforms } from './components/SupportedPlatforms';
import { UsageGuide } from './components/UsageGuide';
import { Troubleshooting } from './components/Troubleshooting';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="space-y-12">
          <div className="grid lg:grid-cols-2 gap-8">
            <BookmarkletInstaller />

            <div className="bg-slate-800/50 rounded-2xl p-8 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4">
                What is Course Capture?
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">
                Course Capture is a lightweight bookmarklet tool that automates the process of
                navigating through online courses while capturing screenshots of each page.
              </p>
              <p className="text-slate-400 leading-relaxed mb-4">
                Perfect for creating study materials, documenting course content, or having
                offline access to your course materials for later review.
              </p>
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Key Benefits:</h3>
                <ul className="text-sm text-slate-400 space-y-1">
                  <li>- Saves hours of manual screenshotting</li>
                  <li>- Works across most LMS platforms</li>
                  <li>- No installation required (just a bookmark)</li>
                  <li>- Export as ZIP or PDF</li>
                  <li>- Fully configurable settings</li>
                </ul>
              </div>
            </div>
          </div>

          <Features />

          <UsageGuide />

          <SupportedPlatforms />

          <Troubleshooting />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
