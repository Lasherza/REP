/**
 * Tavily API Client
 * Handles all interactions with the Tavily Search API
 */

export class TavilyClient {
    constructor(apiKey = null) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.tavily.com';
        this.defaultOptions = {
            search_depth: 'advanced',
            max_results: 5,
            include_answer: true,
            include_raw_content: false,
            include_images: false
        };
    }

    /**
     * Set or update the API key
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Check if the client is configured with an API key
     */
    isConfigured() {
        return !!this.apiKey;
    }

    /**
     * Perform a search query using Tavily API
     * @param {string} query - The search query
     * @param {object} options - Additional search options
     * @returns {Promise<object>} Search results
     */
    async search(query, options = {}) {
        if (!this.isConfigured()) {
            throw new Error('Tavily API key not configured. Please add your API key in settings.');
        }

        const searchOptions = {
            ...this.defaultOptions,
            ...options,
            query,
            api_key: this.apiKey
        };

        try {
            const response = await fetch(`${this.baseUrl}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(searchOptions)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `API request failed with status ${response.status}`);
            }

            const data = await response.json();
            return this.formatSearchResults(data);

        } catch (error) {
            console.error('Tavily search error:', error);
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    /**
     * Format search results into a consistent structure
     */
    formatSearchResults(data) {
        return {
            query: data.query,
            answer: data.answer || null,
            results: (data.results || []).map(result => ({
                title: result.title,
                url: result.url,
                content: result.content,
                score: result.score,
                publishedDate: result.published_date
            })),
            images: data.images || [],
            responseTime: data.response_time
        };
    }

    /**
     * Perform multiple searches in parallel with rate limiting
     * @param {Array<string>} queries - Array of search queries
     * @param {object} options - Search options
     * @returns {Promise<Array<object>>} Array of search results
     */
    async searchMultiple(queries, options = {}) {
        const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
        const results = [];

        // Process queries with a small delay to respect rate limits
        for (let i = 0; i < queries.length; i++) {
            try {
                const result = await this.search(queries[i], options);
                results.push({
                    query: queries[i],
                    success: true,
                    data: result
                });

                // Add delay between requests (except for the last one)
                if (i < queries.length - 1) {
                    await delay(500); // 500ms delay between requests
                }
            } catch (error) {
                results.push({
                    query: queries[i],
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * Search with context for ITIL 4 specific queries
     * Enhances the query with ITIL 4 context
     */
    async searchITIL4(query, options = {}) {
        const itilEnhancedQuery = `${query} ITIL 4 framework best practices`;
        return this.search(itilEnhancedQuery, options);
    }

    /**
     * Extract key information from search results
     */
    extractKeyPoints(searchResults, maxPoints = 5) {
        if (!searchResults.results || searchResults.results.length === 0) {
            return [];
        }

        const points = [];
        
        // Use the answer if available
        if (searchResults.answer) {
            points.push({
                type: 'summary',
                content: searchResults.answer,
                source: 'Tavily AI Summary'
            });
        }

        // Extract content snippets from top results
        searchResults.results.slice(0, maxPoints).forEach(result => {
            if (result.content) {
                points.push({
                    type: 'finding',
                    content: result.content,
                    source: result.title,
                    url: result.url
                });
            }
        });

        return points;
    }

    /**
     * Update default search options
     */
    updateDefaultOptions(options) {
        this.defaultOptions = {
            ...this.defaultOptions,
            ...options
        };
    }

    /**
     * Test the API connection
     */
    async testConnection() {
        try {
            await this.search('ITIL 4 test query', { max_results: 1 });
            return { success: true, message: 'API connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}

// Export a singleton instance
export default TavilyClient;
