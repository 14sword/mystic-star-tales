/**
 * Lightweight app event bus used by the PWA shell, offline store, sync, and auth.
 */

(function () {
    window.MysticApp = window.MysticApp || {};

    class MysticEventBus {
        constructor() {
            this.target = document.createDocumentFragment();
        }

        on(type, handler) {
            this.target.addEventListener(type, handler);
            return () => this.off(type, handler);
        }

        off(type, handler) {
            this.target.removeEventListener(type, handler);
        }

        emit(type, detail = {}) {
            this.target.dispatchEvent(new CustomEvent(type, { detail }));
            document.dispatchEvent(new CustomEvent(`mystic:${type}`, { detail }));
        }
    }

    window.MysticApp.events = window.MysticApp.events || new MysticEventBus();
})();
