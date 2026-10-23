// main.tsx — Written as a global script (zero module imports/exports)
// Relies on global window.React, window.ReactDOM, and window.App

interface Window {
React: any;
ReactDOM: any;
App: any;
}

(function () {
const globalWindow = window as any;
const rootElement = document.getElementById('root');

if (rootElement && globalWindow.ReactDOM && globalWindow.React) {
    const root = globalWindow.ReactDOM.createRoot(rootElement);
    if (globalWindow.App) {
    root.render(globalWindow.React.createElement(globalWindow.App));
    }
}
})();