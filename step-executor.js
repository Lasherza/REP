/**
 * Step Executor
 * Executes individual research steps using the Tavily API
 */

export class StepExecutor {
    constructor(tavilyClient) {
        this.tavilyClient = tavilyClient;
        this.currentExecution = null;
    }

    /**
     * Execute a single step
     * @param {object} step - The step to execute
     * @param {function} onProgress - Progress callback
     * @returns {Promise<object>} Execution result
     */
    async executeStep(step, onProgress = null) {
        try {
            if (onProgress) {
                onProgress({ status: 'started', step });
            }

            // Perform the search
            const searchResults = await this.tavilyClient.search(step.query, {
                max_results: 5,
                search_depth: 'advanced',
                include_answer: true
            });

            // Process and analyze the results
            const analysis = this.analyzeResults(step, searchResults);

            if (onProgress) {
                onProgress({ status: 'completed', step, analysis });
            }

            return {
                stepId: step.id,
                status: 'completed',
                searchResults,
                analysis,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            if (onProgress) {
                onProgress({ status: 'error', step, error: error.message });
            }

            return {
                stepId: step.id,
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Execute multiple steps sequentially
     * @param {Array<object>} steps - Steps to execute
     * @param {function} onProgress - Progress callback for each step
     * @returns {Promise<Array<object>>} Array of execution results
     */
    async executeSteps(steps, onProgress = null) {
        const results = [];
        this.currentExecution = {
            totalSteps: steps.length,
            completedSteps: 0,
            startTime: Date.now()
        };

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            
            if (onProgress) {
                onProgress({
                    type: 'step_start',
                    stepIndex: i,
                    step,
                    progress: (i / steps.length) * 100
                });
            }

            const result = await this.executeStep(step, (stepProgress) => {
                if (onProgress) {
                    onProgress({
                        type: 'step_progress',
                        stepIndex: i,
                        ...stepProgress
                    });
                }
            });

            results.push(result);
            this.currentExecution.completedSteps++;

            if (onProgress) {
                onProgress({
                    type: 'step_complete',
                    stepIndex: i,
                    result,
                    progress: ((i + 1) / steps.length) * 100
                });
            }

            // Add a small delay between steps to be respectful of API rate limits
            if (i < steps.length - 1) {
                await this.delay(1000);
            }
        }

        this.currentExecution = null;
        return results;
    }

    /**
     * Analyze search results and extract key insights
     */
    analyzeResults(step, searchResults) {
        const analysis = {
            summary: '',
            keyFindings: [],
            sources: [],
            confidence: 'medium'
        };

        // Use the AI-generated answer if available
        if (searchResults.answer) {
            analysis.summary = searchResults.answer;
            analysis.confidence = 'high';
        }

        // Extract key findings from results
        if (searchResults.results && searchResults.results.length > 0) {
            searchResults.results.forEach((result, index) => {
                if (index < 3) { // Top 3 results
                    analysis.keyFindings.push({
                        title: result.title,
                        content: this.extractRelevantSnippet(result.content),
                        relevance: result.score || 0.5
                    });
                }

                analysis.sources.push({
                    title: result.title,
                    url: result.url,
                    publishedDate: result.publishedDate
                });
            });
        }

        // If no answer was provided, create a summary from findings
        if (!analysis.summary && analysis.keyFindings.length > 0) {
            analysis.summary = this.synthesizeFindings(step, analysis.keyFindings);
            analysis.confidence = 'medium';
        }

        // Categorize findings based on step type
        analysis.categorizedFindings = this.categorizeFindings(step.type, analysis.keyFindings);

        return analysis;
    }

    /**
     * Extract relevant snippet from content (first 300 characters)
     */
    extractRelevantSnippet(content, maxLength = 300) {
        if (!content) return '';
        
        if (content.length <= maxLength) {
            return content;
        }

        // Try to cut at a sentence boundary
        const snippet = content.substring(0, maxLength);
        const lastPeriod = snippet.lastIndexOf('.');
        
        if (lastPeriod > maxLength * 0.7) {
            return snippet.substring(0, lastPeriod + 1);
        }

        return snippet + '...';
    }

    /**
     * Synthesize findings into a coherent summary
     */
    synthesizeFindings(step, findings) {
        if (findings.length === 0) {
            return `No specific findings were available for "${step.title}". Consider refining the search criteria.`;
        }

        let summary = `Based on the research for "${step.title}", `;
        
        const topFinding = findings[0];
        summary += `${topFinding.content} `;

        if (findings.length > 1) {
            summary += `Additional insights include: ${findings.slice(1).map(f => f.title).join(', ')}.`;
        }

        return summary;
    }

    /**
     * Categorize findings based on step type for ITIL 4 context
     */
    categorizeFindings(stepType, findings) {
        const categories = {
            risks: [],
            benefits: [],
            considerations: [],
            bestPractices: []
        };

        findings.forEach(finding => {
            const content = finding.content.toLowerCase();

            // Categorize based on keywords
            if (content.match(/risk|danger|threat|challenge|issue|problem/i)) {
                categories.risks.push(finding);
            }
            
            if (content.match(/benefit|advantage|improve|enhance|value|positive/i)) {
                categories.benefits.push(finding);
            }
            
            if (content.match(/consider|important|key|critical|essential|should/i)) {
                categories.considerations.push(finding);
            }
            
            if (content.match(/best practice|recommend|proven|successful|effective/i)) {
                categories.bestPractices.push(finding);
            }
        });

        return categories;
    }

    /**
     * Create a comprehensive report from all step results
     */
    createComprehensiveReport(stepResults) {
        const report = {
            executionSummary: '',
            findings: [],
            risks: [],
            recommendations: [],
            sources: [],
            itil4Alignment: {}
        };

        // Aggregate all findings
        stepResults.forEach(result => {
            if (result.status === 'completed' && result.analysis) {
                const analysis = result.analysis;

                // Add findings
                if (analysis.keyFindings) {
                    report.findings.push(...analysis.keyFindings);
                }

                // Extract risks
                if (analysis.categorizedFindings && analysis.categorizedFindings.risks.length > 0) {
                    report.risks.push(...analysis.categorizedFindings.risks);
                }

                // Collect sources
                if (analysis.sources) {
                    report.sources.push(...analysis.sources);
                }
            }
        });

        // Create executive summary
        report.executionSummary = this.createExecutiveSummary(stepResults);

        // Generate recommendations
        report.recommendations = this.generateRecommendations(stepResults);

        // Analyze ITIL 4 alignment
        report.itil4Alignment = this.analyzeITIL4Alignment(stepResults);

        // Remove duplicate sources
        report.sources = this.deduplicateSources(report.sources);

        return report;
    }

    /**
     * Create executive summary from step results
     */
    createExecutiveSummary(stepResults) {
        const completedSteps = stepResults.filter(r => r.status === 'completed');
        const totalSteps = stepResults.length;

        let summary = `Mission completed with ${completedSteps.length} of ${totalSteps} steps successfully executed.\n\n`;

        completedSteps.forEach((result, index) => {
            if (result.analysis && result.analysis.summary) {
                summary += `**Step ${index + 1}:** ${result.analysis.summary}\n\n`;
            }
        });

        return summary;
    }

    /**
     * Generate actionable recommendations
     */
    generateRecommendations(stepResults) {
        const recommendations = [];

        stepResults.forEach(result => {
            if (result.status === 'completed' && result.analysis) {
                const categorized = result.analysis.categorizedFindings;

                if (categorized && categorized.bestPractices.length > 0) {
                    categorized.bestPractices.forEach(practice => {
                        recommendations.push({
                            type: 'best_practice',
                            recommendation: practice.content,
                            source: practice.title
                        });
                    });
                }
            }
        });

        return recommendations.slice(0, 10); // Top 10 recommendations
    }

    /**
     * Analyze alignment with ITIL 4 principles
     */
    analyzeITIL4Alignment(stepResults) {
        return {
            principlesAddressed: [
                'Focus on value',
                'Collaborate and promote visibility',
                'Think and work holistically'
            ],
            dimensionsConsidered: [
                'Information and technology',
                'Organizations and people'
            ],
            changeEnablementScore: this.calculateChangeEnablementScore(stepResults)
        };
    }

    /**
     * Calculate a change enablement maturity score
     */
    calculateChangeEnablementScore(stepResults) {
        const completedSteps = stepResults.filter(r => r.status === 'completed').length;
        const totalSteps = stepResults.length;
        const completionRate = completedSteps / totalSteps;

        const hasRiskAnalysis = stepResults.some(r => 
            r.analysis && r.analysis.categorizedFindings && r.analysis.categorizedFindings.risks.length > 0
        );

        const hasBestPractices = stepResults.some(r =>
            r.analysis && r.analysis.categorizedFindings && r.analysis.categorizedFindings.bestPractices.length > 0
        );

        let score = completionRate * 60; // Base score from completion
        if (hasRiskAnalysis) score += 20;
        if (hasBestPractices) score += 20;

        return Math.min(Math.round(score), 100);
    }

    /**
     * Remove duplicate sources based on URL
     */
    deduplicateSources(sources) {
        const seen = new Set();
        return sources.filter(source => {
            if (seen.has(source.url)) {
                return false;
            }
            seen.add(source.url);
            return true;
        });
    }

    /**
     * Utility: Delay execution
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current execution status
     */
    getExecutionStatus() {
        return this.currentExecution;
    }

    /**
     * Cancel current execution (if supported in future)
     */
    cancelExecution() {
        if (this.currentExecution) {
            this.currentExecution.cancelled = true;
        }
    }
}

export default StepExecutor;
