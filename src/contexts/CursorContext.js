"use client";
import { createContext, useContext, useState } from "react";

const CursorContext = createContext(null);

export function CursorProvider({ children }) {
    const [variant, setVariant] = useState("default"); // "default" | "view"

    return (
        <CursorContext.Provider value={{ variant, setVariant }}>
            {children}
        </CursorContext.Provider>
    );
}

export const useCursor = () => useContext(CursorContext);