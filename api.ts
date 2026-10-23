// api.ts — Written as a global script (zero module imports/exports)
// Access globally anywhere via window.api.discoverObject(...), etc.

interface Window {
api: any;
}

(function () {
const apiClient = {
    async discoverObject(formData: FormData) {
    const res = await fetch('/api/discover', { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Discovery analysis failed.');
    return res.json();
    },

    async getDiscovery(id: string) {
    const res = await fetch(`/api/discover/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error('Discovery not found.');
    return res.json();
    },

    async submitClarification(id: string, answers: Record<string, string>) {
    const res = await fetch(`/api/discover/${encodeURIComponent(id)}/clarify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
    });
    if (!res.ok) throw new Error('Clarification submission failed.');
    return res.json();
    },

    async confirmDisposal(id: string, followed_route: string) {
    const res = await fetch(`/api/discover/${encodeURIComponent(id)}/confirm-disposal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followed_route }),
    });
    if (!res.ok) throw new Error('Disposal confirmation failed.');
    return res.json();
    },

    async generateRecreate(discoveryId: string, constraints: any) {
    const res = await fetch(`/api/discover/${encodeURIComponent(discoveryId)}/recreate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(constraints),
    });
    if (!res.ok) throw new Error('Project generation failed.');
    return res.json();
    },

    async getProject(projectId: string) {
    const res = await fetch(`/api/recreate/${encodeURIComponent(projectId)}`);
    if (!res.ok) throw new Error('Project not found.');
    return res.json();
    },

    async completeProject(projectId: string) {
    const res = await fetch(`/api/recreate/${encodeURIComponent(projectId)}/complete`, { method: 'POST' });
    if (!res.ok) throw new Error('Completion action failed.');
    return res.json();
    },

    async getCollection() {
    const res = await fetch('/api/collection');
    if (!res.ok) throw new Error('Collection retrieval failed.');
    return res.json();
    },

    async getJourney() {
    const res = await fetch('/api/journey');
    if (!res.ok) throw new Error('Journey retrieval failed.');
    return res.json();
    },

    async getGuide() {
    const res = await fetch('/api/guide');
    if (!res.ok) throw new Error('Guide retrieval failed.');
    return res.json();
    }
};

window.api = apiClient;
})();