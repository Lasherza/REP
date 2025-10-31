/**
 * Document Parser
 * Handles parsing and analysis of MOP (Method of Procedure) documents
 */

export class DocumentParser {
    constructor() {
        this.supportedFormats = ['.txt', '.md', '.json', '.pdf'];
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
    }

    /**
     * Validate file before parsing
     */
    validateFile(file) {
        // Check file size
        if (file.size > this.maxFileSize) {
            return {
                valid: false,
                error: `File size exceeds maximum of ${this.maxFileSize / (1024 * 1024)}MB`
            };
        }

        // Check file type
        const fileExtension = this.getFileExtension(file.name);
        if (!this.supportedFormats.includes(fileExtension)) {
            return {
                valid: false,
                error: `Unsupported file format. Supported: ${this.supportedFormats.join(', ')}`
            };
        }

        return { valid: true };
    }

    /**
     * Get file extension
     */
    getFileExtension(filename) {
        return filename.substring(filename.lastIndexOf('.')).toLowerCase();
    }

    /**
     * Parse uploaded file
     */
    async parseFile(file) {
        const validation = this.validateFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const fileExtension = this.getFileExtension(file.name);

        try {
            let content = '';

            switch (fileExtension) {
                case '.txt':
                case '.md':
                    content = await this.parseTextFile(file);
                    break;
                case '.json':
                    content = await this.parseJsonFile(file);
                    break;
                case '.pdf':
                    content = await this.parsePdfFile(file);
                    break;
                default:
                    throw new Error('Unsupported file type');
            }

            const analysis = this.analyzeDocument(content);

            return {
                filename: file.name,
                size: file.size,
                type: fileExtension,
                content,
                analysis,
                uploadedAt: new Date().toISOString()
            };

        } catch (error) {
            throw new Error(`Failed to parse file: ${error.message}`);
        }
    }

    /**
     * Parse text file
     */
    async parseTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read text file'));
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Parse JSON file
     */
    async parseJsonFile(file) {
        const text = await this.parseTextFile(file);
        try {
            const json = JSON.parse(text);
            // Convert JSON to readable text format
            return JSON.stringify(json, null, 2);
        } catch (error) {
            throw new Error('Invalid JSON format');
        }
    }

    /**
     * Parse PDF file (basic text extraction)
     * Note: For production, consider using PDF.js library
     */
    async parsePdfFile(file) {
        // Basic PDF text extraction (simplified)
        // In production, you'd use a library like PDF.js
        return new Promise((resolve) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const text = e.target.result;
                // Very basic text extraction - in reality, PDFs need proper parsing
                resolve(`[PDF Content]\n\nFilename: ${file.name}\nSize: ${(file.size / 1024).toFixed(2)} KB\n\nNote: For full PDF text extraction, please convert to .txt format or use a dedicated PDF parser.\n\nBasic extraction attempted from binary content.`);
            };
            
            reader.readAsText(file);
        });
    }

    /**
     * Analyze document content for MOP characteristics
     */
    analyzeDocument(content) {
        const analysis = {
            type: 'unknown',
            characteristics: [],
            stepCount: 0,
            hasProcedures: false,
            hasRollback: false,
            hasValidation: false,
            hasRisks: false,
            keywords: []
        };

        const contentLower = content.toLowerCase();

        // Detect document type
        if (contentLower.includes('method of procedure') || contentLower.includes('mop')) {
            analysis.type = 'MOP';
            analysis.characteristics.push('Method of Procedure document');
        } else if (contentLower.includes('runbook') || contentLower.includes('playbook')) {
            analysis.type = 'Runbook';
            analysis.characteristics.push('Runbook/Playbook document');
        } else if (contentLower.includes('change request') || contentLower.includes('change record')) {
            analysis.type = 'Change Request';
            analysis.characteristics.push('Change Request document');
        }

        // Count steps
        const stepMatches = content.match(/step\s+\d+/gi) || [];
        analysis.stepCount = stepMatches.length;

        // Check for procedures
        if (/procedure|process|workflow/i.test(content)) {
            analysis.hasProcedures = true;
            analysis.characteristics.push('Contains procedures');
        }

        // Check for rollback plan
        if (/rollback|backout|revert|restore/i.test(content)) {
            analysis.hasRollback = true;
            analysis.characteristics.push('Includes rollback procedures');
        }

        // Check for validation/testing
        if (/validat|test|verif|confirm/i.test(content)) {
            analysis.hasValidation = true;
            analysis.characteristics.push('Includes validation steps');
        }

        // Check for risk mentions
        if (/risk|impact|concern|issue|problem/i.test(content)) {
            analysis.hasRisks = true;
            analysis.characteristics.push('Contains risk information');
        }

        // Extract key ITIL-related keywords
        const itilKeywords = [
            'change', 'risk', 'impact', 'rollback', 'validation', 'approval',
            'implementation', 'testing', 'deployment', 'configuration',
            'backup', 'restore', 'downtime', 'maintenance', 'schedule'
        ];

        itilKeywords.forEach(keyword => {
            if (new RegExp(keyword, 'i').test(content)) {
                analysis.keywords.push(keyword);
            }
        });

        return analysis;
    }

    /**
     * Extract procedures/steps from MOP
     */
    extractProcedures(content) {
        const procedures = [];
        
        // Try to extract numbered steps
        const stepRegex = /(?:step\s+)?(\d+)[.:)]\s*([^\n]+)/gi;
        let match;
        
        while ((match = stepRegex.exec(content)) !== null) {
            procedures.push({
                number: match[1],
                description: match[2].trim()
            });
        }

        // If no numbered steps found, try to extract sections
        if (procedures.length === 0) {
            const sections = content.split(/\n\n+/);
            sections.forEach((section, index) => {
                const trimmed = section.trim();
                if (trimmed.length > 20 && trimmed.length < 500) {
                    procedures.push({
                        number: index + 1,
                        description: trimmed
                    });
                }
            });
        }

        return procedures;
    }

    /**
     * Generate ITIL 4 alignment assessment for MOP
     */
    assessITIL4Alignment(documentAnalysis, content) {
        const assessment = {
            score: 0,
            strengths: [],
            gaps: [],
            recommendations: []
        };

        let score = 0;

        // Check for rollback procedures (+20 points)
        if (documentAnalysis.hasRollback) {
            score += 20;
            assessment.strengths.push('Includes rollback procedures');
        } else {
            assessment.gaps.push('Missing rollback procedures');
            assessment.recommendations.push('Add detailed rollback procedures for risk mitigation');
        }

        // Check for validation (+15 points)
        if (documentAnalysis.hasValidation) {
            score += 15;
            assessment.strengths.push('Contains validation steps');
        } else {
            assessment.gaps.push('Missing validation procedures');
            assessment.recommendations.push('Include validation steps to verify successful implementation');
        }

        // Check for risk assessment (+20 points)
        if (documentAnalysis.hasRisks) {
            score += 20;
            assessment.strengths.push('Addresses risks and impacts');
        } else {
            assessment.gaps.push('No risk assessment documented');
            assessment.recommendations.push('Conduct and document thorough risk assessment');
        }

        // Check for structured procedures (+15 points)
        if (documentAnalysis.stepCount > 0) {
            score += 15;
            assessment.strengths.push(`Well-structured with ${documentAnalysis.stepCount} documented steps`);
        } else {
            assessment.gaps.push('Lacks clear step-by-step procedures');
            assessment.recommendations.push('Structure the procedure into clear, numbered steps');
        }

        // Check for key ITIL concepts (+30 points total, distributed)
        const requiredKeywords = ['approval', 'backup', 'testing', 'schedule'];
        const foundKeywords = requiredKeywords.filter(kw => 
            documentAnalysis.keywords.includes(kw)
        );
        
        score += foundKeywords.length * 7.5;
        
        if (foundKeywords.length > 0) {
            assessment.strengths.push(`Addresses key concepts: ${foundKeywords.join(', ')}`);
        }

        const missingKeywords = requiredKeywords.filter(kw => 
            !documentAnalysis.keywords.includes(kw)
        );
        
        if (missingKeywords.length > 0) {
            assessment.gaps.push(`Consider adding: ${missingKeywords.join(', ')}`);
        }

        assessment.score = Math.min(Math.round(score), 100);

        return assessment;
    }

    /**
     * Create summary of document for display
     */
    createDocumentSummary(parsedDocument) {
        const { filename, analysis, content } = parsedDocument;
        
        const wordCount = content.split(/\s+/).length;
        const charCount = content.length;

        return {
            filename,
            wordCount,
            charCount,
            type: analysis.type,
            stepCount: analysis.stepCount,
            characteristics: analysis.characteristics,
            keywords: analysis.keywords.slice(0, 10), // Top 10 keywords
            hasRollback: analysis.hasRollback,
            hasValidation: analysis.hasValidation
        };
    }

    /**
     * Extract key sections from MOP for targeted analysis
     */
    extractKeySections(content) {
        const sections = {
            objective: '',
            prerequisites: '',
            procedure: '',
            rollback: '',
            validation: '',
            risks: ''
        };

        // Simple section extraction based on headers
        const sectionRegex = {
            objective: /(?:objective|purpose|goal)[:\s]*([^]*?)(?=\n(?:prerequisite|procedure|step|\n\n)|$)/i,
            prerequisites: /(?:prerequisite|requirement|preparation)[:\s]*([^]*?)(?=\n(?:procedure|step|implementation|\n\n)|$)/i,
            procedure: /(?:procedure|implementation|steps)[:\s]*([^]*?)(?=\n(?:rollback|validation|test|\n\n)|$)/i,
            rollback: /(?:rollback|backout|revert)[:\s]*([^]*?)(?=\n(?:validation|test|risk|\n\n)|$)/i,
            validation: /(?:validation|testing|verification)[:\s]*([^]*?)(?=\n(?:risk|conclusion|\n\n)|$)/i,
            risks: /(?:risk|impact|concern)[:\s]*([^]*?)(?=\n(?:conclusion|end|\n\n)|$)/i
        };

        for (const [key, regex] of Object.entries(sectionRegex)) {
            const match = content.match(regex);
            if (match) {
                sections[key] = match[1].trim();
            }
        }

        return sections;
    }
}

export default DocumentParser;
