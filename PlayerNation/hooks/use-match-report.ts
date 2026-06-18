import { useCallback, useState } from 'react';

import { resolveApiKey } from '@/lib/config/api-key';
import { processedDataToPromptPayload, processMatchEvents } from '@/lib/data/event-processor';
import { fetchMatchEvents, getMatchById } from '@/lib/data/match-loader';
import { generateMatchReport, LlmError } from '@/lib/llm/groq-client';
import type { MatchReport, ProcessedMatchData, ReportGenerationStatus } from '@/types/match';

interface UseMatchReportResult {
  status: ReportGenerationStatus;
  report: MatchReport | null;
  processedData: ProcessedMatchData | null;
  error: string | null;
  generate: (matchId: number) => Promise<void>;
  reset: () => void;
}

export function useMatchReport(): UseMatchReportResult {
  const [status, setStatus] = useState<ReportGenerationStatus>('idle');
  const [report, setReport] = useState<MatchReport | null>(null);
  const [processedData, setProcessedData] = useState<ProcessedMatchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStatus('idle');
    setReport(null);
    setProcessedData(null);
    setError(null);
  }, []);

  const generate = useCallback(async (matchId: number) => {
    reset();
    const match = getMatchById(matchId);

    if (!match) {
      setStatus('error');
      setError('Match not found.');
      return;
    }

    try {
      setStatus('loading-events');
      const rawData = await fetchMatchEvents(matchId);

      setStatus('processing');
      const processed = processMatchEvents(rawData, match);
      setProcessedData(processed);

      const apiKey = await resolveApiKey();
      if (!apiKey) {
        setStatus('error');
        setError('Add your Groq API key in Settings to generate reports.');
        return;
      }

      setStatus('generating');
      const payload = processedDataToPromptPayload(processed);
      const generated = await generateMatchReport(payload, apiKey);

      setReport(generated);
      setStatus('complete');
    } catch (err) {
      setStatus('error');
      if (err instanceof LlmError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
  }, [reset]);

  return { status, report, processedData, error, generate, reset };
}
