import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import { fetchGraphData } from '../../api/graphApi';

<<<<<<< HEAD
function GraphView({ brainId = 'default-brain-id', height = '550px', graphData: initialGraphData = null }) {
=======
function GraphView({ brainId = 'default-brain-id', height = '550px' }) {
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

<<<<<<< HEAD
  // 앱 디자인에 맞는 모노크로매틱 + 포인트 색상 팔레트
  const colorPalette = [
    '#444444', // 진한 회색 (주요 노드)
    '#666666', // 중간 회색
    '#888888', // 연한 회색
    '#aaaaaa', // 매우 연한 회색
    '#3366bb', // 포인트 색상 - 파랑
    '#333333', // 거의 검정색
    '#777777', // 다른 회색 톤
    '#999999', // 또 다른 회색 톤
    '#5588cc', // 밝은 파랑 (포인트)
    '#555555', // 또 다른 진한 회색
  ];

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

=======
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

>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
  useEffect(() => {
    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    return () => {
      if (containerRef.current) resizeObserver.unobserve(containerRef.current);
    };
  }, [height]);

  useEffect(() => {
<<<<<<< HEAD
    // 초기 데이터가 제공되면 사용
    if (initialGraphData) {
      processGraphData(initialGraphData);
      return;
    }

=======
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    const loadGraphData = async () => {
      try {
        setLoading(true);
        const data = await fetchGraphData(brainId);
<<<<<<< HEAD
        processGraphData(data);
=======
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
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
      } catch (err) {
        setError('그래프 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    loadGraphData();
<<<<<<< HEAD
  }, [brainId, initialGraphData]);

  // 그래프 데이터 처리 함수
  const processGraphData = (data) => {
    // 중요 노드 탐지 (링크가 많은 노드)
    const linkCounts = {};
    data.links.forEach(link => {
      const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
      const targetId = typeof link.target === 'object' ? link.target.id : link.target;
      
      linkCounts[sourceId] = (linkCounts[sourceId] || 0) + 1;
      linkCounts[targetId] = (linkCounts[targetId] || 0) + 1;
    });
    
    // 링크 수에 따라 노드 정렬하여 색상 결정
    const processedData = {
      nodes: data.nodes.map((n, index) => {
        const nodeId = n.id || n.name;
        let nodeColor;
        
        // 명확한 임계값에 기반한 색상 할당: 연결이 3개 이상인 노드만 파란색으로
        const linkCount = linkCounts[nodeId] || 0;
        
        if (linkCount >= 3) {
          nodeColor = colorPalette[4]; // 파란색 포인트 색상 (연결 3개 이상)
        } else if (linkCount == 2) {
          nodeColor = colorPalette[0]; // 진한 회색 (연결 2개)
        } else {
          // 나머지는 회색 계열
          nodeColor = colorPalette[2]; // 연한 회색 (연결 1개 이하)
        }
        
        return {
          ...n,
          id: nodeId || Math.random().toString(36).substr(2, 9),
          name: n.name || n.label || n.id,
          color: nodeColor,
          linkCount: linkCount // 디버깅 및 참조용으로 링크 수 추가
        };
      }),
      links: data.links.map(l => ({
        ...l,
        source: typeof l.source === 'object' ? l.source.id : l.source,
        target: typeof l.target === 'object' ? l.target.id : l.target,
        relation: l.relation || l.label || '연결'
      }))
    };
    
    setGraphData(processedData);
    setLoading(false);
  };
=======
  }, [brainId]);
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e

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
<<<<<<< HEAD
        // backgroundColor: 'white'
        backgroundColor: '#fafafa'
=======
        backgroundColor: 'white'
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
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
<<<<<<< HEAD
          // backgroundColor: 'rgba(255,255,255,0.7)',
          backgroundColor: '#fafafa',
=======
          backgroundColor: 'rgba(255,255,255,0.7)',
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
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
<<<<<<< HEAD
          backgroundColor: '#fafafa',
=======
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
          color: 'red'
        }}>
          {error}
        </div>
      )}
      {!loading && graphData.nodes.length > 0 && dimensions.width > 0 && (
<<<<<<< HEAD
        
=======
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
        <ForceGraph2D
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
<<<<<<< HEAD
          nodeLabel={node => `${node.name} (연결: ${node.linkCount})`} // 노드 호버시 연결 수 표시
          linkLabel={link => link.relation}
          nodeRelSize={6}
          linkColor={() => "#dedede"} // 연한 회색 링크
          linkWidth={1}
          linkDirectionalArrowLength={3.5}
=======
          nodeLabel="name"
          linkLabel="relation"
          nodeAutoColorBy="group"
          linkColor={() => "#aaa"}
          linkWidth={1}
          linkDirectionalArrowLength={4}
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
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
<<<<<<< HEAD
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            
            // 노드 크기 - 연결이 많을수록 더 큰 노드로 표시
            const baseSize = 5;
            const sizeFactor = Math.min(node.linkCount * 0.5, 3); // 최대 3의 추가 크기
            const nodeSize = baseSize + sizeFactor;
            const nodeRadius = nodeSize / globalScale;
            
            // 노드 그리기
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            // 노드 테두리 그리기
            const isImportantNode = node.linkCount >= 3;
            ctx.strokeStyle = isImportantNode ? 'white' : '#f0f0f0';
            ctx.lineWidth = 0.5 / globalScale;
            ctx.stroke();
            
            // 노드 아래에 텍스트 그리기
            const textColor = isImportantNode ? '#222' : '#555';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = textColor;
            ctx.fillText(label, node.x, node.y + nodeRadius + 1);
            
            // 마우스 오버시 크기 확대
            node.__bckgDimensions = [nodeRadius * 2, fontSize].map(n => n + fontSize * 0.2);
=======
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
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
          }}
          enableNodeDrag={true}
          enableZoomPanInteraction={true}
          minZoom={0.3}
          maxZoom={5}
          onNodeDragEnd={node => {
            delete node.fx;
            delete node.fy;
          }}
<<<<<<< HEAD
          onNodeHover={node => {
            document.body.style.cursor = node ? 'pointer' : 'default';
          }}
=======
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
        />
      )}
    </div>
  );
}

export default GraphView;
