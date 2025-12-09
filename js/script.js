import { themes } from './components/theme/themes-config.js';
import { ThemeManager } from './components/theme/theme-manager.js';
import { ThemeBackground } from './components/theme/theme-background.js';
import { ThemeSelector } from './components/theme/theme-selector.js';
import { NotificationManager } from './components/notification-manager.js';

const backgroundElem = document.querySelector('.background');
const notificationsWrapperElem = document.querySelector('.notifications-wrapper');

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

const notificationTypes = ['info', 'warning', 'error'];

const notificationManagerInstance = new NotificationManager(notificationTypes, notificationsWrapperElem);
const backgroundInstance = new ThemeBackground(backgroundElem, notificationManagerInstance);
const themeSelectorInstance = new ThemeSelector(themes, themeSelectorElems, themeSelectorClassNames);
const themeManagerInstance = new ThemeManager(themes, backgroundInstance, themeSelectorInstance);

document.addEventListener('DOMContentLoaded', () => {
    try {
        themeManagerInstance.init();
    } catch (err) {
        console.error('Failed to initialize theme manager', err);
    }
});
