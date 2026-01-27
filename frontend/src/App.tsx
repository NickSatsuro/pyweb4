import { useEffect, useState } from 'react';
import './App.css';
import { fetchGraphData, fetchTerms } from './api';
import { GlossaryGraph } from './components/GlossaryGraph';
import { TermSidebar } from './components/TermSidebar';
import { type GraphData, type Term } from './types';

function App() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [allTerms, setAllTerms] = useState<Term[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<number | null>(null);

  // Загружаем данные при старте
  useEffect(() => {
    // 1. Грузим граф
    fetchGraphData().then(data => setGraphData(data));
    // 2. Грузим полные данные для сайдбара
    fetchTerms().then(terms => setAllTerms(terms));
  }, []);

  // Находим полный объект термина по выбранному ID
  const selectedTerm = allTerms.find(t => t.id === selectedTermId) || null;

  return (
    <div className="app-container">
      <div className="graph-area">
        {/* Передаем размеры контейнера явно или через CSS. 
            ForceGraph автоматически подстраивается под родителя, 
            но иногда лучше обернуть в div с ref */}
        <GlossaryGraph 
          data={graphData} 
          onTermSelected={setSelectedTermId} 
        />
      </div>
      
      <div className="sidebar-area">
        <TermSidebar term={selectedTerm} allTerms={allTerms} />
      </div>
    </div>
  );
}

export default App;