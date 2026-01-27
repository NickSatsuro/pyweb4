import { type Term, type GraphData } from './types';

const API_URL = 'http://83.166.253.97:8000/api';

export const fetchTerms = async (): Promise<Term[]> => {
  const res = await fetch(`${API_URL}/terms`);
  return res.json();
};

export const fetchGraphData = async (): Promise<GraphData> => {
  const res = await fetch(`${API_URL}/graph`);
  return res.json();
};