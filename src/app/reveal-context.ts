import { createContext } from "react";

// True when Chrome-specific branding and per-API availability details should be
// visible. Kept false by default so a presenter can reveal that these demos
// use Chrome built-in AI APIs as a deliberate surprise.
export const RevealContext = createContext(false);
