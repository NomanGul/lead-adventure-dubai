import { ItineraryPanel } from "./components/ItineraryPanel";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { SearchForm } from "./components/SearchForm";

function App() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <SearchForm />
          <ResultsDashboard />
        </div>
        <ItineraryPanel />
      </div>
    </main>
  );
}

export default App;
