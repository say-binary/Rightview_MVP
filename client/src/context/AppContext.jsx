import { createContext, useContext, useReducer } from 'react';
import { DEFAULT_CENTER, DEFAULT_ZOOM } from '../utils/constants';

const initialState = {
  filters: {
    city: null,
    bhk: [],
    minPrice: null,
    maxPrice: null,
    propertyType: [],
    possession: [],
    transactionType: null,
    locality: null,
    mapBounds: null,
  },
  properties: [],
  totalCount: 0,
  isLoading: false,
  error: null,
  mapCenter: DEFAULT_CENTER,
  mapZoom: DEFAULT_ZOOM,
  activePropertyId: null,
  sheetState: 'peek', // 'peek' | 'half' | 'full'
  chatQuery: '',
  parsedQueryChips: [],
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        parsedQueryChips: [],
        chatQuery: '',
      };
    case 'SET_MAP_BOUNDS':
      return {
        ...state,
        filters: { ...state.filters, mapBounds: action.payload },
      };
    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: action.payload.properties,
        totalCount: action.payload.total,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_ACTIVE_PROPERTY':
      return { ...state, activePropertyId: action.payload };
    case 'SET_SHEET_STATE':
      return { ...state, sheetState: action.payload };
    case 'SET_MAP_CENTER':
      return { ...state, mapCenter: action.payload };
    case 'SET_CHAT_QUERY':
      return { ...state, chatQuery: action.payload };
    case 'SET_PARSED_CHIPS':
      return { ...state, parsedQueryChips: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
