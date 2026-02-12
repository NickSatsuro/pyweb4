import { type Term, type GraphData } from './types';

const API_URL = 'docker build --platform linux/amd64 -t satsuro/glossary-grpc-frontend:latest ./frontend/api';

export const fetchTerms = async (): Promise<Term[]> => {
  const res = await fetch(`${API_URL}/terms`);
  return res.json();
};

export const fetchGraphData = async (): Promise<GraphData> => {
  const res = await fetch(`${API_URL}/graph`);
  return res.json();
};