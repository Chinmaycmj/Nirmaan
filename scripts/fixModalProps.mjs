import fs from 'fs';
import path from 'path';

const workspacePath = path.resolve('components/vercel/VercelWorkspace.tsx');
let content = fs.readFileSync(workspacePath, 'utf8');

// 1. Add masteredConceptIds state & handleElementInspected if missing
if (!content.includes('const [masteredConceptIds, setMasteredConceptIds]')) {
  content = content.replace(
    'const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);',
    'const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);\\n  const [masteredConceptIds, setMasteredConceptIds] = useState<string[]>([]);'
  );
}

// 2. Add handleElementInspected
const handleElementInspectedCode = `  const handleElementInspected = (filePath: string, line: number, conceptName: string) => {
    const targetFile = project.files.find(f => f.path === filePath || f.name === filePath || f.path.endsWith(filePath));
    if (targetFile) {
      setProject(prev => ({ ...prev, activeFileId: targetFile.id }));
    }
    const explanation = aiService.getConceptExplanation(
      activeCheckpoint?.conceptId || 'functions_parameters',
      'beginner'
    );
    setActiveExplanation(explanation);
    setIsExplanationOpen(true);
  };`;

if (!content.includes('const handleElementInspected =')) {
  content = content.replace(
    '// Progressive Hint Revealer',
    `${handleElementInspectedCode}\n\n  // Progressive Hint Revealer`
  );
}

// 3. Fix LivePreview call
const oldLivePreview = `<LivePreview
                  key={previewKey}
                  project={project}
                  activeCheckpoint={activeCheckpoint}
                  device={previewDevice}
                  onInspectElement={() => {}}
                />`;

const newLivePreview = `<LivePreview
                  key={previewKey}
                  files={project.files}
                  onElementInspected={handleElementInspected}
                />`;

content = content.replace(oldLivePreview, newLivePreview);

// 4. Fix KnowledgeGraphModal and SettingsModal props
const oldModals = `<KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
        checkpoints={checkpoints}
        currentStepIndex={currentStepIndex}
      />
      <ProjectTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        milestones={milestones}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={setAiSettings}
      />`;

const newModals = `<KnowledgeGraphModal
        isOpen={isKnowledgeGraphOpen}
        onClose={() => setIsKnowledgeGraphOpen(false)}
        masteredConceptIds={masteredConceptIds}
        activeConceptId={activeCheckpoint?.conceptId || ''}
      />
      <ProjectTimelineModal
        isOpen={isTimelineOpen}
        onClose={() => setIsTimelineOpen(false)}
        milestones={milestones}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={aiSettings}
        onSaveSettings={setAiSettings}
        onResetProject={() => {
          setUserCode(activeCheckpoint?.initialCode || '');
          setLastEvaluation(null);
        }}
      />`;

content = content.replace(oldModals, newModals);

fs.writeFileSync(workspacePath, content, 'utf8');
console.log('Fixed props in VercelWorkspace.tsx');
