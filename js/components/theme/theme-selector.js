export class ThemeSelector {
    constructor(themes, elements, classNames) {
        this.themes = themes;

        this.currentOptionElem = elements.currentOption;
        this.currentOptionLabelElem = elements.currentOptionLabel;
        this.optionsListElem = elements.optionsList;

        this.activeElemClassName = classNames.active;
        this.hiddenElemClassName = classNames.hidden;
        this.optionElemClassName = classNames.option;
        this.optionLabelElemClassName = classNames.optionLabel;
        this.optionIconElemClassName = classNames.optionIcon;

        this.animationDuration = 200;
    }

    addOptionsInList(themes) {
        this.optionsListElem.innerHTML = '';

        for (const themeKey in themes) {
            const themeName = themes[themeKey].name;

            const option = document.createElement('div');
            option.classList.add(this.optionElemClassName);
            option.dataset.themeKey = themeKey;

            const optionLabel = document.createElement('p');
            optionLabel.classList.add(this.optionLabelElemClassName);
            optionLabel.textContent = themeName; 
            option.appendChild(optionLabel);

            const iconHTML = `
                <svg class="${this.optionIconElemClassName}" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3">
                    <path d="m424-296 282-282-56-56-226 226-114-114-56 56 170 170Zm56 216q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                </svg>
            `;
            option.insertAdjacentHTML('beforeend', iconHTML);

            this.optionsListElem.appendChild(option);
        }
    }

    toggleCurrentOption(themeName) {
        this.currentOptionElem.classList.add(this.hiddenElemClassName);

        setTimeout(() => {
            this.currentOptionLabelElem.textContent = themeName;
            this.currentOptionElem.classList.remove(this.hiddenElemClassName);
        }, this.animationDuration);

        const options = this.optionsListElem.querySelectorAll(`.${this.optionElemClassName}`);
        options.forEach(option => {
            const optionLabel = option.querySelector(`.${this.optionLabelElemClassName}`)
            if (optionLabel.textContent === themeName) {
                option.classList.add(this.activeElemClassName);
            } else {
                option.classList.remove(this.activeElemClassName);
            }
        });
    }

    openOptionsList() {
        this.optionsListElem.classList.add(this.activeElemClassName);
        this.currentOptionElem.classList.add(this.activeElemClassName);
    }

    closeOptionsList() {
        this.optionsListElem.classList.remove(this.activeElemClassName);
        this.currentOptionElem.classList.remove(this.activeElemClassName);
    }

    optionListToggleListener() {
        this.currentOptionElem.addEventListener('click', () => {
            const isOpen = this.optionsListElem.classList.contains(this.activeElemClassName);
            
            if (isOpen) {
                this.closeOptionsList();
            } else {
                this.openOptionsList();
            }
        });
    }

    addThemeChangeHandler(onThemeSelected) {
        this.optionsListElem.addEventListener('click', (e) => { 
            const option = e.target.closest(`.${this.optionElemClassName}`);

            if (option) {
                const themeKey = option.dataset.themeKey;
                const themeName = this.themes[themeKey].name;

                if (option.classList.contains(this.activeElemClassName)) {
                    return;
                }
                
                this.toggleCurrentOption(themeName);

                setTimeout(() => { 
                    this.closeOptionsList(); 
                }, this.animationDuration);

                if (typeof onThemeSelected === 'function') {
                    onThemeSelected(themeKey);
                }
            } else {
                return;
            }
        });
    }
}
