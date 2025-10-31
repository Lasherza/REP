/**
 * Main Application
 * Orchestrates all components and handles UI interactions
 */

import TavilyClient from './tavily-client.js';
import StateManager from './state-manager.js';
import DocumentParser from './document-parser.js';
import MissionPlanner from './mission-planner.js';
import StepExecutor from './step-executor.js';
import ResultsRenderer from './results-renderer.js';

class App {
    constructor() {
        this.stateManager = new StateManager();
        this.tavilyClient = new TavilyClient(this.stateManager.getApiKey());
        this.documentParser = new DocumentParser();
        this.missionPlanner = new MissionPlanner();
        this.stepExecutor = new StepExecutor(this.tavilyClient);
        this.resultsRenderer = new ResultsRenderer();

        this.currentMission = null;
        this.currentSteps = [];
        this.executionResults = [];
        this.currentDocument = null;

        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        console.log('Initializing ITIL 4 Change Enablement Agent...');

        // Apply saved theme
        this.applyTheme(this.stateManager.getTheme());

        // Initialize UI elements
        this.initializeUIElements();

        // Set up event listeners
        this.setupEventListeners();

        // Load mission history
        this.loadMissionHistory();

        // Check API configuration
        this.checkApiConfiguration();

        console.log('Application initialized successfully');
    }

    /**
     * Initialize UI element references
     */
    initializeUIElements() {
        try {
            // Input elements
            this.missionInput = document.getElementById('mission-input');
            this.charCount = document.getElementById('char-count');
            this.startMissionBtn = document.getElementById('start-mission');
            
            if (!this.missionInput || !this.startMissionBtn) {
                console.error('Critical elements missing:', {
                    missionInput: !!this.missionInput,
                    startMissionBtn: !!this.startMissionBtn
                });
            }

        // Section containers
        this.missionInputSection = document.getElementById('mission-input-section');
        this.missionBreakdownSection = document.getElementById('mission-breakdown-section');
        this.executionSection = document.getElementById('execution-section');
        this.resultsSection = document.getElementById('results-section');

        // Breakdown elements
        this.breakdownContainer = document.getElementById('breakdown-container');
        this.editBreakdownBtn = document.getElementById('edit-breakdown');
        this.executeMissionBtn = document.getElementById('execute-mission');

        // Execution elements
        this.progressBar = document.getElementById('progress-bar');
        this.progressText = document.getElementById('progress-text');
        this.executionStatus = document.getElementById('execution-status');
        this.stepsContainer = document.getElementById('steps-container');

        // Results elements
        this.resultsContainer = document.getElementById('results-container');
        this.exportMarkdownBtn = document.getElementById('export-markdown');
        this.exportJsonBtn = document.getElementById('export-json');
        this.newMissionBtn = document.getElementById('new-mission');

        // History
        this.historyList = document.getElementById('history-list');
        this.clearHistoryBtn = document.getElementById('clear-history');

        // Settings
        this.settingsModal = document.getElementById('settings-modal');
        this.settingsBtn = document.getElementById('settings-button');
        this.closeSettingsBtn = document.getElementById('close-settings');
        this.saveSettingsBtn = document.getElementById('save-settings');
        this.apiKeyInput = document.getElementById('api-key-input');
        this.toggleApiKeyBtn = document.getElementById('toggle-api-key');
        this.apiStatus = document.getElementById('api-status');
        this.maxResultsInput = document.getElementById('max-results');
        this.searchDepthSelect = document.getElementById('search-depth');

        // Theme toggle
        this.themeToggle = document.getElementById('theme-toggle');

        // Document upload elements
        this.uploadDropzone = document.getElementById('upload-dropzone');
        this.fileInput = document.getElementById('file-input');
        this.uploadedDocument = document.getElementById('uploaded-document');
        this.documentName = document.getElementById('document-name');
        this.documentMeta = document.getElementById('document-meta');
        this.documentCharacteristics = document.getElementById('document-characteristics');
        this.documentScoreFill = document.getElementById('document-score-fill');
        this.documentScoreValue = document.getElementById('document-score-value');
        this.alignmentStrengths = document.getElementById('alignment-strengths');
        this.alignmentGaps = document.getElementById('alignment-gaps');
        this.removeDocumentBtn = document.getElementById('remove-document');

        // Set results renderer container
        this.resultsRenderer.setContainer(this.resultsContainer);
        
        console.log('? UI elements initialized successfully');
        } catch (error) {
            console.error('? Error initializing UI elements:', error);
            throw error;
        }
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        try {
            console.log('Setting up event listeners...');
            
            // Mission input
            this.missionInput.addEventListener('input', () => this.handleMissionInput());
            this.startMissionBtn.addEventListener('click', () => this.handleStartMission());
            console.log('? Mission input listeners set up');

        // Breakdown controls
        this.editBreakdownBtn.addEventListener('click', () => this.handleEditBreakdown());
        this.executeMissionBtn.addEventListener('click', () => this.handleExecuteMission());

        // Results controls
        this.exportMarkdownBtn.addEventListener('click', () => this.handleExportMarkdown());
        this.exportJsonBtn.addEventListener('click', () => this.handleExportJson());
        this.newMissionBtn.addEventListener('click', () => this.handleNewMission());

        // History
        this.clearHistoryBtn.addEventListener('click', () => this.handleClearHistory());

        // Settings
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        this.closeSettingsBtn.addEventListener('click', () => this.closeSettings());
        this.saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
        this.toggleApiKeyBtn.addEventListener('click', () => this.toggleApiKeyVisibility());

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        // Document upload
        this.uploadDropzone.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.removeDocumentBtn.addEventListener('click', () => this.handleRemoveDocument());
        
        // Drag and drop
        this.uploadDropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.uploadDropzone.classList.add('dragover');
        });
        this.uploadDropzone.addEventListener('dragleave', () => {
            this.uploadDropzone.classList.remove('dragover');
        });
        this.uploadDropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.uploadDropzone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload({ target: { files: e.dataTransfer.files } });
            }
        });

        // Close modal on backdrop click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettings();
            }
        });

        // Example mission cards
        this.setupExampleMissions();
        
        console.log('? All event listeners set up successfully');
        } catch (error) {
            console.error('? Error setting up event listeners:', error);
            throw error;
        }
    }

    /**
     * Set up example mission click handlers
     */
    setupExampleMissions() {
        const exampleCards = document.querySelectorAll('.example-card');
        exampleCards.forEach(card => {
            card.addEventListener('click', () => {
                const mission = card.getAttribute('data-mission');
                if (mission) {
                    this.missionInput.value = mission;
                    this.handleMissionInput();
                    // Smooth scroll to mission input
                    this.missionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Focus the textarea
                    setTimeout(() => {
                        this.missionInput.focus();
                    }, 500);
                    console.log('Example mission loaded:', card.querySelector('h4').textContent);
                }
            });
        });
        console.log(`${exampleCards.length} example missions configured`);
    }

    /**
     * Handle mission input changes
     */
    handleMissionInput() {
        const value = this.missionInput.value.trim();
        const length = value.length;

        this.charCount.textContent = `${length} characters`;
        this.startMissionBtn.disabled = length < 20;
        console.log(`Input: ${length} chars, button ${this.startMissionBtn.disabled ? 'disabled' : 'enabled'}`);
    }

    /**
     * Handle start mission
     */
    async handleStartMission() {
        console.log('?? handleStartMission called!');
        const mission = this.missionInput.value.trim();
        console.log('Mission text:', mission);

        // Validate mission
        const validation = this.missionPlanner.validateMission(mission);
        if (!validation.valid) {
            alert(validation.error);
            return;
        }

        // Check API configuration
        if (!this.tavilyClient.isConfigured()) {
            alert('Please configure your Tavily API key in settings before starting a mission.');
            this.openSettings();
            return;
        }

        // Plan the mission (with optional document)
        const document = this.stateManager.getCurrentDocument();
        const steps = this.missionPlanner.planMission(mission, document);
        this.currentMission = mission;
        this.currentSteps = steps;

        // Show breakdown section
        this.showSection('breakdown');
        this.renderBreakdown(steps);
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            // Show loading state
            this.uploadDropzone.style.opacity = '0.5';
            this.uploadDropzone.style.pointerEvents = 'none';

            // Parse the document
            const parsedDocument = await this.documentParser.parseFile(file);
            
            // Get ITIL 4 alignment assessment
            const itil4Assessment = this.documentParser.assessITIL4Alignment(
                parsedDocument.analysis,
                parsedDocument.content
            );
            parsedDocument.itil4Assessment = itil4Assessment;

            // Store in state
            this.stateManager.setCurrentDocument(parsedDocument);
            this.currentDocument = parsedDocument;

            // Display the document
            this.displayUploadedDocument(parsedDocument);

            // Reset file input
            this.fileInput.value = '';

        } catch (error) {
            console.error('File upload error:', error);
            alert(`Failed to upload file: ${error.message}`);
        } finally {
            this.uploadDropzone.style.opacity = '1';
            this.uploadDropzone.style.pointerEvents = 'auto';
        }
    }

    /**
     * Display uploaded document information
     */
    displayUploadedDocument(document) {
        // Hide dropzone, show document info
        this.uploadDropzone.classList.add('hidden');
        this.uploadedDocument.classList.remove('hidden');

        // Set document name and metadata
        this.documentName.textContent = document.filename;
        const sizeKB = (document.size / 1024).toFixed(2);
        this.documentMeta.textContent = `Type: ${document.analysis.type} | Steps: ${document.analysis.stepCount} | Size: ${sizeKB} KB`;

        // Display characteristics
        this.documentCharacteristics.innerHTML = '';
        document.analysis.characteristics.forEach(char => {
            const tag = document.createElement('span');
            tag.className = 'characteristic-tag';
            if (char.toLowerCase().includes('rollback') || char.toLowerCase().includes('validation')) {
                tag.classList.add('positive');
            }
            tag.textContent = char;
            this.documentCharacteristics.appendChild(tag);
        });

        // Display ITIL 4 alignment score
        const assessment = document.itil4Assessment;
        this.documentScoreFill.style.width = `${assessment.score}%`;
        this.documentScoreValue.textContent = `${assessment.score}%`;

        // Display strengths
        const strengthsList = this.alignmentStrengths.querySelector('ul');
        strengthsList.innerHTML = '';
        assessment.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });

        // Display gaps
        const gapsList = this.alignmentGaps.querySelector('ul');
        gapsList.innerHTML = '';
        assessment.gaps.forEach(gap => {
            const li = document.createElement('li');
            li.textContent = gap;
            gapsList.appendChild(li);
        });
    }

    /**
     * Handle remove document
     */
    handleRemoveDocument() {
        this.stateManager.clearCurrentDocument();
        this.currentDocument = null;
        this.uploadDropzone.classList.remove('hidden');
        this.uploadedDocument.classList.add('hidden');
        this.fileInput.value = '';
    }

    /**
     * Render mission breakdown
     */
    renderBreakdown(steps) {
        this.breakdownContainer.innerHTML = '';

        steps.forEach((step, index) => {
            const stepElement = document.createElement('div');
            stepElement.className = 'breakdown-step fade-in';
            stepElement.innerHTML = `
                <div class="step-number">${index + 1}</div>
                <div class="step-content">
                    <div class="step-title">${this.escapeHtml(step.title)}</div>
                    <div class="step-description">${this.escapeHtml(step.description)}</div>
                </div>
            `;
            this.breakdownContainer.appendChild(stepElement);
        });
    }

    /**
     * Handle edit breakdown
     */
    handleEditBreakdown() {
        this.showSection('input');
    }

    /**
     * Handle execute mission
     */
    async handleExecuteMission() {
        this.showSection('execution');
        this.prepareExecutionUI();

        try {
            // Execute steps with progress tracking
            await this.stepExecutor.executeSteps(
                this.currentSteps,
                (progress) => this.handleExecutionProgress(progress)
            );

            // Mission completed successfully
            this.executionStatus.textContent = 'Completed';
            this.executionStatus.className = 'status-badge completed';

            // Generate and show results
            await this.generateResults();

        } catch (error) {
            console.error('Execution error:', error);
            this.executionStatus.textContent = 'Error';
            this.executionStatus.className = 'status-badge error';
            this.stopElapsedTime();
            alert(`Mission execution failed: ${error.message}`);
        }
    }

    /**
     * Prepare execution UI
     */
    prepareExecutionUI() {
        this.stepsContainer.innerHTML = '';
        this.progressBar.style.width = '0%';
        this.progressText.textContent = `Step 0 of ${this.currentSteps.length}`;
        this.executionStatus.textContent = 'In Progress';
        this.executionStatus.className = 'status-badge in-progress';
        this.executionResults = [];
        
        // Initialize timeline
        this.initializeTimeline();
        
        // Initialize progress markers
        this.initializeProgressMarkers();
        
        // Initialize stats
        this.updateExecutionStats(0, 0, this.currentSteps.length);
        
        // Start elapsed time counter
        this.startElapsedTime();
    }

    /**
     * Initialize step timeline
     */
    initializeTimeline() {
        const timeline = document.getElementById('step-timeline');
        timeline.innerHTML = '';
        
        this.currentSteps.forEach((step, index) => {
            const item = document.createElement('div');
            item.className = 'timeline-item pending';
            item.id = `timeline-${index}`;
            item.innerHTML = `
                <div class="timeline-dot">${index + 1}</div>
                <div class="timeline-label">${this.truncateText(step.title, 15)}</div>
            `;
            timeline.appendChild(item);
        });
    }

    /**
     * Initialize progress markers
     */
    initializeProgressMarkers() {
        const markers = document.getElementById('progress-markers');
        markers.innerHTML = '';
        
        // Add markers for each step (except first and last)
        for (let i = 1; i < this.currentSteps.length; i++) {
            const marker = document.createElement('div');
            marker.className = 'progress-marker';
            marker.style.left = `${(i / this.currentSteps.length) * 100}%`;
            markers.appendChild(marker);
        }
    }

    /**
     * Start elapsed time counter
     */
    startElapsedTime() {
        this.executionStartTime = Date.now();
        this.elapsedTimeInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.executionStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            document.getElementById('elapsed-time').textContent = timeString;
        }, 1000);
    }

    /**
     * Stop elapsed time counter
     */
    stopElapsedTime() {
        if (this.elapsedTimeInterval) {
            clearInterval(this.elapsedTimeInterval);
            this.elapsedTimeInterval = null;
        }
    }

    /**
     * Update execution statistics
     */
    updateExecutionStats(completed, active, pending) {
        document.getElementById('completed-count').textContent = completed;
        document.getElementById('active-count').textContent = active;
        document.getElementById('pending-count').textContent = pending;
    }

    /**
     * Update timeline item status
     */
    updateTimelineItem(index, status) {
        const item = document.getElementById(`timeline-${index}`);
        if (item) {
            item.className = `timeline-item ${status}`;
            if (status === 'completed') {
                const dot = item.querySelector('.timeline-dot');
                dot.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                `;
            }
        }
    }

    /**
     * Handle execution progress updates
     */
    handleExecutionProgress(progress) {
        if (progress.type === 'step_start') {
            this.addExecutionStep(progress.step, progress.stepIndex);
            this.progressText.textContent = `Step ${progress.stepIndex + 1} of ${this.currentSteps.length}`;
            
            // Update timeline
            this.updateTimelineItem(progress.stepIndex, 'active');
            
            // Update stats
            const completed = progress.stepIndex;
            const active = 1;
            const pending = this.currentSteps.length - progress.stepIndex - 1;
            this.updateExecutionStats(completed, active, pending);
        }

        if (progress.type === 'step_progress') {
            this.updateExecutionStep(progress.stepIndex, progress.status);
        }

        if (progress.type === 'step_complete') {
            this.completeExecutionStep(progress.stepIndex, progress.result);
            this.executionResults.push(progress.result);
            this.progressBar.style.width = `${progress.progress}%`;
            
            // Update timeline
            this.updateTimelineItem(progress.stepIndex, 'completed');
            
            // Update stats
            const completed = progress.stepIndex + 1;
            const active = completed < this.currentSteps.length ? 1 : 0;
            const pending = this.currentSteps.length - completed - active;
            this.updateExecutionStats(completed, active, pending);
            
            // Stop timer when complete
            if (completed === this.currentSteps.length) {
                this.stopElapsedTime();
            }
        }
    }

    /**
     * Add execution step to UI
     */
    addExecutionStep(step, index) {
        const stepElement = document.createElement('div');
        stepElement.className = 'execution-step active fade-in';
        stepElement.id = `execution-step-${index}`;
        stepElement.innerHTML = `
            <div class="step-header">
                <div class="step-icon">
                    <div class="spinner"></div>
                </div>
                <div class="step-info">
                    <h3>${this.escapeHtml(step.title)}</h3>
                    <p>Searching and analyzing...</p>
                </div>
            </div>
            <div class="step-body" style="display: none;"></div>
        `;
        this.stepsContainer.appendChild(stepElement);
        stepElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    /**
     * Update execution step status
     */
    updateExecutionStep(index, status) {
        const stepElement = document.getElementById(`execution-step-${index}`);
        if (!stepElement) return;

        if (status === 'completed') {
            stepElement.classList.remove('active');
            stepElement.classList.add('completed');
        } else if (status === 'error') {
            stepElement.classList.remove('active');
            stepElement.classList.add('error');
        }
    }

    /**
     * Complete execution step with results
     */
    completeExecutionStep(index, result) {
        const stepElement = document.getElementById(`execution-step-${index}`);
        if (!stepElement) return;

        const icon = stepElement.querySelector('.step-icon');
        const info = stepElement.querySelector('.step-info p');
        const body = stepElement.querySelector('.step-body');

        if (result.status === 'completed' && result.analysis) {
            icon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            info.textContent = 'Completed successfully';

            // Add results to body
            body.innerHTML = `
                <div class="step-result">
                    ${this.escapeHtml(result.analysis.summary)}
                </div>
            `;

            if (result.analysis.sources && result.analysis.sources.length > 0) {
                const sourcesDiv = document.createElement('div');
                sourcesDiv.className = 'step-sources';
                sourcesDiv.innerHTML = `
                    <h4>Sources (${result.analysis.sources.length})</h4>
                    ${result.analysis.sources.slice(0, 3).map(source => 
                        `<a href="${this.escapeHtml(source.url)}" target="_blank" class="source-link">${this.escapeHtml(source.title)}</a>`
                    ).join('')}
                `;
                body.appendChild(sourcesDiv);
            }

            body.style.display = 'block';
        } else {
            icon.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
            `;
            info.textContent = `Error: ${result.error || 'Unknown error'}`;
        }

        stepElement.classList.remove('active');
        stepElement.classList.add(result.status === 'completed' ? 'completed' : 'error');
    }

    /**
     * Generate comprehensive results
     */
    async generateResults() {
        this.showSection('results');
        this.resultsRenderer.showLoading();

        try {
            // Create comprehensive report
            const report = this.stepExecutor.createComprehensiveReport(this.executionResults);

            // Render results
            this.resultsRenderer.renderResults(report);

            // Save to history
            this.saveMissionToHistory(report);

        } catch (error) {
            console.error('Error generating results:', error);
            this.resultsRenderer.showError(error.message);
        }
    }

    /**
     * Save mission to history
     */
    saveMissionToHistory(report) {
        const missionData = {
            mission: this.currentMission,
            steps: this.currentSteps,
            results: report,
            status: 'completed'
        };

        this.stateManager.addMission(missionData);
        this.loadMissionHistory();
    }

    /**
     * Load and display mission history
     */
    loadMissionHistory() {
        const missions = this.stateManager.getAllMissions();

        if (missions.length === 0) {
            this.historyList.innerHTML = `
                <div class="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                    </svg>
                    <p>No missions yet</p>
                </div>
            `;
            return;
        }

        this.historyList.innerHTML = '';
        missions.forEach(mission => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-item-title">${this.escapeHtml(this.truncateText(mission.mission, 60))}</div>
                <div class="history-item-date">${this.formatDate(mission.createdAt)}</div>
            `;
            item.addEventListener('click', () => this.loadMissionFromHistory(mission));
            this.historyList.appendChild(item);
        });
    }

    /**
     * Load a mission from history
     */
    loadMissionFromHistory(mission) {
        // Not fully implemented - would load and display previous mission
        alert('Loading previous missions will be implemented in a future update.');
    }

    /**
     * Handle export as Markdown
     */
    handleExportMarkdown() {
        const missions = this.stateManager.getAllMissions();
        if (missions.length === 0) return;

        const latestMission = missions[0];
        const markdown = this.stateManager.exportMissionAsMarkdown(latestMission.id);

        if (markdown) {
            this.downloadFile(markdown, 'mission-report.md', 'text/markdown');
        }
    }

    /**
     * Handle export as JSON
     */
    handleExportJson() {
        const missions = this.stateManager.getAllMissions();
        if (missions.length === 0) return;

        const latestMission = missions[0];
        const json = this.stateManager.exportMissionAsJSON(latestMission.id);

        if (json) {
            this.downloadFile(json, 'mission-report.json', 'application/json');
        }
    }

    /**
     * Download file helper
     */
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Handle new mission
     */
    handleNewMission() {
        this.currentMission = null;
        this.currentSteps = [];
        this.executionResults = [];
        this.missionInput.value = '';
        this.handleMissionInput();
        
        // Clear document if present
        if (this.currentDocument) {
            this.handleRemoveDocument();
        }
        
        this.showSection('input');
    }

    /**
     * Handle clear history
     */
    handleClearHistory() {
        if (confirm('Are you sure you want to clear all mission history? This cannot be undone.')) {
            this.stateManager.clearMissions();
            this.loadMissionHistory();
        }
    }

    /**
     * Open settings modal
     */
    openSettings() {
        this.settingsModal.classList.remove('hidden');
        
        // Load current settings
        const settings = this.stateManager.getSettings();
        this.apiKeyInput.value = this.stateManager.getApiKey() || '';
        this.maxResultsInput.value = settings.maxResults;
        this.searchDepthSelect.value = settings.searchDepth;

        this.updateApiStatus();
    }

    /**
     * Close settings modal
     */
    closeSettings() {
        this.settingsModal.classList.add('hidden');
    }

    /**
     * Handle save settings
     */
    async handleSaveSettings() {
        const apiKey = this.apiKeyInput.value.trim();
        const maxResults = parseInt(this.maxResultsInput.value);
        const searchDepth = this.searchDepthSelect.value;

        // Save API key
        if (apiKey) {
            this.stateManager.setApiKey(apiKey);
            this.tavilyClient.setApiKey(apiKey);
        }

        // Save settings
        this.stateManager.updateSettings({
            maxResults,
            searchDepth
        });

        // Update Tavily client options
        this.tavilyClient.updateDefaultOptions({
            max_results: maxResults,
            search_depth: searchDepth
        });

        // Test API connection if key was provided
        if (apiKey) {
            this.updateApiStatus();
        }

        alert('Settings saved successfully!');
        this.closeSettings();
    }

    /**
     * Toggle API key visibility
     */
    toggleApiKeyVisibility() {
        const type = this.apiKeyInput.type;
        this.apiKeyInput.type = type === 'password' ? 'text' : 'password';
        this.toggleApiKeyBtn.textContent = type === 'password' ? 'Hide' : 'Show';
    }

    /**
     * Update API status indicator
     */
    updateApiStatus() {
        const isConfigured = this.tavilyClient.isConfigured();

        if (isConfigured) {
            this.apiStatus.className = 'api-status configured';
            this.apiStatus.querySelector('.status-text').textContent = 'API key configured';
        } else {
            this.apiStatus.className = 'api-status';
            this.apiStatus.querySelector('.status-text').textContent = 'Not configured';
        }
    }

    /**
     * Check API configuration on startup
     */
    checkApiConfiguration() {
        this.updateApiStatus();
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const currentTheme = this.stateManager.getTheme();
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.stateManager.setTheme(newTheme);
        this.applyTheme(newTheme);
    }

    /**
     * Apply theme
     */
    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
    }

    /**
     * Show specific section and hide others
     */
    showSection(section) {
        this.missionInputSection.classList.add('hidden');
        this.missionBreakdownSection.classList.add('hidden');
        this.executionSection.classList.add('hidden');
        this.resultsSection.classList.add('hidden');

        switch (section) {
            case 'input':
                this.missionInputSection.classList.remove('hidden');
                break;
            case 'breakdown':
                this.missionBreakdownSection.classList.remove('hidden');
                break;
            case 'execution':
                this.executionSection.classList.remove('hidden');
                break;
            case 'results':
                this.resultsSection.classList.remove('hidden');
                break;
        }
    }

    /**
     * Utility: Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Utility: Truncate text
     */
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Utility: Format date
     */
    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new App());
} else {
    new App();
}

export default App;
