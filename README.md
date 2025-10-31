# ?? AI Research & Analysis Agent

An autonomous AI-powered research agent that breaks down complex research missions into actionable steps, executes them using web search, and compiles comprehensive reports.

## ? Features

- **Autonomous Task Planning**: AI automatically breaks down research missions into logical steps
- **Web Search Integration**: Uses Tavily API for comprehensive information gathering
- **Real-time Progress Tracking**: Watch as the agent executes each research step
- **Comprehensive Reports**: Get structured, well-formatted research reports with cited sources
- **Modern UI**: Clean, responsive interface with dark mode support
- **Export Functionality**: Download reports in markdown format

## ?? Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Tavily API key ([Get one here](https://tavily.com))

### Installation

1. **Clone or download this repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env`:
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your API keys:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   TAVILY_API_KEY=your_tavily_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to: `http://localhost:3000`

## ?? How to Use

### 1. Enter Your Research Mission

In the text area, describe what you want to research. Be specific and clear. Examples:

- "Research the latest developments in quantum computing and their potential applications in cryptography"
- "Analyze the impact of artificial intelligence on the healthcare industry, focusing on diagnostics and patient care"
- "Investigate current trends in renewable energy adoption in Europe"

### 2. Review the Research Plan

The AI will break down your mission into 3-7 actionable steps. Each step will indicate:
- What will be researched
- Whether web search is needed
- The specific search query (if applicable)

You can either:
- **Execute the plan** as proposed
- **Modify** your mission and regenerate the plan

### 3. Watch the Execution

The agent will execute each step sequentially:
- Real-time progress bar shows overall completion
- Each step shows its status (processing, completed)
- Search queries and key findings are displayed as they're discovered

### 4. Review the Final Report

Once complete, you'll receive:
- **Executive Summary**: High-level overview
- **Key Findings**: Main insights organized by theme
- **Detailed Analysis**: In-depth research results
- **Actionable Insights**: Recommendations based on findings
- **Sources**: All web sources cited with links

### 5. Export Your Report

Click "Export Markdown" to download the report for future reference or sharing.

## ??? Project Structure

```
.
??? server.js           # Express backend server
??? agent.js            # Core AI agent logic (planning, execution, reporting)
??? index.html          # Main UI interface
??? app.js              # Frontend JavaScript logic
??? styles.css          # Styling and theming
??? package.json        # Dependencies and scripts
??? .env.example        # Environment variables template
??? .env                # Your API keys (create this)
??? README.md           # This file
```

## ?? API Endpoints

### `POST /api/plan`
Create a research plan from a mission.

**Request:**
```json
{
  "mission": "Research quantum computing applications"
}
```

**Response:**
```json
{
  "success": true,
  "steps": [
    {
      "step_number": 1,
      "description": "Research current quantum computing technologies",
      "requires_search": true,
      "search_query": "latest quantum computing technologies 2024"
    }
  ]
}
```

### `POST /api/execute-step`
Execute a single research step.

**Request:**
```json
{
  "step": {
    "step_number": 1,
    "description": "Research quantum computing",
    "requires_search": true,
    "search_query": "quantum computing applications"
  },
  "mission": "Research quantum computing applications"
}
```

**Response:**
```json
{
  "success": true,
  "step_number": 1,
  "description": "Research quantum computing",
  "search_performed": true,
  "search_query": "quantum computing applications",
  "findings": "Key findings from the research...",
  "sources": [
    {
      "title": "Article Title",
      "url": "https://example.com",
      "snippet": "Relevant excerpt..."
    }
  ]
}
```

### `POST /api/generate-report`
Generate final comprehensive report.

**Request:**
```json
{
  "mission": "Research quantum computing applications",
  "stepResults": [...]
}
```

**Response:**
```json
{
  "success": true,
  "report": "# Research Report\n\n## Executive Summary...",
  "sources": [...],
  "steps_completed": 5
}
```

### `GET /api/health`
Check API configuration status.

**Response:**
```json
{
  "status": "ok",
  "openai_configured": true,
  "tavily_configured": true
}
```

## ?? Customization

### Changing the AI Model

Edit `agent.js` and modify the model parameter in the OpenAI calls:

```javascript
const response = await this.openai.chat.completions.create({
  model: 'gpt-4-turbo-preview', // Change to 'gpt-3.5-turbo' for faster/cheaper
  // ...
});
```

### Adjusting Search Depth

In `agent.js`, modify the Tavily search parameters:

```javascript
const response = await axios.post('https://api.tavily.com/search', {
  api_key: this.tavilyApiKey,
  query: query,
  search_depth: 'advanced', // Change to 'basic' for faster searches
  max_results: 5            // Adjust number of results
});
```

### Customizing the UI Theme

Edit `styles.css` to modify colors and styling. The app uses CSS variables for easy theming:

```css
:root {
  --accent-primary: #3498db;  /* Change primary color */
  --bg-primary: #f5f7fa;      /* Change background */
  /* ... more variables */
}
```

## ?? Troubleshooting

### "OpenAI API key not configured"
- Make sure you've created a `.env` file (not `.env.example`)
- Verify your `OPENAI_API_KEY` is correct
- Restart the server after adding the key

### "Failed to create plan"
- Check your OpenAI API key is valid and has credits
- Check the console for detailed error messages
- Ensure you have internet connectivity

### Tavily search not working
- Verify your `TAVILY_API_KEY` in `.env`
- The agent will still work without Tavily, but won't perform web searches
- Check Tavily API status and your account limits

### Port already in use
- Change the `PORT` in your `.env` file to a different number (e.g., 3001)
- Or stop the process using port 3000

## ?? Tips for Best Results

1. **Be Specific**: The more specific your research mission, the better the results
2. **Structured Topics**: Works best with well-defined research topics
3. **Review Plans**: Always review the proposed plan before execution
4. **API Limits**: Be mindful of API rate limits and costs
5. **Save Reports**: Export important reports for later reference

## ?? Example Research Missions

### Technology Research
- "Analyze the current state of large language models, their capabilities, limitations, and ethical considerations"
- "Research edge computing technologies and their applications in IoT systems"

### Business Analysis
- "Investigate emerging trends in e-commerce and their impact on traditional retail"
- "Research best practices for remote team management and productivity tools"

### Scientific Inquiry
- "Explore recent breakthroughs in CRISPR gene editing and their medical applications"
- "Analyze climate change mitigation strategies being implemented globally"

### Market Research
- "Research the electric vehicle market, including major players, technology trends, and adoption rates"
- "Investigate the future of sustainable packaging in the food industry"

## ?? Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and private
- The `.gitignore` file is configured to exclude `.env`
- Regularly rotate your API keys for security

## ?? License

MIT License - feel free to use this project for personal or commercial purposes.

## ?? Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## ?? Acknowledgments

- **OpenAI** for GPT-4 API
- **Tavily** for web search capabilities
- Built with vanilla JavaScript, Express, and Node.js

---

**Happy Researching! ??**

For questions or issues, please open an issue on the repository.
