export class ThemeManager {
    constructor(themes, backgroundInstance) {
        this.themes = themes;
        this.backgroundInstance = backgroundInstance;
    }

    init() {
        const currentThemeName = localStorage.getItem('ThemeName') || Object.keys(this.themes)[0];
        const theme = this.themes[currentThemeName];
        this.apply(theme);
    }

    apply(theme) {
        this.applyThemeData(theme.name);
        this.applyThemeBackground(theme.background);
    }

    applyThemeData(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
    }

    applyThemeBackground(themeBackground) {
        this.backgroundInstance.clearBackground();
        this.backgroundInstance.setBackground(themeBackground);
    }
}