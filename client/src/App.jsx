import { AppProvider } from './context/AppContext';
import { usePropertyFilters } from './hooks/usePropertyFilters';
import MapView from './components/MapView/MapView';
import FilterBar from './components/FilterBar/FilterBar';
import ChatBar from './components/ChatBar/ChatBar';
import BottomSheet from './components/BottomSheet/BottomSheet';
import ErrorBanner from './components/common/ErrorBanner';

// Inner component so hooks can access AppContext
function AppInner() {
  usePropertyFilters(); // Watches filters, fires API calls, updates properties
  return (
    <>
      <MapView />
      <FilterBar />
      <ErrorBanner />
      <ChatBar />
      <BottomSheet />
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}
