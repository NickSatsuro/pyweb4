export interface TermRelation {
    term_id: number;
    relationship: string;
  }
  
  export interface Term {
    id: number;
    keyword: string;
    definition: string;
    source?: string;
    related_terms: TermRelation[];
  }
  
  export interface GraphNode {
    id: number;
    name: string;
    desc?: string;
    x?: number; 
    y?: number;
  }
  
  export interface GraphLink {
    source: GraphNode | number; 
    target: GraphNode | number;
    label: string;
  }
  
  export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
  }