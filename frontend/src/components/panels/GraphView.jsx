import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import { fetchGraphData } from '../../api/graphApi';

function GraphView({ brainId = 'default-brain-id', height = '550px' }) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 이전 위치 저장 (드래그 중 위치 이동 계산용)
  const prevPos = useRef({ x: null, y: null });

  // 연결된 모든 노드를 재귀적으로 수집
  const getConnectedNodes = (startNodeId, links, visited = new Set()) => {
    if (visited.has(startNodeId)) return visited;
    visited.add(startNodeId);

    links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;

      if (sourceId === startNodeId && !visited.has(targetId)) {
        getConnectedNodes(targetId, links, visited);
      } else if (targetId === startNodeId && !visited.has(sourceId)) {
        getConnectedNodes(sourceId, links, visited);
      }
    });

    return visited;
  };

  // 컨테이너 사이즈 계산
  const updateDimensions = () => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const calcHeight =
      typeof height === 'number'
        ? height
        : containerRef.current.clientHeight || 550;

    setDimensions({ width, height: calcHeight });
  };

  useEffect(() => {
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, [height]);

  useEffect(() => {
    const loadGraphData = async () => {
      try {
        setLoading(true);
        const data = await fetchGraphData(brainId);
        const processedData = {
          nodes: data.nodes.map(n => ({
            ...n,
            id: n.id || n.name || Math.random().toString(36).substr(2, 9),
            name: n.name || n.label || n.id
          })),
          links: data.links.map(l => ({
            ...l,
            source: typeof l.source === 'object' ? l.source.id : l.source,
            target: typeof l.target === 'object' ? l.target.id : l.target,
            relation: l.relation || l.label || '연결'
          }))
        };
        setGraphData(processedData);
        setLoading(false);
      } catch (err) {
        setError('그래프 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    loadGraphData();
  }, [brainId]);

  return (
    <div
      className="graph-area"
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: height,
        borderRadius: '8px',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: 'white'
      }}
    >
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.7)',
          zIndex: 10
        }}>
          로딩 중...
        </div>
      )}
      {error && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'red'
        }}>
          {error}
        </div>
      )}
      {!loading && graphData.nodes.length > 0 && dimensions.width > 0 && (
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeLabel="name"
          linkLabel="relation"
          nodeAutoColorBy="group"
          linkColor={() => "#aaa"}
          linkWidth={1}
          linkDirectionalArrowLength={4}
          linkDirectionalArrowRelPos={1}
          cooldownTime={2000}
          d3VelocityDecay={0.2}
          d3Force={fg => {
            fg.force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2));
            fg.force("charge", d3.forceManyBody().strength(-200));
            fg.force("link", d3.forceLink().id(d => d.id).distance(100).strength(0.8));
            fg.force("collide", d3.forceCollide(40));
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name || node.id;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bgRadius = textWidth * 0.6 + 6;

            ctx.beginPath();
            ctx.arc(node.x, node.y, bgRadius / 2, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#444';
            ctx.fill();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(label, node.x, node.y);
          }}
          enableNodeDrag={true}
          enableZoomPanInteraction={true}
          minZoom={0.3}
          maxZoom={5}
          onNodeDragEnd={node => {
            delete node.fx;
            delete node.fy;
          }}
        />
      )}
    </div>
  );
}

export default GraphView;
