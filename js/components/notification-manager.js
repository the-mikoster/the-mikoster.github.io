export class NotificationManager {
    constructor(notificationTypes, notificationWrapperElem) {
        this.notificationTypes = notificationTypes;
        this.notificationWrapperElem = notificationWrapperElem;
        this.currentNotifications = [];
        this.animationDelay = +getComputedStyle(document.documentElement).getPropertyValue('--transition-duration').trim().slice(0, -1) * 1000 || 200;
    }

    showMessage(type, message, duration = undefined) {
        if (!this.notificationTypes.includes(type)) {
            console.error(`Unsupported notification type: ${type}`)
            return;
        };

        const notification = document.createElement('p');
        notification.className = `notification notification__${type} hidden-on-left`;
        notification.insertAdjacentText('beforeend', `${message}`);

        this.notificationWrapperElem.append(notification);
        this.currentNotifications.push(notification);

        setTimeout(() => {
            notification.classList.remove('hidden-on-left');
        }, this.animationDelay);

        if (duration) {
            setTimeout(() => {
                this.this.closeSingleMessage(notification);
            }, duration);
        }

        return notification;
    }

    hideSingleMessage(notification) {
        const index = this.currentNotifications.indexOf(notification);
        if (index !== -1) {
          this.currentNotifications.splice(index, 1);
        }

        notification.classList.add('hidden-on-left');
        setTimeout(() => {
            notification.classList.add('hidden-height');
        }, this.animationDelay);

        setTimeout(() => {
            notification.remove();
        }, this.animationDelay);
    }

    closeAllMessages() {
        this.currentNotifications.forEach(notif => this.hideSingleMessage(notif));
        this.currentNotifications = [];
    }
}

