// src/components/panels/GraphView.jsx
// import React, { useRef, useEffect, useState } from 'react';
// import ForceGraph2D from 'react-force-graph-2d';

// function GraphView({ nodes }) {
//   const containerRef = useRef(null);
//   const [dimensions, setDimensions] = useState({ width: 0, height: 300 });
  
//   // 컨테이너 크기 측정
//   useEffect(() => {
//     if (containerRef.current) {
//       const updateDimensions = () => {
//         setDimensions({
//           width: containerRef.current.clientWidth,
//           height: 300 // 고정 높이
//         });
//       };
      
//       updateDimensions();
//       window.addEventListener('resize', updateDimensions);
      
//       return () => {
//         window.removeEventListener('resize', updateDimensions);
//       };
//     }
//   }, []);
  
//   // ForceGraph2D용 데이터 변환
//   const graphData = {
//     nodes: nodes.map(node => ({
//       id: node.id.toString(),
//       name: node.label,
//       nodeType: node.type,
//       // 초기 위치 설정 (선택 사항)
//       x: node.x,
//       y: node.y
//     })),
//     links: []
//   };
  
//   // 메인 노드와 다른 노드들 사이에 링크 생성
//   const mainNode = nodes.find(n => n.type === 'main');
//   if (mainNode) {
//     nodes.forEach(node => {
//       if (node.id !== mainNode.id) {
//         graphData.links.push({
//           source: mainNode.id.toString(),
//           target: node.id.toString()
//         });
//       }
//     });
//   }
  
//   return (
//     <div className="graph-area" ref={containerRef}>
//       {dimensions.width > 0 && (
//         <ForceGraph2D
//           graphData={graphData}
//           width={dimensions.width}
//           height={dimensions.height}
//           nodeLabel="name"
//           nodeColor={node => {
//             if (node.nodeType === 'main') return '#3b82f6';
//             else if (node.nodeType === 'sub') return '#8b5cf6';
//             else if (node.nodeType === 'small') return '#f59e0b';
//             return '#ff9999';
//           }}
//           nodeRelSize={8}
//           linkWidth={1}
//           linkColor={() => "#cccccc"}
//           backgroundColor="#f5f5f5"
//           cooldownTicks={100}
//         />
//       )}
//     </div>
//   );
// }

// export default GraphView;

// src/components/panels/GraphView.jsx
import React, { useRef, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

function GraphView() {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });
  
  // 컨테이너 크기 측정
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: 300 // 고정 높이
        });
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);
  
  // 더미 그래프 데이터g
  const graphData = {
    nodes: [
      {"id": "양자 역학"},
      {"id": "물리학"},
      {"id": "슈뢰딩거의 고양이 실험"},
      {"id": "양자 중첩"},
      {"id": "관성의 법칙"},
      {"id": "외부 힘"},
      {"id": "물체"},
      {"id": "등속 직선 운동"},
      {"id": "뉴턴의 제1법칙"}
    ],
    links: [
      {"source": "양자 역학", "target": "물리학", "label": "분야"},
      {"source": "슈뢰딩거의 고양이 실험", "target": "양자 중첩", "label": "설명"},
      {"source": "관성의 법칙", "target": "외부 힘", "label": "존재하지 않으면 유지"},
      {"source": "관성의 법칙", "target": "물체", "label": "적용 대상"},
      {"source": "관성의 법칙", "target": "등속 직선 운동", "label": "유지"},
      {"source": "관성의 법칙", "target": "뉴턴의 제1법칙", "label": "다른 이름"}
    ]
  };
  
  return (
    <div className="graph-area" ref={containerRef}>
      {dimensions.width > 0 && (
        <ForceGraph2D
          graphData={graphData}
          width={dimensions.width}
          height={dimensions.height}
          nodeLabel="id"
          linkLabel="label"
          nodeAutoColorBy="id"
          linkDirectionalArrowLength={6}
          linkDirectionalArrowRelPos={1}
          linkWidth={2}
          linkColor={() => "#cccccc"}
          backgroundColor="#f5f5f5"
          cooldownTicks={100}
        />
      )}
    </div>
  );
}

export default GraphView;