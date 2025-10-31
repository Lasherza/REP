const OpenAI = require('openai');
const axios = require('axios');

class ResearchAgent {
  constructor(openaiApiKey, tavilyApiKey) {
    this.openai = new OpenAI({ apiKey: openaiApiKey });
    this.tavilyApiKey = tavilyApiKey;
  }

  /**
   * Break down a mission into actionable steps using AI
   */
  async planMission(mission) {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a research planning assistant. Break down research missions into 3-7 clear, actionable steps.
Each step should be specific and focused. Format your response as a JSON array of objects with this structure:
[
  {
    "step_number": 1,
    "description": "Clear description of what to do",
    "requires_search": true/false,
    "search_query": "specific search query if requires_search is true"
  }
]

Guidelines:
- Keep it between 3-7 steps
- Be specific and actionable
- Indicate if web search is needed
- Provide a targeted search query for research steps`
          },
          {
            role: 'user',
            content: `Create a research plan for this mission: ${mission}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const parsed = JSON.parse(content);
      
      // Handle different response formats
      const steps = parsed.steps || parsed.plan || Object.values(parsed)[0];
      
      return {
        success: true,
        steps: steps,
        mission: mission
      };
    } catch (error) {
      console.error('Error planning mission:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute a single research step
   */
  async executeStep(step, mission) {
    try {
      let searchResults = null;
      
      // Perform web search if needed
      if (step.requires_search && this.tavilyApiKey) {
        searchResults = await this.searchWeb(step.search_query || step.description);
      }

      // Analyze the findings using AI
      const analysis = await this.analyzeFindings(step, searchResults, mission);

      return {
        success: true,
        step_number: step.step_number,
        description: step.description,
        search_performed: step.requires_search,
        search_query: step.search_query || null,
        findings: analysis.findings,
        sources: searchResults?.sources || []
      };
    } catch (error) {
      console.error('Error executing step:', error);
      return {
        success: false,
        step_number: step.step_number,
        error: error.message
      };
    }
  }

  /**
   * Search the web using Tavily API
   */
  async searchWeb(query) {
    try {
      if (!this.tavilyApiKey) {
        return {
          success: false,
          message: 'Tavily API key not configured',
          sources: []
        };
      }

      const response = await axios.post(
        'https://api.tavily.com/search',
        {
          api_key: this.tavilyApiKey,
          query: query,
          search_depth: 'advanced',
          max_results: 5
        }
      );

      return {
        success: true,
        query: query,
        results: response.data.results || [],
        sources: (response.data.results || []).map(r => ({
          title: r.title,
          url: r.url,
          snippet: r.content
        }))
      };
    } catch (error) {
      console.error('Error searching web:', error);
      return {
        success: false,
        error: error.message,
        sources: []
      };
    }
  }

  /**
   * Analyze findings using AI
   */
  async analyzeFindings(step, searchResults, mission) {
    try {
      const searchContext = searchResults?.results 
        ? searchResults.results.map(r => `- ${r.title}: ${r.content}`).join('\n')
        : 'No web search performed for this step.';

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a research analyst. Analyze information and provide clear, concise findings.
Focus on key insights relevant to the research mission.`
          },
          {
            role: 'user',
            content: `Mission: ${mission}

Current Step: ${step.description}

Information gathered:
${searchContext}

Provide a clear analysis of the findings for this step. Be concise but informative.`
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });

      return {
        success: true,
        findings: response.choices[0].message.content
      };
    } catch (error) {
      console.error('Error analyzing findings:', error);
      return {
        success: false,
        findings: 'Error analyzing findings: ' + error.message
      };
    }
  }

  /**
   * Generate final report from all step results
   */
  async generateReport(mission, stepResults) {
    try {
      const stepsContext = stepResults
        .map(r => `Step ${r.step_number}: ${r.description}\n${r.findings}\n`)
        .join('\n---\n\n');

      const allSources = stepResults
        .flatMap(r => r.sources || [])
        .filter((source, index, self) => 
          index === self.findIndex(s => s.url === source.url)
        );

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a research report writer. Create comprehensive, well-structured reports.
Format the report in markdown with clear sections, bullet points, and actionable insights.`
          },
          {
            role: 'user',
            content: `Create a comprehensive research report for this mission:

Mission: ${mission}

Research Steps and Findings:
${stepsContext}

Create a well-structured report with:
1. Executive Summary
2. Key Findings (organized by theme)
3. Detailed Analysis
4. Actionable Insights/Recommendations
5. Conclusion

Use markdown formatting.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      return {
        success: true,
        report: response.choices[0].message.content,
        sources: allSources,
        mission: mission,
        steps_completed: stepResults.length
      };
    } catch (error) {
      console.error('Error generating report:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = ResearchAgent;
