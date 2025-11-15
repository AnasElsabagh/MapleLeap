import React, { useState } from 'react';
import { Reports } from '../types';
import WorldMap from './WorldMap';
import CircularProgress from './CircularProgress';
import CopyIcon from './icons/CopyIcon';
import { GearIcon, ChartBarIcon, HeadsetIcon } from './icons/OptimizationIcons';
import ContactModal from './ContactModal';

interface ReportViewProps {
  reports: Reports;
  onReset: () => void;
}

type Tab = 'scaling' | 'optimization';

const ReportView: React.FC<ReportViewProps> = ({ reports, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('scaling');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [expandedMarket, setExpandedMarket] = useState<string | null>(
    reports.scaling.markets[0]?.country || null
  );

  const handleCopyEmail = (email: string, market: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(market);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const openContactModal = (company: string) => {
    setSelectedCompany(company);
    setModalOpen(true);
  };
  
  const OptimizationIcon: React.FC<{ category: string }> = ({ category }) => {
    const iconClass = "h-8 w-8 text-yellow-500";
    if (category.toLowerCase().includes('operations')) return <GearIcon className={iconClass} />;
    if (category.toLowerCase().includes('marketing')) return <ChartBarIcon className={iconClass} />;
    if (category.toLowerCase().includes('customer')) return <HeadsetIcon className={iconClass} />;
    return <GearIcon className={iconClass} />;
  };

  const renderScalingReport = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Top 3 Recommended Export Markets</h2>
        <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
          <WorldMap highlightedCountries={reports.scaling.markets.map(m => m.country)} />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {reports.scaling.markets.map((market) => (
          <div key={market.country} className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{market.country}</h3>
              </div>
              <CircularProgress score={market.score} />
            </div>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{market.justification}</p>
          </div>
        ))}
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Market Deep Dives</h2>
        <div className="space-y-2">
            {reports.scaling.markets.map((market) => (
              <div key={market.country} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setExpandedMarket(expandedMarket === market.country ? null : market.country)}
                  className="w-full text-left p-6 flex justify-between items-center hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-500"
                  aria-expanded={expandedMarket === market.country}
                  aria-controls={`deep-dive-${market.country}`}
                >
                  <h3 className="text-xl font-bold text-gray-800">Details for {market.country}</h3>
                  <svg className={`h-6 w-6 transform transition-transform text-gray-500 ${expandedMarket === market.country ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedMarket === market.country && (
                  <div className="p-6 pt-0" id={`deep-dive-${market.country}`}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Top B2B Companies to Target</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                              {market.deepDive.targetCompanies.map(company => (
                                  <li key={company}>
                                      {company}
                                      <button onClick={() => openContactModal(company)} className="ml-2 text-xs text-yellow-600 hover:underline" aria-label={`Show contacts for ${company}`}>(contacts)</button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div>
                          <h4 className="font-semibold text-gray-700 mb-2">Top Distribution/Sales Partners</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                               {market.deepDive.distributionPartners.map(partner => (
                                  <li key={partner}>
                                      {partner}
                                      <button onClick={() => openContactModal(partner)} className="ml-2 text-xs text-yellow-600 hover:underline" aria-label={`Show contacts for ${partner}`}>(contacts)</button>
                                  </li>
                              ))}
                          </ul>
                      </div>
                      <div className="md:col-span-2 lg:col-span-1 bg-gray-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-700">Initial Outreach Email</h4>
                            <button onClick={() => handleCopyEmail(market.deepDive.outreachEmail, market.country)} className="text-gray-500 hover:text-gray-800 p-1" aria-label={`Copy email for ${market.country}`}>
                                {copiedEmail === market.country ? <span className="text-xs text-green-600">Copied!</span> : <CopyIcon className="h-5 w-5" />}
                            </button>
                          </div>
                          <p className="text-xs text-gray-600 whitespace-pre-wrap font-mono">{market.deepDive.outreachEmail}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const renderOptimizationReport = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">AI-Powered Productivity Recommendations</h2>
      {reports.optimization.categories.map((category) => (
        <div key={category.title} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center mb-4">
              <div className="bg-yellow-100 p-3 rounded-full mr-4">
                 <OptimizationIcon category={category.title} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">{category.title}</h3>
            </div>
            <div className="space-y-4">
                {category.recommendations.map(rec => (
                    <div key={rec.type} className="border-t border-gray-200 pt-4">
                        <p className="font-semibold text-gray-700">{rec.type}</p>
                        <p className="text-sm text-gray-600 mt-1">{rec.explanation}</p>
                        <p className="text-sm text-gray-500 mt-2"><strong>Examples:</strong> {rec.examples.join(', ')}</p>
                    </div>
                ))}
            </div>
        </div>
      ))}
    </div>
  );
  

  return (
    <div className="w-full max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <button
                onClick={onReset}
                className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
                &larr; New Report
            </button>
            <div className="bg-gray-200 p-1 rounded-lg flex space-x-1" role="tablist" aria-label="Report tabs">
                <button
                    onClick={() => setActiveTab('scaling')}
                    className={`py-2 px-6 rounded-md text-sm font-medium transition-colors ${activeTab === 'scaling' ? 'bg-white text-gray-800 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                    role="tab"
                    aria-selected={activeTab === 'scaling'}
                >
                    Scaling Report
                </button>
                <button
                    onClick={() => setActiveTab('optimization')}
                    className={`py-2 px-6 rounded-md text-sm font-medium transition-colors ${activeTab === 'optimization' ? 'bg-white text-gray-800 shadow' : 'text-gray-600 hover:bg-gray-300'}`}
                    role="tab"
                    aria-selected={activeTab === 'optimization'}
                >
                    Optimization Report
                </button>
            </div>
        </div>
        
        <div role="tabpanel">
            {activeTab === 'scaling' ? renderScalingReport() : renderOptimizationReport()}
        </div>

        <ContactModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            companyName={selectedCompany} 
        />
    </div>
  );
};

export default ReportView;