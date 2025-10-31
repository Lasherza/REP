// Application state
const state = {
    mission: '',
    plan: null,
    stepResults: [],
    currentStep: 0,
    isExecuting: false
};

// DOM Elements
const elements = {
    // Input section
    missionInput: document.getElementById('missionInput'),
    startBtn: document.getElementById('startBtn'),
    exampleBtns: document.querySelectorAll('.example-btn'),
    
    // Sections
    inputSection: document.getElementById('inputSection'),
    planningSection: document.getElementById('planningSection'),
    executionSection: document.getElementById('executionSection'),
    resultsSection: document.getElementById('resultsSection'),
    
    // Planning section
    planningStatus: document.getElementById('planningStatus'),
    planDisplay: document.getElementById('planDisplay'),
    missionDisplay: document.getElementById('missionDisplay'),
    stepsContainer: document.getElementById('stepsContainer'),
    executePlanBtn: document.getElementById('executePlanBtn'),
    modifyPlanBtn: document.getElementById('modifyPlanBtn'),
    
    // Execution section
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    executionSteps: document.getElementById('executionSteps'),
    executionStatus: document.getElementById('executionStatus'),
    
    // Results section
    reportContent: document.getElementById('reportContent'),
    sourcesSection: document.getElementById('sourcesSection'),
    sourcesList: document.getElementById('sourcesList'),
    exportMarkdownBtn: document.getElementById('exportMarkdownBtn'),
    newResearchBtn: document.getElementById('newResearchBtn'),
    
    // Theme
    themeToggle: document.getElementById('themeToggle')
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    checkAPIHealth();
});

// Event Listeners
function initializeEventListeners() {
    elements.startBtn.addEventListener('click', handleStartResearch);
    elements.executePlanBtn.addEventListener('click', handleExecutePlan);
    elements.modifyPlanBtn.addEventListener('click', handleModifyPlan);
    elements.newResearchBtn.addEventListener('click', handleNewResearch);
    elements.exportMarkdownBtn.addEventListener('click', handleExportMarkdown);
    elements.themeToggle.addEventListener('click', handleThemeToggle);
    
    elements.exampleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.missionInput.value = e.target.dataset.example;
        });
    });
    
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        elements.themeToggle.textContent = '?? Light Mode';
    }
}

// API Health Check
async function checkAPIHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (!data.openai_configured) {
            showNotification('?? OpenAI API key not configured', 'warning');
        }
        if (!data.tavily_configured) {
            console.log('?? Tavily API key not configured - web search will be limited');
        }
    } catch (error) {
        console.error('Error checking API health:', error);
    }
}

// Handle Start Research
async function handleStartResearch() {
    const mission = elements.missionInput.value.trim();
    
    if (!mission) {
        showNotification('Please enter a research mission', 'error');
        return;
    }
    
    state.mission = mission;
    
    // Switch to planning section
    showSection('planning');
    elements.planDisplay.classList.add('hidden');
    elements.planningStatus.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mission })
        });
        
        const data = await response.json();
        
        if (data.success && data.steps) {
            state.plan = data.steps;
            displayPlan(mission, data.steps);
        } else {
            throw new Error(data.error || 'Failed to create plan');
        }
    } catch (error) {
        console.error('Error creating plan:', error);
        showNotification('Error creating research plan: ' + error.message, 'error');
        showSection('input');
    }
}

// Display Plan
function displayPlan(mission, steps) {
    elements.planningStatus.classList.add('hidden');
    elements.planDisplay.classList.remove('hidden');
    
    // Display mission
    elements.missionDisplay.innerHTML = `
        <strong>Mission:</strong> ${escapeHtml(mission)}
    `;
    
    // Display steps
    elements.stepsContainer.innerHTML = steps.map((step, index) => {
        const searchTag = step.requires_search 
            ? `<span class="step-tag">?? Web Search</span>`
            : `<span class="step-tag">?? Analysis</span>`;
        
        const queryTag = step.search_query 
            ? `<span class="step-tag">?? "${step.search_query}"</span>`
            : '';
        
        return `
            <div class="step-item">
                <div class="step-header">
                    <span class="step-number">${step.step_number || index + 1}</span>
                    <span class="step-description">${escapeHtml(step.description)}</span>
                </div>
                <div class="step-meta">
                    ${searchTag}
                    ${queryTag}
                </div>
            </div>
        `;
    }).join('');
}

// Handle Execute Plan
async function handleExecutePlan() {
    if (state.isExecuting) return;
    
    state.isExecuting = true;
    state.stepResults = [];
    state.currentStep = 0;
    
    // Switch to execution section
    showSection('execution');
    
    // Initialize execution display
    initializeExecutionDisplay();
    
    // Execute each step
    for (let i = 0; i < state.plan.length; i++) {
        const step = state.plan[i];
        state.currentStep = i + 1;
        
        updateProgress();
        updateExecutionStepStatus(i, 'active');
        
        try {
            const result = await executeStep(step);
            state.stepResults.push(result);
            updateExecutionStepStatus(i, 'completed', result);
        } catch (error) {
            console.error('Error executing step:', error);
            updateExecutionStepStatus(i, 'error', { error: error.message });
        }
    }
    
    // Hide execution status
    elements.executionStatus.classList.add('hidden');
    
    // Generate final report
    await generateFinalReport();
    
    state.isExecuting = false;
}

// Initialize Execution Display
function initializeExecutionDisplay() {
    elements.executionSteps.innerHTML = state.plan.map((step, index) => `
        <div class="execution-step" data-step="${index}">
            <div class="execution-step-header">
                <span class="execution-step-status">?</span>
                <span class="execution-step-title">${escapeHtml(step.description)}</span>
            </div>
            <div class="execution-step-details"></div>
        </div>
    `).join('');
    
    updateProgress();
}

// Execute Single Step
async function executeStep(step) {
    try {
        const response = await fetch('/api/execute-step', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                step, 
                mission: state.mission 
            })
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || 'Step execution failed');
        }
        
        return data;
    } catch (error) {
        console.error('Error executing step:', error);
        throw error;
    }
}

// Update Execution Step Status
function updateExecutionStepStatus(index, status, result = null) {
    const stepElement = document.querySelector(`[data-step="${index}"]`);
    if (!stepElement) return;
    
    const statusIcon = stepElement.querySelector('.execution-step-status');
    const detailsElement = stepElement.querySelector('.execution-step-details');
    
    stepElement.classList.remove('active', 'completed', 'error');
    
    if (status === 'active') {
        stepElement.classList.add('active');
        statusIcon.textContent = '??';
        detailsElement.innerHTML = '<em>Processing...</em>';
    } else if (status === 'completed' && result) {
        stepElement.classList.add('completed');
        statusIcon.textContent = '?';
        
        let details = '';
        
        if (result.search_performed && result.search_query) {
            details += `<div class="search-query">?? ${escapeHtml(result.search_query)}</div>`;
        }
        
        if (result.findings) {
            details += `<div class="execution-step-findings">${escapeHtml(result.findings)}</div>`;
        }
        
        detailsElement.innerHTML = details;
    } else if (status === 'error') {
        stepElement.classList.add('error');
        statusIcon.textContent = '?';
        detailsElement.innerHTML = `<em style="color: var(--error)">Error: ${escapeHtml(result?.error || 'Unknown error')}</em>`;
    }
}

// Update Progress
function updateProgress() {
    const total = state.plan.length;
    const current = state.currentStep;
    const percentage = (current / total) * 100;
    
    elements.progressFill.style.width = `${percentage}%`;
    elements.progressText.textContent = `Step ${current} of ${total}`;
}

// Generate Final Report
async function generateFinalReport() {
    try {
        const response = await fetch('/api/generate-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                mission: state.mission,
                stepResults: state.stepResults
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayReport(data.report, data.sources);
        } else {
            throw new Error(data.error || 'Failed to generate report');
        }
    } catch (error) {
        console.error('Error generating report:', error);
        showNotification('Error generating report: ' + error.message, 'error');
    }
}

// Display Report
function displayReport(report, sources) {
    showSection('results');
    
    // Convert markdown to HTML (simple conversion)
    elements.reportContent.innerHTML = markdownToHtml(report);
    
    // Display sources
    if (sources && sources.length > 0) {
        elements.sourcesSection.classList.remove('hidden');
        elements.sourcesList.innerHTML = sources.map(source => `
            <div class="source-item">
                <div class="source-title">${escapeHtml(source.title)}</div>
                <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" class="source-url">
                    ${escapeHtml(source.url)}
                </a>
                ${source.snippet ? `<div class="source-snippet">${escapeHtml(source.snippet)}</div>` : ''}
            </div>
        `).join('');
    } else {
        elements.sourcesSection.classList.add('hidden');
    }
}

// Simple Markdown to HTML converter
function markdownToHtml(markdown) {
    return markdown
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
        // Lists
        .replace(/^\* (.+)$/gim, '<li>$1</li>')
        .replace(/^- (.+)$/gim, '<li>$1</li>')
        .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
        // Line breaks
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        // Wrap in paragraphs
        .split('</p><p>').map(p => `<p>${p}</p>`).join('');
}

// Handle Modify Plan
function handleModifyPlan() {
    showSection('input');
    state.plan = null;
    state.stepResults = [];
}

// Handle New Research
function handleNewResearch() {
    state.mission = '';
    state.plan = null;
    state.stepResults = [];
    state.currentStep = 0;
    elements.missionInput.value = '';
    showSection('input');
}

// Handle Export Markdown
function handleExportMarkdown() {
    const markdown = elements.reportContent.textContent || elements.reportContent.innerText;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-report-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Report exported successfully! ??', 'success');
}

// Handle Theme Toggle
function handleThemeToggle() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    elements.themeToggle.textContent = isDark ? '?? Light Mode' : '?? Dark Mode';
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}

// Show Section
function showSection(sectionName) {
    const sections = ['input', 'planning', 'execution', 'results'];
    sections.forEach(name => {
        const section = document.getElementById(`${name}Section`);
        if (section) {
            section.classList.toggle('active', name === sectionName);
        }
    });
}

// Show Notification (simple implementation)
function showNotification(message, type = 'info') {
    // You could enhance this with a proper notification system
    if (type === 'error') {
        alert('? ' + message);
    } else if (type === 'warning') {
        console.warn('?? ' + message);
    } else if (type === 'success') {
        console.log('? ' + message);
    } else {
        console.log('?? ' + message);
    }
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
