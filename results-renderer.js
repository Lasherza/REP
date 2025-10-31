/**
 * Results Renderer
 * Handles rendering of mission results and findings to the UI
 */

export class ResultsRenderer {
    constructor() {
        this.container = null;
    }

    /**
     * Set the container element for rendering
     */
    setContainer(container) {
        this.container = container;
    }

    /**
     * Render complete mission results
     * @param {object} report - The comprehensive report from step executor
     */
    renderResults(report) {
        if (!this.container) {
            console.error('Container not set');
            return;
        }

        this.container.innerHTML = '';

        // Render Executive Summary
        this.renderExecutiveSummary(report);

        // Render ITIL 4 Alignment
        this.renderITIL4Alignment(report);

        // Render Key Findings
        this.renderKeyFindings(report);

        // Render Risks (if any)
        if (report.risks && report.risks.length > 0) {
            this.renderRisks(report);
        }

        // Render Recommendations
        this.renderRecommendations(report);

        // Render Sources
        this.renderSources(report);
    }

    /**
     * Render executive summary section
     */
    renderExecutiveSummary(report) {
        const card = this.createResultCard(
            'Executive Summary',
            'executive-summary',
            false
        );

        const content = document.createElement('div');
        content.className = 'result-content';

        const paragraphs = report.executionSummary.split('\n\n');
        paragraphs.forEach(para => {
            if (para.trim()) {
                const p = document.createElement('p');
                p.innerHTML = this.formatText(para);
                content.appendChild(p);
            }
        });

        card.querySelector('.result-card-body').appendChild(content);
        this.container.appendChild(card);
    }

    /**
     * Render ITIL 4 alignment section
     */
    renderITIL4Alignment(report) {
        if (!report.itil4Alignment) return;

        const card = this.createResultCard(
            'ITIL 4 Framework Alignment',
            'itil4-alignment',
            true
        );

        const content = document.createElement('div');
        content.className = 'result-content';

        // Change Enablement Score
        const scoreSection = document.createElement('div');
        scoreSection.style.marginBottom = '1.5rem';
        scoreSection.innerHTML = `
            <h4>Change Enablement Maturity Score</h4>
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
                <div style="flex: 1; background: var(--color-bg-tertiary); border-radius: var(--radius-md); height: 24px; overflow: hidden;">
                    <div style="background: linear-gradient(90deg, var(--color-success), var(--color-primary)); height: 100%; width: ${report.itil4Alignment.changeEnablementScore}%; transition: width 0.5s ease;"></div>
                </div>
                <span style="font-weight: 700; font-size: 1.25rem; color: var(--color-primary);">${report.itil4Alignment.changeEnablementScore}%</span>
            </div>
        `;
        content.appendChild(scoreSection);

        // Principles Addressed
        if (report.itil4Alignment.principlesAddressed && report.itil4Alignment.principlesAddressed.length > 0) {
            const principlesSection = document.createElement('div');
            principlesSection.innerHTML = `
                <h4>ITIL 4 Guiding Principles Addressed</h4>
                <ul>
                    ${report.itil4Alignment.principlesAddressed.map(p => `<li>${this.escapeHtml(p)}</li>`).join('')}
                </ul>
            `;
            content.appendChild(principlesSection);
        }

        // Dimensions Considered
        if (report.itil4Alignment.dimensionsConsidered && report.itil4Alignment.dimensionsConsidered.length > 0) {
            const dimensionsSection = document.createElement('div');
            dimensionsSection.innerHTML = `
                <h4>Four Dimensions Considered</h4>
                <ul>
                    ${report.itil4Alignment.dimensionsConsidered.map(d => `<li>${this.escapeHtml(d)}</li>`).join('')}
                </ul>
            `;
            content.appendChild(dimensionsSection);
        }

        card.querySelector('.result-card-body').appendChild(content);
        this.container.appendChild(card);
    }

    /**
     * Render key findings section
     */
    renderKeyFindings(report) {
        if (!report.findings || report.findings.length === 0) return;

        const card = this.createResultCard(
            'Key Findings',
            'key-findings',
            false
        );

        const content = document.createElement('div');
        content.className = 'result-content';

        // Group findings by relevance
        const sortedFindings = [...report.findings].sort((a, b) => 
            (b.relevance || 0) - (a.relevance || 0)
        );

        sortedFindings.slice(0, 10).forEach((finding, index) => {
            const findingDiv = document.createElement('div');
            findingDiv.style.marginBottom = '1rem';
            findingDiv.innerHTML = `
                <h4 style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: var(--color-primary-light); color: var(--color-primary); border-radius: 50%; font-size: 0.75rem; font-weight: 700;">${index + 1}</span>
                    ${this.escapeHtml(finding.title)}
                </h4>
                <p style="margin-top: 0.5rem;">${this.escapeHtml(finding.content)}</p>
            `;
            content.appendChild(findingDiv);
        });

        card.querySelector('.result-card-body').appendChild(content);
        this.container.appendChild(card);
    }

    /**
     * Render risks section
     */
    renderRisks(report) {
        const card = this.createResultCard(
            'Identified Risks',
            'risks',
            true
        );

        const content = document.createElement('div');
        content.className = 'result-content';

        const intro = document.createElement('p');
        intro.textContent = 'The following risks have been identified through the research:';
        intro.style.marginBottom = '1rem';
        content.appendChild(intro);

        const risksList = document.createElement('ul');
        report.risks.slice(0, 10).forEach(risk => {
            const li = document.createElement('li');
            li.innerHTML = `<strong>${this.escapeHtml(risk.title)}:</strong> ${this.escapeHtml(risk.content)}`;
            risksList.appendChild(li);
        });

        content.appendChild(risksList);
        card.querySelector('.result-card-body').appendChild(content);
        this.container.appendChild(card);
    }

    /**
     * Render recommendations section
     */
    renderRecommendations(report) {
        if (!report.recommendations || report.recommendations.length === 0) {
            // Create default recommendations
            const card = this.createResultCard(
                'Recommendations',
                'recommendations',
                false
            );

            const content = document.createElement('div');
            content.className = 'result-content';
            content.innerHTML = `
                <p>Based on the research findings and ITIL 4 best practices, consider the following:</p>
                <ul>
                    <li>Ensure all stakeholders are identified and engaged throughout the change process</li>
                    <li>Conduct a thorough risk assessment before proceeding</li>
                    <li>Develop a comprehensive communication plan</li>
                    <li>Establish clear success criteria and metrics</li>
                    <li>Plan for iterative implementation with feedback loops</li>
                    <li>Document lessons learned for continuous improvement</li>
                </ul>
            `;

            card.querySelector('.result-card-body').appendChild(content);
            this.container.appendChild(card);
            return;
        }

        const card = this.createResultCard(
            'Recommendations',
            'recommendations',
            false
        );

        const content = document.createElement('div');
        content.className = 'result-content';

        const intro = document.createElement('p');
        intro.textContent = 'Based on the research findings, here are the recommended actions:';
        intro.style.marginBottom = '1rem';
        content.appendChild(intro);

        const recList = document.createElement('ul');
        report.recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec.recommendation;
            if (rec.source) {
                const source = document.createElement('span');
                source.style.color = 'var(--color-text-tertiary)';
                source.style.fontSize = '0.85rem';
                source.textContent = ` (Source: ${rec.source})`;
                li.appendChild(source);
            }
            recList.appendChild(li);
        });

        content.appendChild(recList);
        card.querySelector('.result-card-body').appendChild(content);
        this.container.appendChild(card);
    }

    /**
     * Render sources section
     */
    renderSources(report) {
        if (!report.sources || report.sources.length === 0) return;

        const card = this.createResultCard(
            'Research Sources',
            'sources',
            true
        );

        const content = document.createElement('div');
        content.className = 'result-content';

        const intro = document.createElement('p');
        intro.textContent = `This analysis is based on ${report.sources.length} sources:`;
        intro.style.marginBottom = '1rem';
        content.appendChild(intro);

        const sourcesList = document.createElement('div');
        report.sources.forEach((source, index) => {
            const sourceDiv = document.createElement('div');
            sourceDiv.style.marginBottom = '0.75rem';
            sourceDiv.innerHTML = `
                <div style="display: flex; align-items: start; gap: 0.5rem;">
                    <span style="color: var(--color-text-tertiary); font-weight: 600;">[${index + 1}]</span>
                    <div>
                        <a href="${this.escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer" class="source-link">
                            ${this.escapeHtml(source.title)}
                        </a>
                        ${source.publishedDate ? `<div style="font-size: 0.75rem; color: var(--color-text-tertiary); margin-top: 0.25rem;">Published: ${this.escapeHtml(source.publishedDate)}</div>` : ''}
                    </div>
                </div>
            `;
            sourcesList.appendChild(sourceDiv);
        });

        content.appendChild(sourcesList);
        card.querySelector('.result-card-body').appendChild(content);
        this.container.appendChild(card);
    }

    /**
     * Create a collapsible result card
     */
    createResultCard(title, id, collapsed = false) {
        const card = document.createElement('div');
        card.className = `result-card ${collapsed ? 'collapsed' : ''}`;
        card.id = id;

        const header = document.createElement('div');
        header.className = 'result-card-header';
        header.innerHTML = `
            <h3>${this.escapeHtml(title)}</h3>
            <svg class="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        `;

        header.addEventListener('click', () => {
            card.classList.toggle('collapsed');
        });

        const body = document.createElement('div');
        body.className = 'result-card-body';

        card.appendChild(header);
        card.appendChild(body);

        return card;
    }

    /**
     * Format text with basic markdown-like formatting
     */
    formatText(text) {
        // Bold text with **
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text with *
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return text;
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clear the results container
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    /**
     * Show loading state
     */
    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 4rem; text-align: center;">
                    <div class="spinner" style="width: 40px; height: 40px; margin-bottom: 1rem;"></div>
                    <p style="color: var(--color-text-secondary);">Generating comprehensive report...</p>
                </div>
            `;
        }
    }

    /**
     * Show error state
     */
    showError(message) {
        if (this.container) {
            this.container.innerHTML = `
                <div style="background: var(--color-bg-secondary); border: 2px solid var(--color-error); border-radius: var(--radius-md); padding: 2rem; text-align: center;">
                    <svg style="width: 48px; height: 48px; color: var(--color-error); margin-bottom: 1rem;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <h3 style="margin-bottom: 0.5rem;">Error Generating Report</h3>
                    <p style="color: var(--color-text-secondary);">${this.escapeHtml(message)}</p>
                </div>
            `;
        }
    }
}

export default ResultsRenderer;
