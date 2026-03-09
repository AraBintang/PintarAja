import React, { createContext, useContext, useState } from 'react';

const RightSidebarContext = createContext();

export function RightSidebarProvider({ children }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen((prev) => !prev);
    const open = () => setIsOpen(true);
    const close = () => setIsOpen(false);

    return (
        <RightSidebarContext.Provider value={{ isOpen, toggle, open, close }}>
            {children}
        </RightSidebarContext.Provider>
    );
}

export function useRightSidebar() {
    return useContext(RightSidebarContext);
}
