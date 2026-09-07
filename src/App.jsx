import { ItineraryDock } from "./components/ItineraryDock";
import { ItineraryPanel } from "./components/ItineraryPanel";
import { Planner } from "./components/Planner";
import { ResultsDashboard } from "./components/ResultsDashboard";
import { Toast } from "./components/Toast";
import { TripSummaryBar } from "./components/TripSummaryBar";
import { useTrip } from "./context/useTrip";

function App() {
  const { hasSearched, editingSearch, itinerary } = useTrip();

  const planning = !hasSearched || editingSearch;
  const savedCount =
    itinerary.flights.length +
    itinerary.hotels.length +
    itinerary.activities.length;

  return (
    <div className={`min-h-dvh ${planning ? "bg-ink" : ""}`}>
      {planning ? (
        <Planner bottomInset={savedCount > 0} fill />
      ) : (
        <>
          <TripSummaryBar />

          <main className="mx-auto px-4 pb-28 sm:px-6 lg:px-8 lg:pb-12">
            <div className="mx-auto grid max-w-350 items-start gap-8 py-6 lg:grid-cols-[minmax(0,1fr)_312px]">
              <ResultsDashboard />

              <aside id="trip" aria-label="My trip" className="hidden lg:block">
                <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto">
                  <ItineraryPanel />
                </div>
              </aside>
            </div>
          </main>
        </>
      )}

      <ItineraryDock desktop={planning} />
      <Toast />
    </div>
  );
}

export default App;
