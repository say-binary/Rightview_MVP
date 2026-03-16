import { useRef, useCallback } from 'react';
import { useApp } from '../context/AppContext';

const SNAP_PEEK = 'peek';
const SNAP_HALF = 'half';
const SNAP_FULL = 'full';

export function useBottomSheet() {
  const { state, dispatch } = useApp();
  const { sheetState } = state;

  const dragStartY = useRef(null);
  const dragStartState = useRef(null);

  const onDragStart = useCallback((e) => {
    dragStartY.current = e.touches ? e.touches[0].clientY : e.clientY;
    dragStartState.current = sheetState;
  }, [sheetState]);

  const onDragEnd = useCallback((e) => {
    if (dragStartY.current === null) return;
    const endY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;
    const delta = endY - dragStartY.current; // positive = dragged down
    const current = dragStartState.current;

    let next = current;
    if (delta < -60) {
      // Dragged up
      if (current === SNAP_PEEK) next = SNAP_HALF;
      else if (current === SNAP_HALF) next = SNAP_FULL;
    } else if (delta > 60) {
      // Dragged down
      if (current === SNAP_FULL) next = SNAP_HALF;
      else if (current === SNAP_HALF) next = SNAP_PEEK;
    }

    dragStartY.current = null;
    dragStartState.current = null;
    if (next !== current) {
      dispatch({ type: 'SET_SHEET_STATE', payload: next });
    }
  }, []);

  const setSheet = useCallback((state) => {
    dispatch({ type: 'SET_SHEET_STATE', payload: state });
  }, [dispatch]);

  return { sheetState, onDragStart, onDragEnd, setSheet };
}
