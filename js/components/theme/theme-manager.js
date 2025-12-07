export class ThemeManager {
    constructor(themes,backgroundInstance,themeSelectorInstance) {
        this.themes = themes;
        this.backgroundInstance = backgroundInstance;
        this.themeSelectorInstance = themeSelectorInstance;
        this.cleanupFunctions = [];
    }

    apply = (currentThemeKeyName) => {
        if (!this.themes[currentThemeKeyName]) return;

        this.runCleanup();

        const currentTheme = this.themes[currentThemeKeyName];

        this.applyThemeData(currentTheme.name);
        this.applyThemeBackground(currentTheme.background); 
        this.runAdditionalScripts(currentTheme.additionalScripts);

        localStorage.setItem('Theme', currentThemeKeyName);

        const themeEvent = new CustomEvent('themeChange', {
            detail: { 
                themeKeyName: currentThemeKeyName,
                themeName: currentTheme.name,
                themeData: currentTheme
            }
        });

        window.dispatchEvent(themeEvent);
    }

    init() {
        const currentThemeKeyName = localStorage.getItem('Theme') || String(Object.keys(this.themes)[0]);
        this.apply(currentThemeKeyName);
        this.themeSelectorInstance.addOptionsInList(this.themes);
        this.themeSelectorInstance.toggleCurrentOption(this.themes[currentThemeKeyName].name);
        this.themeSelectorInstance.optionListToggleListener();
        this.themeSelectorInstance.addThemeChangeHandler(this.apply);
    }

    applyThemeData(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
    }

    applyThemeBackground(themeBackground) {
        this.backgroundInstance.setBackground(themeBackground);
    }

    runCleanup() {
        if (this.cleanupFunctions.length > 0) {
            this.cleanupFunctions.forEach(cleanup => {
                if (typeof cleanup === 'function') cleanup();
            });
            this.cleanupFunctions = [];
        }
    }

    runAdditionalScripts(scripts) {
        if (!scripts || !Array.isArray(scripts)) return;
        scripts.forEach(scriptFunc => {
            try {
                const cleanupFunc = scriptFunc();
                if (cleanupFunc) {
                    this.cleanupFunctions.push(cleanupFunc);
                }
            } catch (err) {
                console.error('Error running additional script', err);
            }
        });
    }

}
