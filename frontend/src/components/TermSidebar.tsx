import React from 'react';
import { type Term } from '../types';

interface SidebarProps {
  term: Term | null;
  allTerms: Term[]; // Нужно, чтобы найти название связанного термина по ID
}

export const TermSidebar: React.FC<SidebarProps> = ({ term, allTerms }) => {
  if (!term) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>
        Выберите термин на графе, чтобы увидеть подробности.
      </div>
    );
  }

  // Функция для поиска имени термина по ID
  const getTermName = (id: number) => {
    return allTerms.find((t) => t.id === id)?.keyword || `ID ${id}`;
  };

  return (
    <div style={{ padding: '24px', height: '100%', overflowY: 'auto', background: '#f5f5f7' }}>
      <h2 style={{ fontSize: '24px', marginBottom: '10px', color: '#333' }}>
        {term.keyword}
      </h2>
      
      <p style={{ color: '#555', lineHeight: '1.5', marginBottom: '24px' }}>
        {term.definition}
      </p>

      {term.related_terms.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', color: '#888', marginBottom: '10px' }}>СВЯЗИ</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {term.related_terms.map((rel, idx) => (
              <li key={idx} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: '1px solid #e0e0e0' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {rel.relationship}:
                </div>
                <div style={{ fontWeight: 500, color: '#2c3e50' }}>
                  {getTermName(rel.term_id)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {term.source && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: 'auto' }}>
          Источник: {term.source}
        </div>
      )}
    </div>
  );
};