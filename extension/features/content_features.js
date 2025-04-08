// Content-based feature extractors
const contentFeatures = {
    hasRequestURL: () => {
        return document.querySelectorAll("img[src*='http']").length > 0 ? 1 : -1;
    },
    
    hasURLAnchor: () => {
        return document.querySelectorAll("a[href*='http']").length > 0 ? 1 : -1;
    },
    
    hasLinksInTags: () => {
        return document.querySelectorAll("link[href*='http']").length > 0 ? 1 : -1;
    },
    
    hasSFH: () => {
        return document.querySelectorAll("form[action='']").length > 0 ? 1 : -1;
    },
    
    hasSubmittingToEmail: () => {
        return document.querySelectorAll("a[href^=mailto]").length > 0 ? 1 : -1;
    },
    
    hasMouseoverEffect: () => {
        return document.querySelectorAll("a[onmouseover]").length > 0 ? 1 : -1;
    },
    
    hasRightClickDisabled: () => {
        return document.oncontextmenu === null ? -1 : 1;
    },
    
    hasPopupWindow: () => {
        return typeof window.open === "function" ? 1 : -1;
    },
    
    hasIframeRedirection: () => {
        return document.querySelectorAll("iframe").length > 0 ? 1 : -1;
    },
    
    hasLinksPointingToPage: () => {
        return document.querySelectorAll("a").length > 5 ? 1 : -1;
    },
    
    hasStatisticalReport: () => {
        return document.querySelectorAll("script").length > 5 ? 1 : -1;
    }
};