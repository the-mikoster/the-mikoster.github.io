import { themes } from './components/theme/themes-config.js';
import { ThemeManager } from './components/theme/theme-manager.js';
import { Background } from './components/theme/background.js';
import { ThemeSelector } from './components/theme/theme-selector.js';

const backgroundElem = document.querySelector('.background');

const themeSelectorElems = {
    currentOption: document.querySelector('.theme-selector__current-option'),
    currentOptionLabel: document.querySelector('.theme-selector__current-option-label'),
    optionsList: document.querySelector('.theme-selector__options-list')
}
const themeSelectorClassNames = {
    active: 'active',
    hidden: 'hidden',
    option: 'theme-selector__option', 
    optionLabel: 'theme-selector__option-label',
    optionIcon: 'theme-selector__option-icon'
}

const backgroundInstance = new Background(backgroundElem);
const themeSelectorInstance = new ThemeSelector(themes, themeSelectorElems, themeSelectorClassNames);
const themeManagerInstance = new ThemeManager(themes, backgroundInstance, themeSelectorInstance);

try {
    themeManagerInstance.init();
} catch (err) {
    console.error('Failed to initialize theme manager', err);
}
