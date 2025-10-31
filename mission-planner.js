/**
 * Mission Planner
 * Breaks down research missions into logical, executable steps using ITIL 4 principles
 */

export class MissionPlanner {
    constructor() {
        this.itil4Principles = [
            'Focus on value',
            'Start where you are',
            'Progress iteratively with feedback',
            'Collaborate and promote visibility',
            'Think and work holistically',
            'Keep it simple and practical',
            'Optimize and automate'
        ];

        this.itil4Dimensions = [
            'Organizations and people',
            'Information and technology',
            'Partners and suppliers',
            'Value streams and processes'
        ];

        this.changeAssessmentAreas = [
            'Risk assessment',
            'Impact analysis',
            'Urgency evaluation',
            'Resource requirements',
            'Success criteria',
            'Stakeholder analysis'
        ];
    }

    /**
     * Plan a mission by breaking it down into logical steps
     * @param {string} mission - The mission description
     * @param {object} document - Optional uploaded MOP document
     * @returns {Array<object>} Array of steps
     */
    planMission(mission, document = null) {
        const missionLower = mission.toLowerCase();
        const steps = [];

        // Analyze the mission to determine what type of analysis is needed
        const analysisTypes = this.identifyAnalysisTypes(missionLower);

        // If document is provided, add document analysis step first
        if (document) {
            steps.push({
                id: this.generateStepId(),
                title: 'Analyze MOP Document Against ITIL 4 Standards',
                description: `Review the uploaded ${document.analysis.type} document for completeness, risk coverage, and ITIL 4 alignment.`,
                query: `${document.analysis.type} ITIL 4 best practices ${this.extractKeyTerms(mission).join(' ')}`,
                type: 'document_analysis',
                documentRef: true
            });
        }

        // Step 1: Always start with ITIL 4 framework research
        steps.push({
            id: this.generateStepId(),
            title: 'Research ITIL 4 Change Enablement Framework',
            description: 'Gather foundational knowledge about ITIL 4 change enablement principles and best practices relevant to this mission.',
            query: `ITIL 4 change enablement ${this.extractKeyTerms(mission).join(' ')}`,
            type: 'framework_research'
        });

        // Add analysis-specific steps based on mission content
        if (analysisTypes.includes('risk')) {
            steps.push({
                id: this.generateStepId(),
                title: 'Conduct Risk Assessment',
                description: 'Identify and analyze potential risks using ITIL 4 risk management principles.',
                query: `${this.extractKeyTerms(mission).join(' ')} risks challenges issues ITIL 4`,
                type: 'risk_analysis'
            });
        }

        if (analysisTypes.includes('impact')) {
            steps.push({
                id: this.generateStepId(),
                title: 'Analyze Impact Across 4 Dimensions',
                description: 'Evaluate impact on organizations/people, information/technology, partners/suppliers, and value streams/processes.',
                query: `${this.extractKeyTerms(mission).join(' ')} impact assessment business technology`,
                type: 'impact_analysis'
            });
        }

        if (analysisTypes.includes('migration') || analysisTypes.includes('implementation')) {
            steps.push({
                id: this.generateStepId(),
                title: 'Research Implementation Best Practices',
                description: 'Find case studies and proven approaches for similar implementations.',
                query: `${this.extractKeyTerms(mission).join(' ')} implementation case study best practices`,
                type: 'best_practices'
            });
        }

        if (analysisTypes.includes('security') || analysisTypes.includes('compliance')) {
            steps.push({
                id: this.generateStepId(),
                title: 'Evaluate Security and Compliance Requirements',
                description: 'Research security considerations and regulatory compliance requirements.',
                query: `${this.extractKeyTerms(mission).join(' ')} security compliance requirements standards`,
                type: 'security_analysis'
            });
        }

        if (analysisTypes.includes('cost') || analysisTypes.includes('benefit')) {
            steps.push({
                id: this.generateStepId(),
                title: 'Analyze Cost and Benefits',
                description: 'Research cost implications and expected benefits.',
                query: `${this.extractKeyTerms(mission).join(' ')} cost benefit ROI value`,
                type: 'cost_benefit'
            });
        }

        // Add stakeholder analysis if mentioned
        if (analysisTypes.includes('stakeholder')) {
            steps.push({
                id: this.generateStepId(),
                title: 'Identify Stakeholder Considerations',
                description: 'Analyze stakeholder impact and communication requirements.',
                query: `${this.extractKeyTerms(mission).join(' ')} stakeholders communication change management`,
                type: 'stakeholder_analysis'
            });
        }

        // Add MOP-specific analysis steps if document is provided
        if (document) {
            // Check for gaps in the MOP
            if (!document.analysis.hasRollback) {
                steps.push({
                    id: this.generateStepId(),
                    title: 'Research Rollback Procedures Best Practices',
                    description: 'Since the MOP lacks rollback procedures, research industry standards for rollback planning.',
                    query: `${this.extractKeyTerms(mission).join(' ')} rollback procedures backout plan best practices`,
                    type: 'mop_gap_analysis',
                    documentRef: true
                });
            }

            if (!document.analysis.hasValidation) {
                steps.push({
                    id: this.generateStepId(),
                    title: 'Research Validation and Testing Requirements',
                    description: 'Since the MOP lacks validation steps, research testing and verification best practices.',
                    query: `${this.extractKeyTerms(mission).join(' ')} validation testing verification requirements`,
                    type: 'mop_gap_analysis',
                    documentRef: true
                });
            }

            // Add procedure analysis if steps exist
            if (document.analysis.stepCount > 0) {
                steps.push({
                    id: this.generateStepId(),
                    title: 'Validate MOP Procedures Against Industry Standards',
                    description: `Review the ${document.analysis.stepCount} steps in the MOP for completeness and best practices alignment.`,
                    query: `${this.extractKeyTerms(mission).join(' ')} procedure validation change implementation standards`,
                    type: 'procedure_validation',
                    documentRef: true
                });
            }
        }

        // Step: Research similar industry experiences
        steps.push({
            id: this.generateStepId(),
            title: 'Research Industry Experiences',
            description: 'Find real-world examples and lessons learned from similar changes.',
            query: `${this.extractKeyTerms(mission).join(' ')} case study lessons learned experience`,
            type: 'industry_research'
        });

        // Final step: Synthesis and recommendations
        steps.push({
            id: this.generateStepId(),
            title: 'Synthesize Findings and Formulate Recommendations',
            description: 'Compile all research into actionable recommendations aligned with ITIL 4 principles.',
            query: `${this.extractKeyTerms(mission).join(' ')} recommendations action plan roadmap`,
            type: 'synthesis'
        });

        return steps;
    }

    /**
     * Identify what types of analysis are needed based on mission content
     */
    identifyAnalysisTypes(missionLower) {
        const types = [];

        // Risk-related keywords
        if (/risk|danger|threat|vulnerability|concern/i.test(missionLower)) {
            types.push('risk');
        }

        // Impact-related keywords
        if (/impact|effect|consequence|influence|affect/i.test(missionLower)) {
            types.push('impact');
        }

        // Migration/implementation keywords
        if (/migrat|implement|deploy|transition|move|adopt/i.test(missionLower)) {
            types.push('migration');
            types.push('implementation');
        }

        // Security keywords
        if (/security|secure|protect|privacy|encryption|compliance|regulat/i.test(missionLower)) {
            types.push('security');
            types.push('compliance');
        }

        // Cost/benefit keywords
        if (/cost|budget|expense|benefit|value|ROI|return/i.test(missionLower)) {
            types.push('cost');
            types.push('benefit');
        }

        // Stakeholder keywords
        if (/stakeholder|user|customer|team|department|organization/i.test(missionLower)) {
            types.push('stakeholder');
        }

        // If no specific types identified, add general analysis
        if (types.length === 0) {
            types.push('risk', 'impact', 'implementation');
        }

        return types;
    }

    /**
     * Extract key terms from the mission for search queries
     */
    extractKeyTerms(mission) {
        // Remove common words and extract meaningful terms
        const commonWords = new Set([
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
            'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
            'should', 'could', 'may', 'might', 'must', 'can', 'our', 'we', 'us',
            'analyze', 'analysis', 'assess', 'assessment', 'evaluate', 'evaluation',
            'research', 'study', 'investigate', 'examine', 'review'
        ]);

        const words = mission
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 3 && !commonWords.has(word));

        // Remove duplicates and return top terms
        const uniqueWords = [...new Set(words)];
        return uniqueWords.slice(0, 5); // Return top 5 key terms
    }

    /**
     * Validate mission input
     */
    validateMission(mission) {
        if (!mission || typeof mission !== 'string') {
            return { valid: false, error: 'Mission must be a non-empty string' };
        }

        const trimmed = mission.trim();
        
        if (trimmed.length < 20) {
            return { valid: false, error: 'Mission description is too short. Please provide more details.' };
        }

        if (trimmed.length > 2000) {
            return { valid: false, error: 'Mission description is too long. Please keep it under 2000 characters.' };
        }

        return { valid: true };
    }

    /**
     * Generate a unique step ID
     */
    generateStepId() {
        return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Estimate mission complexity and duration
     */
    estimateMission(steps) {
        const complexity = steps.length <= 4 ? 'Low' : steps.length <= 7 ? 'Medium' : 'High';
        const estimatedMinutes = steps.length * 2; // Rough estimate: 2 minutes per step

        return {
            complexity,
            stepCount: steps.length,
            estimatedDuration: `${estimatedMinutes}-${estimatedMinutes + 5} minutes`,
            estimatedMinutes
        };
    }

    /**
     * Create a mission summary for display
     */
    createMissionSummary(mission, steps) {
        const estimate = this.estimateMission(steps);
        
        return {
            mission,
            steps,
            summary: {
                totalSteps: steps.length,
                complexity: estimate.complexity,
                estimatedDuration: estimate.estimatedDuration,
                analysisTypes: this.identifyAnalysisTypes(mission.toLowerCase())
            }
        };
    }

    /**
     * Refine a step based on user input or previous results
     */
    refineStep(step, refinement) {
        return {
            ...step,
            description: `${step.description} ${refinement}`,
            query: `${step.query} ${refinement}`,
            refined: true
        };
    }

    /**
     * Add a custom step to the plan
     */
    createCustomStep(title, description, query) {
        return {
            id: this.generateStepId(),
            title,
            description,
            query,
            type: 'custom'
        };
    }
}

export default MissionPlanner;
