import React, { useState } from 'react';
import { Reports, ScalingReport, OptimizationReport, Market, MarketDeepDive, OptimizationCategory, Recommendation } from './types';
import { generateReports } from './services/geminiService';
import FormView from './components/FormView';
import ReportView from './components/ReportView';

// Helper: Markdown List Item Parser
const parseList = (lines: string[]): string[] => {
  return lines
    .map(line => line.trim())
    .filter(line => line.startsWith('*') || line.startsWith('-'))
    .map(line => line.replace(/^[\*\-]\s*/, '').trim());
};


// Main Parser
const parseGeminiResponse = (markdown: string): Reports => {
  const sections = markdown.split('---');
  const scalingText = sections.length > 1 ? sections[0] : (markdown.includes('[SCALING REPORT]') && !markdown.includes('[OPTIMIZATION REPORT]') ? markdown : '');
  const optimizationText = sections.length > 1 ? sections[1] : (markdown.includes('[OPTIMIZATION REPORT]') ? markdown : '');

  // Parse Scaling Report
  const scalingReport: ScalingReport = { markets: [] };
  if (scalingText.includes('[SCALING REPORT]')) {
    const marketBlocks = scalingText.split(/### Market \d:/).slice(1);
    const deepDiveBlocks = scalingText.split('### Details for').slice(1);

    marketBlocks.forEach((block, index) => {
      const marketMatch = block.match(/(.*?) \| (\d+)\/100/);
      if (!marketMatch) return;
      
      const country = marketMatch[1].trim();
      const score = parseInt(marketMatch[2], 10);

      const justificationMatch = block.match(/\*\*Justification:\*\* ([\s\S]*?)(?=\n###|\n\n|$)/);
      const justification = justificationMatch ? justificationMatch[1].trim() : '';

      if (index < deepDiveBlocks.length) {
          const deepDiveText = deepDiveBlocks[index] || '';
          const lines = deepDiveText.split('\n');
          
          const companiesIndex = lines.findIndex(l => l.includes('Top B2B Companies to Target'));
          const partnersIndex = lines.findIndex(l => l.includes('Top Distribution/Sales Partners'));
          const emailIndex = lines.findIndex(l => l.includes('Initial Outreach Email Draft'));

          if (companiesIndex > -1 && partnersIndex > -1 && emailIndex > -1) {
              const companies = parseList(lines.slice(companiesIndex + 1, partnersIndex));
              const partners = parseList(lines.slice(partnersIndex + 1, emailIndex));
              const email = lines.slice(emailIndex + 1).join('\n').trim();

              const deepDive: MarketDeepDive = {
                targetCompanies: companies,
                distributionPartners: partners,
                outreachEmail: email,
              };

              const market: Market = {
                country,
                score,
                justification,
                deepDive,
              };
              scalingReport.markets.push(market);
          }
      }
    });
  }

  // Parse Optimization Report
  const optimizationReport: OptimizationReport = { categories: [] };
  if (optimizationText.includes('[OPTIMIZATION REPORT]')) {
    const categoryBlocks = optimizationText.split('### ').slice(1);

    categoryBlocks.forEach(block => {
      const lines = block.split('\n').filter(line => line.trim() !== '');
      if (lines.length === 0) return;

      const title = lines[0].trim();
      const recommendations: Recommendation[] = [];
      
      lines.slice(1).forEach(line => {
        const recMatch = line.match(/\*\s+\*\*(.*?):\*\*\s(.*?)\.?\s+\*\*Examples:\*\*\s*(.*)/i);
        if (recMatch) {
          const type = recMatch[1].trim();
          const explanation = recMatch[2].trim();
          const examples = recMatch[3].replace(/\[|\]/g, '').split(',').map(ex => ex.trim()).filter(Boolean);
          recommendations.push({ type, explanation, examples });
        }
      });
      if(recommendations.length > 0) {
        optimizationReport.categories.push({ title, recommendations });
      }
    });
  }

  if (scalingReport.markets.length === 0 && optimizationReport.categories.length === 0) {
      throw new Error("Could not parse the response from the AI. The format might be incorrect. Please try again.");
  }


  return {
    scaling: scalingReport,
    optimization: optimizationReport,
  };
};

const App: React.FC = () => {
  const [reports, setReports] = useState<Reports | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (userInput: string) => {
    setIsLoading(true);
    setError(null);
    setReports(null);
    try {
      const markdownResponse = await generateReports(userInput);
      if (!markdownResponse) {
        throw new Error("Received an empty response from the AI.");
      }
      const parsedReports = parseGeminiResponse(markdownResponse);
      setReports(parsedReports);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReports(null);
    setError(null);
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800 font-sans">
      <header className="p-4 sm:p-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            MapleLeap <span className="text-yellow-500">AI</span>
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4 sm:p-6">
        {!reports ? (
          <FormView
            onSubmit={handleFormSubmit}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <ReportView reports={reports} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default App;