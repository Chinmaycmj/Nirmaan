export interface FileChallengeScaffold {
  fullReferenceCode: string;
  scaffoldUserCode: string;
  totalLines: number;
  challengeLineCount: number;
  challengePercent: number;
  startLine: number;
  endLine: number;
  targetConcept: string;
  challengeSectionPreview: string;
}

/**
 * Generates an authentic coding challenge for any file of any size (from 10 to 10,000+ lines).
 * Preserves 80-90% of authentic scaffolding and challenges the user to implement the key 10-20% section.
 */
export function generateFileChallengeScaffold(
  fileContent: string,
  fileName: string,
  language?: string
): FileChallengeScaffold {
  if (!fileContent || !fileContent.trim()) {
    return {
      fullReferenceCode: fileContent || '',
      scaffoldUserCode: fileContent || '',
      totalLines: 0,
      challengeLineCount: 0,
      challengePercent: 0,
      startLine: 1,
      endLine: 1,
      targetConcept: 'Empty File',
      challengeSectionPreview: '',
    };
  }

  const lines = fileContent.split('\n');
  const N = lines.length;
  const lang = (language || '').toLowerCase();

  // Determine comment syntax based on file type
  const isHtml = lang.includes('html') || fileName.endsWith('.html');
  const isCss = lang.includes('css') || fileName.endsWith('.css');
  const isPython = lang.includes('python') || lang.includes('py') || fileName.endsWith('.py');

  const cStart = isHtml ? '<!-- ' : (isCss ? '/* ' : (isPython ? '# ' : '// '));
  const cEnd = isHtml ? ' -->' : (isCss ? ' */' : '');

  // Determine challenge slice size: 10% to 20% of N (bounded reasonably)
  let challengeSize = Math.max(5, Math.min(220, Math.round(N * 0.15)));
  if (N <= 20) {
    challengeSize = Math.max(3, Math.round(N * 0.25));
  } else if (N <= 60) {
    challengeSize = Math.max(8, Math.round(N * 0.20));
  } else if (N > 1000) {
    // For 1000+ lines, 100 to 200 lines (as requested by user)
    challengeSize = Math.min(200, Math.max(100, Math.round(N * 0.12)));
  }

  // Determine start line: skip introductory boilerplate (imports, DOCTYPE, root tags)
  let startIdx = Math.min(Math.round(N * 0.08), 25);
  if (startIdx + challengeSize > N) {
    challengeSize = Math.max(3, N - startIdx);
  }
  let endIdx = Math.min(N - 1, startIdx + challengeSize - 1);
  const actualChallengeCount = endIdx - startIdx + 1;

  const leadingLines = lines.slice(0, startIdx);
  const challengeLines = lines.slice(startIdx, endIdx + 1);
  const trailingLines = lines.slice(endIdx + 1);

  // Extract brief preview of what the challenge implements
  const firstMeaningfulLine = challengeLines.find(l => l.trim().length > 3 && !l.trim().startsWith('//') && !l.trim().startsWith('/*') && !l.trim().startsWith('<!--')) || 'Core architecture';
  const preview = firstMeaningfulLine.trim().slice(0, 80);

  const banner = [
    `${cStart}=========================================================================${cEnd}`,
    `${cStart}🎯 YOUR CHALLENGE: Implement Core Architecture for ${fileName}${cEnd}`,
    `${cStart}Challenge Window: Lines ${startIdx + 1} to ${endIdx + 1} (~${actualChallengeCount} lines, ${Math.round((actualChallengeCount / N) * 100)}% of total file)${cEnd}`,
    `${cStart}Review the 100% full reference code on the left and implement this section below:${cEnd}`,
    `${cStart}=========================================================================${cEnd}`,
    `${cStart}// TODO: Implement lines ${startIdx + 1} through ${endIdx + 1} (${preview})...${cEnd}`,
    '',
  ];

  const scaffoldUserCode = [
    ...leadingLines,
    ...banner,
    ...trailingLines,
  ].join('\n');

  return {
    fullReferenceCode: fileContent,
    scaffoldUserCode,
    totalLines: N,
    challengeLineCount: actualChallengeCount,
    challengePercent: Math.round((actualChallengeCount / N) * 100),
    startLine: startIdx + 1,
    endLine: endIdx + 1,
    targetConcept: `Core Architecture of ${fileName}`,
    challengeSectionPreview: preview,
  };
}
