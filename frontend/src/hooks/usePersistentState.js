import { useEffect, useState, useRef } from 'react';

// A small helper to persist React state to localStorage and rehydrate on load.
export default function usePersistentState(key, initialValue) {
    const isFirst = useRef(true);
    const [state, setState] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            if (raw !== null) return JSON.parse(raw);
        } catch (_) {
            // ignore parse errors and fall back to initialValue
        }
        return typeof initialValue === 'function' ? initialValue() : initialValue;
    });

    useEffect(() => {
        // Skip first render if value came from storage to reduce unnecessary writes
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (_) {
            // storage write can fail (quota), ignore gracefully
        }
    }, [key, state]);

    return [state, setState];
}


