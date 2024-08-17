import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ScreenSizeContextProps {
    screenSize: 'small' | 'medium' | 'large';
    isDateCollapsed: boolean;
    isTagCompressed: boolean;
}

const ScreenSizeContext = createContext<ScreenSizeContextProps | undefined>(undefined);

const ScreenSizeProvider = ({ children }: { children: ReactNode }) => {
    const [screenSize, setScreenSize] = useState<'small' | 'medium' | 'large'>('large');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 650) {
                setScreenSize('small');
            } else if (window.innerWidth >= 650 && window.innerWidth < 1024) {
                setScreenSize('medium');
            } else {
                setScreenSize('large');
            }
        };

        // Set initial size
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isDateCollapsed = screenSize === 'small';
    const isTagCompressed = screenSize !== 'large';

    return (
        <ScreenSizeContext.Provider value={{ screenSize, isDateCollapsed, isTagCompressed }}>
            {children}
        </ScreenSizeContext.Provider>
    );
};

const useScreenSize = () => {
    const context = useContext(ScreenSizeContext);
    if (context === undefined) {
        throw new Error('useScreenSize must be used within a ScreenSizeProvider');
    }
    return context;
};

export { ScreenSizeProvider, useScreenSize };
