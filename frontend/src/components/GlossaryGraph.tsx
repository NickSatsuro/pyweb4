import React, { useState, useRef, useCallback, useEffect } from 'react';
import ForceGraph2D, { type ForceGraphMethods } from 'react-force-graph-2d';
import { type GraphData, type GraphNode } from '../types';

interface GraphProps {
  data: GraphData;
  onTermSelected: (id: number) => void;
}

export const GlossaryGraph: React.FC<GraphProps> = ({ data, onTermSelected }) => {
  const graphRef = useRef<ForceGraphMethods | undefined>(undefined);
  const [hoverNode, setHoverNode] = useState<GraphNode | null>(null);

  // --- НАСТРОЙКА ФИЗИКИ  ---
  useEffect(() => {
    if (graphRef.current) {
      // d3Force позволяет управлять физическими силами
      
      // 1. Сила отталкивания (Charge)
      graphRef.current.d3Force('charge')?.strength(-400); 
      
      // 2. Длина связей (Link)
      graphRef.current.d3Force('link')?.distance(150);
      
      // 3. Перезапуск симуляции с новыми параметрами
      graphRef.current.d3ReheatSimulation();
    }
  }, [data]); 

  const COLOR_MAIN = '#2563EB'; 
  const COLOR_DEFAULT = '#4B5563'; 
  const COLOR_TEXT = '#ffffff';

  // --- ОТРИСОВКА УЗЛОВ ---
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D) => {
    const isHover = hoverNode === node;
    const color = isHover ? COLOR_MAIN : COLOR_DEFAULT;
    const label = node.name;
    const fontSize = 12;
    ctx.font = `${fontSize}px Sans-Serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth + 12, fontSize + 8]; 

    ctx.fillStyle = color;
    
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1], 4);
    } else {
        ctx.rect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
    }
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = COLOR_TEXT;
    ctx.fillText(label, node.x, node.y);
    
    node.__bckgDimensions = bckgDimensions; 
  }, [hoverNode]);

  // --- ОТРИСОВКА СВЯЗЕЙ ---
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const source = link.source;
    const target = link.target;
    const isHoverSource = hoverNode && source.id === hoverNode.id;
    const color = isHoverSource ? COLOR_MAIN : '#D1D5DB';

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(source.x, source.y);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();

    if (link.label) {
      const midX = source.x + (target.x - source.x) / 2;
      const midY = source.y + (target.y - source.y) / 2;
      const label = link.label;
      const fontSize = 10;
      ctx.font = `${fontSize}px Sans-Serif`;
      const textWidth = ctx.measureText(label).width;
      const bckgDimensions = [textWidth + 8, fontSize + 6];

      ctx.fillStyle = color; // Фон плашки связи того же цвета, что и линия
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(midX - bckgDimensions[0] / 2, midY - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1], 8);
      } else {
        ctx.rect(midX - bckgDimensions[0] / 2, midY - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);
      }
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, midX, midY);
    }
  }, [hoverNode]);

  // --- ОБЛАСТЬ КЛИКА (HITBOX) ---
  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const label = node.name;
    const fontSize = 12;
    ctx.font = `${fontSize}px Sans-Serif`;
    
    // Пересчитываем размеры, чтобы зона клика совпадала с видимой плашкой
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth + 12, fontSize + 8]; 

    ctx.fillStyle = color; 
    
    ctx.beginPath();
    if (ctx.roundRect) {
        ctx.roundRect(
            node.x - bckgDimensions[0] / 2, 
            node.y - bckgDimensions[1] / 2, 
            bckgDimensions[0], 
            bckgDimensions[1], 
            4
        );
    } else {
        ctx.rect(
            node.x - bckgDimensions[0] / 2, 
            node.y - bckgDimensions[1] / 2, 
            bckgDimensions[0], 
            bckgDimensions[1]
        );
    }
    ctx.fill();
  }, []);

  return (
    <ForceGraph2D
      ref={graphRef}
      graphData={data}
      
      // Автоматически подгонять размер под родительский div
      width={undefined} 
      height={undefined}

      // Успокаиваем физику через 2 секунды, чтобы граф перестал дергаться
      cooldownTicks={100}
      
      nodeCanvasObject={paintNode}
      nodePointerAreaPaint={nodePointerAreaPaint}
      linkCanvasObject={paintLink}
      
      onNodeHover={(node) => setHoverNode((node as any) || null)}
      
      onNodeClick={(node) => {
        const n = node as GraphNode;
        onTermSelected(n.id);
        graphRef.current?.centerAt(n.x, n.y, 1000);
        graphRef.current?.zoom(1.5, 1000); 
      }}
      
      linkDirectionalArrowLength={0} 
    />
  );
};