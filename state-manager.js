/**
 * State Manager
 * Manages application state and localStorage persistence
 */

export class StateManager {
    constructor() {
        this.storageKey = 'itil4-agent-state';
        this.state = this.loadState();
    }

    /**
     * Load state from localStorage
     */
    loadState() {
        try {
            const savedState = localStorage.getItem(this.storageKey);
            return savedState ? JSON.parse(savedState) : this.getDefaultState();
        } catch (error) {
            console.error('Error loading state:', error);
            return this.getDefaultState();
        }
    }

    /**
     * Get default state structure
     */
    getDefaultState() {
        return {
            apiKey: null,
            settings: {
                maxResults: 5,
                searchDepth: 'advanced',
                theme: 'light'
            },
            missions: [],
            currentMission: null
        };
    }

    /**
     * Save state to localStorage
     */
    saveState() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.state));
        } catch (error) {
            console.error('Error saving state:', error);
        }
    }

    /**
     * Get API key
     */
    getApiKey() {
        return this.state.apiKey;
    }

    /**
     * Set API key
     */
    setApiKey(apiKey) {
        this.state.apiKey = apiKey;
        this.saveState();
    }

    /**
     * Get settings
     */
    getSettings() {
        return { ...this.state.settings };
    }

    /**
     * Update settings
     */
    updateSettings(settings) {
        this.state.settings = {
            ...this.state.settings,
            ...settings
        };
        this.saveState();
    }

    /**
     * Get theme
     */
    getTheme() {
        return this.state.settings.theme;
    }

    /**
     * Set theme
     */
    setTheme(theme) {
        this.state.settings.theme = theme;
        this.saveState();
    }

    /**
     * Add a new mission to history
     */
    addMission(mission) {
        const missionWithId = {
            ...mission,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };

        this.state.missions.unshift(missionWithId);
        
        // Keep only the last 50 missions
        if (this.state.missions.length > 50) {
            this.state.missions = this.state.missions.slice(0, 50);
        }

        this.saveState();
        return missionWithId;
    }

    /**
     * Update an existing mission
     */
    updateMission(missionId, updates) {
        const index = this.state.missions.findIndex(m => m.id === missionId);
        if (index !== -1) {
            this.state.missions[index] = {
                ...this.state.missions[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveState();
            return this.state.missions[index];
        }
        return null;
    }

    /**
     * Get mission by ID
     */
    getMission(missionId) {
        return this.state.missions.find(m => m.id === missionId);
    }

    /**
     * Get all missions
     */
    getAllMissions() {
        return [...this.state.missions];
    }

    /**
     * Delete a mission
     */
    deleteMission(missionId) {
        this.state.missions = this.state.missions.filter(m => m.id !== missionId);
        this.saveState();
    }

    /**
     * Clear all missions
     */
    clearMissions() {
        this.state.missions = [];
        this.state.currentMission = null;
        this.saveState();
    }

    /**
     * Set current mission
     */
    setCurrentMission(mission) {
        this.state.currentMission = mission;
        // Don't save to localStorage - current mission is session-based
    }

    /**
     * Get current mission
     */
    getCurrentMission() {
        return this.state.currentMission;
    }

    /**
     * Clear current mission
     */
    clearCurrentMission() {
        this.state.currentMission = null;
    }

    /**
     * Export mission as JSON
     */
    exportMissionAsJSON(missionId) {
        const mission = this.getMission(missionId);
        if (!mission) return null;

        const exportData = {
            mission: mission.mission,
            steps: mission.steps,
            results: mission.results,
            exportedAt: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Export mission as Markdown
     */
    exportMissionAsMarkdown(missionId) {
        const mission = this.getMission(missionId);
        if (!mission) return null;

        let markdown = `# ITIL 4 Change Enablement Analysis\n\n`;
        markdown += `## Mission\n${mission.mission}\n\n`;
        markdown += `## Execution Date\n${new Date(mission.createdAt).toLocaleString()}\n\n`;
        
        if (mission.steps && mission.steps.length > 0) {
            markdown += `## Analysis Steps\n\n`;
            mission.steps.forEach((step, index) => {
                markdown += `### Step ${index + 1}: ${step.title}\n`;
                markdown += `${step.description}\n\n`;
                
                if (step.result) {
                    markdown += `**Findings:**\n${step.result}\n\n`;
                }

                if (step.sources && step.sources.length > 0) {
                    markdown += `**Sources:**\n`;
                    step.sources.forEach(source => {
                        markdown += `- [${source.title}](${source.url})\n`;
                    });
                    markdown += `\n`;
                }
            });
        }

        if (mission.results && mission.results.summary) {
            markdown += `## Summary\n${mission.results.summary}\n\n`;
        }

        if (mission.results && mission.results.recommendations) {
            markdown += `## Recommendations\n${mission.results.recommendations}\n\n`;
        }

        markdown += `---\n\n`;
        markdown += `*Generated by ITIL 4 Change Enablement Agent*\n`;

        return markdown;
    }

    /**
     * Generate a unique ID
     */
    generateId() {
        return `mission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Clear all data (factory reset)
     */
    clearAllData() {
        this.state = this.getDefaultState();
        this.saveState();
    }
}

export default StateManager;
