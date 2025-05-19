import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import * as d3 from 'd3';
import { fetchGraphData } from '../../api/graphApi';
import { MdAnimation } from "react-icons/md";
import { PiMagicWand } from "react-icons/pi";

function GraphView({
  brainId = 'default-brain-id',
  height = '1022px', // 안예찬이 직접 찾은 최적의 그래프뷰 높이
  graphData: initialGraphData = null,
  referencedNodes = [],
  graphRefreshTrigger // 그래프 새로고침 트리거 prop 추가
}) {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referencedSet, setReferencedSet] = useState(new Set()); // 참고된 노드들을 Set으로 관리
  const [showReferenced, setShowReferenced] = useState(true); // 참고된 노드 표시 여부를 위한 상태
  const fgRef = useRef();
  const [visibleNodes, setVisibleNodes] = useState([]);
  const [visibleLinks, setVisibleLinks] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

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

  const getInitialZoomScale = (nodeCount) => {
    if (nodeCount >= 1000) return 0.05;
    else if (nodeCount >= 500) return 0.08;
    else if (nodeCount >= 100) return 0.1;
    else if (nodeCount >= 50) return 0.2;
    return 0.3; // 노드가 매우 적을 때는 확대
  };

  const startTimelapse = () => {
    if (!graphData.nodes.length) return;

    setIsAnimating(true);
    setVisibleNodes([]);
    setVisibleLinks([]);

    const zoom = getInitialZoomScale(graphData.nodes.length);
    fgRef.current.zoom(zoom + 0.05, 800);

    const sortedNodes = [...graphData.nodes]; // timestamp 기준 정렬 가능
    const allLinks = [...graphData.links];

    let index = 0;
    const nodeMap = new Map(); // 등장한 노드 추적

    // 초기 지연(ms)
    let delay = 150;
    const animateStep = () => {
      if (index >= sortedNodes.length) {
        setIsAnimating(false);
        return;
      }

      const node = sortedNodes[index];
      nodeMap.set(node.id, true);

      const newNodes = [...nodeMap.values()].map((_, i) => sortedNodes[i]);
      const newLinks = allLinks.filter(
        link => nodeMap.has(link.source) && nodeMap.has(link.target)
      );

      setVisibleNodes(newNodes);
      setVisibleLinks(newLinks);
      index++;

      // 지연시간을 점점 줄임 (최소 1ms까지)
      delay = Math.max(0, delay * 0.95);

      setTimeout(animateStep, delay);
    };

    animateStep(); // 시작
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
    if (!loading && graphData.nodes.length > 0 && fgRef.current) {
      const zoom = getInitialZoomScale(graphData.nodes.length);
      console.log("노드의 갯수 : ", graphData.nodes.length)
      fgRef.current.centerAt(0, 0, 0);
      fgRef.current.zoom(zoom, 0);
    }
  }, [loading, graphData]);

  useEffect(() => {
    // 초기 데이터가 제공되면 사용
    if (initialGraphData) {
      processGraphData(initialGraphData);
      return;
    }

    const loadGraphData = async () => {
      try {
        setLoading(true);
        const data = await fetchGraphData(brainId);
        processGraphData(data);
      } catch (err) {
        setError('그래프 데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    loadGraphData();
  }, [brainId, initialGraphData]);

  // graphRefreshTrigger가 변경될 때마다 그래프 새로고침
  useEffect(() => {
    if (graphRefreshTrigger !== undefined && graphRefreshTrigger > 0) {
      console.log('그래프 새로고침 트리거:', graphRefreshTrigger);
      const loadGraphData = async () => {
        try {
          setLoading(true);
          const data = await fetchGraphData(brainId);
          processGraphData(data);
        } catch (err) {
          console.error('그래프 새로고침 실패:', err);
          setError('그래프 데이터를 불러오는 데 실패했습니다.');
          setLoading(false);
        }
      };
      loadGraphData();
    }
  }, [graphRefreshTrigger, brainId]);

  // referencedNodes가 변경될 때 Set 업데이트
  useEffect(() => {
    console.log('referencedNodes:', referencedNodes); // 디버깅용
    setReferencedSet(new Set(referencedNodes));
    // referencedNodes가 바뀌면 다시 보여주기 ON
    if (referencedNodes.length > 0) {
      setShowReferenced(true);
    }
  }, [referencedNodes]);


  useEffect(() => { // 질문할 때 관련된 노드로 이동하는 코드
    if (!showReferenced || referencedNodes.length === 0 || !graphData.nodes.length) return;

    const referenced = graphData.nodes.filter(n => referencedSet.has(n.name));
    if (referenced.length === 0) return;

    const timer = setTimeout(() => {
      const validNodes = referenced.filter(n => typeof n.x === 'number' && typeof n.y === 'number');
      if (validNodes.length === 0) return;

      const fg = fgRef.current;
      if (!fg || !dimensions.width || !dimensions.height) return;

      // 1. 중심 좌표 계산
      const avgX = validNodes.reduce((sum, n) => sum + n.x, 0) / validNodes.length;
      const avgY = validNodes.reduce((sum, n) => sum + n.y, 0) / validNodes.length;

      // 2. 노드들 경계 상자 계산
      const xs = validNodes.map(n => n.x);
      const ys = validNodes.map(n => n.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);

      const boxWidth = maxX - minX;
      const boxHeight = maxY - minY;

      // 3. 화면 기준으로 padding 적용하여 적절한 zoom 비율 계산
      const padding = 400;
      const zoomScaleX = dimensions.width / (boxWidth + padding);
      const zoomScaleY = dimensions.height / (boxHeight + padding);
      const targetZoom = Math.min(zoomScaleX, zoomScaleY, 5);// 최대 5배 이상 확대 제한

      // Step 1: 먼저 줌 아웃
      fg.zoom(0.05, 800);

      // Step 2: center 이동
      setTimeout(() => {
        fg.centerAt(avgX, avgY, 1000);

        // Step 3: 해당 영역이 다 보이도록 줌인
        setTimeout(() => {
          fg.zoom(targetZoom, 1000);
        }, 1000);
      }, 900);
    }, 500);

    return () => clearTimeout(timer);
  }, [showReferenced, referencedNodes, graphData, referencedSet]);

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

        // 참고된 노드인지 확인
        const nodeName = n.name || n.label || n.id;

        return {
          ...n,
          id: nodeId || Math.random().toString(36).substr(2, 9),
          name: nodeName,
          color: nodeColor,
          linkCount: linkCount
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
        backgroundColor: '#fafafa'
      }}
    >
      {/* 참고된 노드가 있을 때 디버깅 정보 표시 */}
      {showReferenced && referencedNodes.length > 0 && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        }}
          onMouseEnter={e => {
            const closeBtn = e.currentTarget.querySelector('.close-x');
            if (closeBtn) closeBtn.style.display = 'inline';
          }}
          onMouseLeave={e => {
            const closeBtn = e.currentTarget.querySelector('.close-x');
            if (closeBtn) closeBtn.style.display = 'none';
          }}
        >
          <span>참고된 노드: {referencedNodes.join(', ')}</span>
          <span
            onClick={() => setShowReferenced(false)}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'red')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
            style={{
              cursor: 'pointer',
              fontWeight: 'bold',
              color: '#666',
              fontSize: '18px',
              transition: 'color 0.2s',
            }}
          >
            ×
          </span>
        </div>
      )}
      {/* 로딩 및 에러 처리 */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
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
          backgroundColor: '#fafafa',
          color: 'red'
        }}>
          {error}
        </div>
      )}
      {!loading && graphData.nodes.length > 0 && dimensions.width > 0 && (

        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={isAnimating ? {
            nodes: visibleNodes,
            links: visibleLinks
          } : graphData}
          nodeLabel={node => {
            const baseLabel = `${node.name} (연결: ${node.linkCount})`;
            const isReferenced = showReferenced && referencedSet.has(node.name);
            return isReferenced ? `${baseLabel} - 참고됨` : baseLabel;
          }}
          linkLabel={link => link.relation}
          nodeRelSize={6}
          linkColor={() => "#dedede"}
          linkWidth={1}
          linkDirectionalArrowLength={3.5}
          linkDirectionalArrowRelPos={1}
          cooldownTime={3000}
          d3VelocityDecay={0.2}
          d3Force={fg => {
            fg.force("center", d3.forceCenter(dimensions.width / 2, dimensions.height / 2));
            // 노드 간 반발력(밀어내는 힘).절대값이 클수록 강하게 밀어냄냄
            fg.force("charge", d3.forceManyBody().strength(-80));
            fg.force("link", d3.forceLink().id(d => d.id).distance(100).strength(0.2)); // ✅ 느슨한 연결
            fg.force("collide", d3.forceCollide(50)); // ✅ 충돌 반경 조정
          }}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name || node.id;
            const isReferenced = showReferenced && referencedSet.has(node.name);
            const isImportantNode = node.linkCount >= 3;

            // 노드 크기 - 연결이 많을수록 더 큰 노드로 표시
            const baseSize = 5;
            const sizeFactor = Math.min(node.linkCount * 0.5, 3);
            const nodeSize = baseSize + sizeFactor;
            const nodeRadius = nodeSize / globalScale;

            // 노드 원 그리기
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = node.color;
            ctx.fill();

            // 노드 테두리 그리기 - 참고된 노드는 주황색 테두리
            const fontSize = isReferenced ? 13 / globalScale : 9 / globalScale;

            ctx.font = isReferenced
              ? `bold ${fontSize}px Sans-Serif`
              : `${fontSize}px Sans-Serif`;

            if (isReferenced) {
              ctx.strokeStyle = '#d9820f'; // 더 진한 골드 계열 (EBB20C보다 더 세련됨)
              ctx.lineWidth = 3 / globalScale; // 더 두꺼운 테두리
              ctx.shadowColor = '#ffc107'; // 약간의 빛 효과 추가
              ctx.shadowBlur = 6; // 부드러운 광택 느낌
            } else {
              ctx.strokeStyle = isImportantNode ? 'white' : '#f0f0f0';
              ctx.lineWidth = 0.5 / globalScale;
              ctx.shadowBlur = 0; // 기본 노드는 그림자 제거
            }

            ctx.stroke();

            // 노드 아래에 텍스트 그리기
            const textColor = (isImportantNode || isReferenced) ? '#222' : '#555';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillStyle = textColor;
            ctx.fillText(label, node.x, node.y + nodeRadius + 1);

            // 마우스 오버시 크기 확대
            node.__bckgDimensions = [nodeRadius * 2, fontSize].map(n => n + fontSize * 0.2);
          }}
          enableNodeDrag={true}
          enableZoomPanInteraction={true}
          minZoom={0.01}
          maxZoom={5}
          onNodeDragEnd={node => {
            delete node.fx;
            delete node.fy;
          }}
          onNodeHover={node => {
            document.body.style.cursor = node ? 'pointer' : 'default';
          }}

        />
      )}{/* 타임랩스 애니메이션 버튼 */}
      <div
        style={{
          position: 'absolute',
          top: 45, // 전체화면 버튼 아래에 배치
          right: -3,
        }}
      >
        <button
          onClick={startTimelapse}
          style={{
            color: 'black',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            border: 'none',
            outline: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
          title="Start timelapse animation"
        >
          <PiMagicWand size={21} color="black" />
        </button>
      </div>


    </div>

  );
}

export default GraphView;