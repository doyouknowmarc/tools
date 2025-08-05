import React, { useState, useMemo } from 'react';
import { Calculator, DollarSign, Search, Layers, Zap, BarChart3, ArrowRight } from 'lucide-react';
import Card from './ui/Card';

const RAGTokenCalculator = () => {
  const [scenario, setScenario] = useState('medium');
  const [customValues, setCustomValues] = useState({
    userQuery: 25,
    chunkSize: 600,
    numChunks: 15,
    topKChunks: 4,
    reRankOverhead: 100,
    reRankOutputTokens: 50,
    ragSystemPrompt: 150,
    finalAnswerTokens: 300,
    inputTokenPrice: 2,
    outputTokenPrice: 8
  });

  const scenarios = {
    low: {
      userQuery: 8,
      chunkSize: 300,
      numChunks: 10,
      topKChunks: 3,
      reRankOverhead: 50,
      reRankOutputTokens: 30,
      ragSystemPrompt: 100,
      finalAnswerTokens: 150,
      description: 'Simple queries, small chunks, minimal context'
    },
    medium: {
      userQuery: 25,
      chunkSize: 600,
      numChunks: 15,
      topKChunks: 4,
      reRankOverhead: 100,
      reRankOutputTokens: 50,
      ragSystemPrompt: 150,
      finalAnswerTokens: 300,
      description: 'Typical business queries with moderate context'
    },
    high: {
      userQuery: 60,
      chunkSize: 1200,
      numChunks: 20,
      topKChunks: 5,
      reRankOverhead: 200,
      reRankOutputTokens: 80,
      ragSystemPrompt: 200,
      finalAnswerTokens: 800,
      description: 'Complex queries, large chunks, extensive context'
    }
  };

  const currentValues = scenario === 'custom' ? customValues : {
    ...scenarios[scenario],
    inputTokenPrice: customValues.inputTokenPrice,
    outputTokenPrice: customValues.outputTokenPrice
  };

  const calculations = useMemo(() => {
    const {
      userQuery,
      chunkSize,
      numChunks,
      topKChunks,
      reRankOverhead,
      reRankOutputTokens,
      ragSystemPrompt,
      finalAnswerTokens,
      inputTokenPrice,
      outputTokenPrice
    } = currentValues;

    const inputPricePerToken = inputTokenPrice / 1_000_000;
    const outputPricePerToken = outputTokenPrice / 1_000_000;

    const step1_Query = userQuery;
    const step2_ChunksN = chunkSize * numChunks;
    const step3_PromptRerank = userQuery + step2_ChunksN + reRankOverhead;
    const step3_Cost = step3_PromptRerank * inputPricePerToken;
    const step4_OutputRerank = reRankOutputTokens;
    const step4_Cost = step4_OutputRerank * outputPricePerToken;
    const step5_PromptRAG = userQuery + (chunkSize * topKChunks) + ragSystemPrompt;
    const step5_Cost = step5_PromptRAG * inputPricePerToken;
    const step6_OutputAnswer = finalAnswerTokens;
    const step6_Cost = step6_OutputAnswer * outputPricePerToken;

    const totalInputTokens = step3_PromptRerank + step5_PromptRAG;
    const totalOutputTokens = step4_OutputRerank + step6_OutputAnswer;
    const totalTokens = totalInputTokens + totalOutputTokens;

    const totalInputCost = step3_Cost + step5_Cost;
    const totalOutputCost = step4_Cost + step6_Cost;
    const totalCost = totalInputCost + totalOutputCost;

    return {
      step1_Query,
      step2_ChunksN,
      step3_PromptRerank,
      step3_Cost,
      step4_OutputRerank,
      step4_Cost,
      step5_PromptRAG,
      step5_Cost,
      step6_OutputAnswer,
      step6_Cost,
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalInputCost,
      totalOutputCost,
      totalCost
    };
  }, [currentValues]);

  const handleCustomChange = (field, value) => {
    setCustomValues(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  return (
    <div className="space-y-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Calculator className="w-8 h-8 text-black" />
          <h1 className="text-3xl font-bold text-gray-800">RAG Pipeline Token & Cost Calculator</h1>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Calculate precise token usage and costs for each step of your RAG pipeline: retrieval, re-ranking, and generation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-black" />
              Scenario
            </h2>

            <div className="space-y-3 mb-6">
              {Object.entries(scenarios).map(([key, config]) => (
                <div key={key} className="relative">
                  <input
                    type="radio"
                    id={key}
                    name="scenario"
                    value={key}
                    checked={scenario === key}
                    onChange={(e) => setScenario(e.target.value)}
                    className="sr-only"
                  />
                  <label
                    htmlFor={key}
                    className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      scenario === key
                        ? 'border-black bg-gray-50'
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    <div className="font-medium capitalize text-gray-800 text-sm">{key}</div>
                    <div className="text-xs text-gray-600 mt-1">{config.description}</div>
                  </label>
                </div>
              ))}

              <div className="relative">
                <input
                  type="radio"
                  id="custom"
                  name="scenario"
                  value="custom"
                  checked={scenario === 'custom'}
                  onChange={(e) => setScenario(e.target.value)}
                  className="sr-only"
                />
                <label
                  htmlFor="custom"
                  className={`block p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    scenario === 'custom'
                      ? 'border-black bg-gray-50'
                      : 'border-gray-200 hover:border-black'
                  }`}
                >
                  <div className="font-medium text-gray-800 text-sm">Custom</div>
                  <div className="text-xs text-gray-600 mt-1">Set your own parameters</div>
                </label>
              </div>
            </div>

            {scenario === 'custom' && (
              <div className="space-y-3 pt-4 border-t">
                <h3 className="font-medium text-gray-800 text-sm">Parameters</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">User Query Tokens</label>
                    <input
                      type="number"
                      value={customValues.userQuery}
                      onChange={(e) => handleCustomChange('userQuery', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Length of user's question/input. Used in Steps 3 & 5. Priced as input tokens.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Chunk Size (tokens)</label>
                    <input
                      type="number"
                      value={customValues.chunkSize}
                      onChange={(e) => handleCustomChange('chunkSize', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Average tokens per document chunk. Multiplied by N chunks for reranking, by Top-K for final RAG.
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Chunks Retrieved (N)</label>
                    <input
                      type="number"
                      value={customValues.numChunks}
                      onChange={(e) => handleCustomChange('numChunks', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Total chunks from vector search sent to reranker. Used in Step 3 reranking prompt (input cost).
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Top-K Selected</label>
                    <input
                      type="number"
                      value={customValues.topKChunks}
                      onChange={(e) => handleCustomChange('topKChunks', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Best chunks selected by reranker for final answer. Used in Step 5 RAG prompt (input cost).
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rerank Overhead</label>
                    <input
                      type="number"
                      value={customValues.reRankOverhead}
                      onChange={(e) => handleCustomChange('reRankOverhead', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Reranking system prompt and instructions. Added to Step 3 reranking prompt (input cost).
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Rerank Output</label>
                    <input
                      type="number"
                      value={customValues.reRankOutputTokens}
                      onChange={(e) => handleCustomChange('reRankOutputTokens', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Reranker's response with top-K chunk IDs/scores. Step 4 output (output cost).
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">RAG System Prompt</label>
                    <input
                      type="number"
                      value={customValues.ragSystemPrompt}
                      onChange={(e) => handleCustomChange('ragSystemPrompt', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Instructions for final answer generation. Added to Step 5 RAG prompt (input cost).
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Final Answer Tokens</label>
                    <input
                      type="number"
                      value={customValues.finalAnswerTokens}
                      onChange={(e) => handleCustomChange('finalAnswerTokens', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Length of generated response to user. Step 6 output (output cost).
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4" />
                Token Pricing
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Input Token Price ($ per 1M tokens)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customValues.inputTokenPrice}
                    onChange={(e) => handleCustomChange('inputTokenPrice', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Cost per million input tokens. Applied to Steps 3 & 5 (reranking and RAG prompts).
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Output Token Price ($ per 1M tokens)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={customValues.outputTokenPrice}
                    onChange={(e) => handleCustomChange('outputTokenPrice', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Cost per million output tokens. Applied to Steps 4 & 6 (reranker response and final answer).
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <Card>
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-black" />
              RAG Pipeline Steps & Costs
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <span className="font-medium">User Query Input</span>
                    <div className="text-sm text-gray-600">Initial query from user</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-black">{calculations.step1_Query.toLocaleString()} tokens</div>
                  <div className="text-sm text-gray-500">No cost (stored)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <span className="font-medium">Retriever Returns N Chunks</span>
                    <div className="text-sm text-gray-600">Vector search retrieves candidate chunks</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-600">{calculations.step2_ChunksN.toLocaleString()} tokens</div>
                  <div className="text-sm text-gray-500">No cost (retrieval)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <span className="font-medium">Reranker Prompt</span>
                    <div className="text-sm text-gray-600">Query + All chunks + instructions</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-black">{calculations.step3_PromptRerank.toLocaleString()} tokens</div>
                  <div className="text-sm text-black font-medium">${calculations.step3_Cost.toFixed(6)} (input)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <span className="font-medium">Reranker Output</span>
                    <div className="text-sm text-gray-600">Top-K chunk IDs or rankings</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-black">{calculations.step4_OutputRerank.toLocaleString()} tokens</div>
                  <div className="text-sm text-black font-medium">${calculations.step4_Cost.toFixed(6)} (output)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
                  <div>
                    <span className="font-medium">Final RAG Prompt</span>
                    <div className="text-sm text-gray-600">Query + Top-K chunks + system prompt</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-black">{calculations.step5_PromptRAG.toLocaleString()} tokens</div>
                  <div className="text-sm text-black font-medium">${calculations.step5_Cost.toFixed(6)} (input)</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold">6</div>
                  <div>
                    <span className="font-medium">Model Output (Answer)</span>
                    <div className="text-sm text-gray-600">Final generated response</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-black">{calculations.step6_OutputAnswer.toLocaleString()} tokens</div>
                  <div className="text-sm text-black font-medium">${calculations.step6_Cost.toFixed(6)} (output)</div>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Token Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Input Tokens:</span>
                <span className="font-semibold">{calculations.totalInputTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Output Tokens:</span>
                <span className="font-semibold">{calculations.totalOutputTokens.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-800 font-medium">Total Tokens:</span>
                <span className="font-bold text-lg">{calculations.totalTokens.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-black" />
              Cost Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Input Costs (Steps 3+5):</span>
                <span className="font-semibold">${calculations.totalInputCost.toFixed(6)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Output Costs (Steps 4+6):</span>
                <span className="font-semibold">${calculations.totalOutputCost.toFixed(6)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-800 font-medium">Total Cost per Query:</span>
                <span className="font-bold text-lg text-black">${calculations.totalCost.toFixed(6)}</span>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Volume Projections</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { queries: 100, period: '100 queries' },
                { queries: 1000, period: '1K queries' },
                { queries: 10000, period: '10K queries' },
                { queries: 100000, period: '100K queries' }
              ].map(({ queries, period }) => (
                <div key={queries} className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">{period}</div>
                  <div className="text-xl font-bold text-black">
                    ${(calculations.totalCost * queries).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {(calculations.totalTokens * queries / 1000000).toFixed(1)}M tokens
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RAGTokenCalculator;
