// ================================
//  Global Type Declarations
//  Defines EyeDropper API and extends Window interface
// ================================

// EyeDropper API (available in Chrome but not in standard lib)
declare interface EyeDropper {
    open(): Promise<{ sRGBHex: string }>;
}

declare var EyeDropper: {
    new(): EyeDropper;
};

// Extend Window for custom properties used in the project
interface Window {
    cachedCategories: any;
    cachedGradients: any;
    cachedIcons: boolean;
    showToast: (message: string, duration?: number) => void;
    switchToPalette: () => Promise<void>;
    switchToGradient: () => Promise<void>;
    switchToFavorites: () => Promise<void>;
    switchToIcon: () => Promise<void>;
}