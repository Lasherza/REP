require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const ResearchAgent = require('./agent');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize agent
const agent = new ResearchAgent(
  process.env.OPENAI_API_KEY,
  process.env.TAVILY_API_KEY
);

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// API endpoint to create a research plan
app.post('/api/plan', async (req, res) => {
  try {
    const { mission } = req.body;
    
    if (!mission) {
      return res.status(400).json({
        success: false,
        error: 'Mission is required'
      });
    }

    const result = await agent.planMission(mission);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/plan:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to execute a single step
app.post('/api/execute-step', async (req, res) => {
  try {
    const { step, mission } = req.body;
    
    if (!step || !mission) {
      return res.status(400).json({
        success: false,
        error: 'Step and mission are required'
      });
    }

    const result = await agent.executeStep(step, mission);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/execute-step:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// API endpoint to generate final report
app.post('/api/generate-report', async (req, res) => {
  try {
    const { mission, stepResults } = req.body;
    
    if (!mission || !stepResults) {
      return res.status(400).json({
        success: false,
        error: 'Mission and step results are required'
      });
    }

    const result = await agent.generateReport(mission, stepResults);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/generate-report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    openai_configured: !!process.env.OPENAI_API_KEY,
    tavily_configured: !!process.env.TAVILY_API_KEY
  });
});

app.listen(PORT, () => {
  console.log(`?? AI Research Agent running on http://localhost:${PORT}`);
  console.log(`?? OpenAI API: ${process.env.OPENAI_API_KEY ? '? Configured' : '? Not configured'}`);
  console.log(`?? Tavily API: ${process.env.TAVILY_API_KEY ? '? Configured' : '? Not configured'}`);
});
