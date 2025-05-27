// // src/components/GraphViewStandalone.jsx
import React, { useState, useCallback, useEffect } from 'react';
import GraphView from './GraphView';

function GraphViewStandalone() {
    const searchParams = new URLSearchParams(window.location.search);
    const brainId = searchParams.get('brainId') || 'default-brain-id';
    
    const [referencedNodes, setReferencedNodes] = useState([]);
    const [graphRefreshTrigger, setGraphRefreshTrigger] = useState(0);
    const [allNodes, setAllNodes] = useState([]); // 전체 노드 목록 저장
    const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
    
    // GraphView에서 그래프 데이터가 업데이트될 때 전체 노드 목록 저장
    const handleGraphDataUpdate = useCallback((graphData) => {
        console.log('Graph data updated:', graphData);
        if (graphData && graphData.nodes) {
            setAllNodes(graphData.nodes.map(node => node.name));
        }
    }, []);
    
    // 그래프 새로고침 함수
    const refreshGraph = useCallback(() => {
        setGraphRefreshTrigger(prev => prev + 1);
    }, []);
    
    // URL 파라미터에서 참고된 노드 읽기
    const getReferencedNodesFromUrl = () => {
        const referencedParam = searchParams.get('referencedNodes');
        if (referencedParam) {
            try {
                return JSON.parse(decodeURIComponent(referencedParam));
            } catch (e) {
                console.warn('Invalid referencedNodes parameter:', e);
                return [];
            }
        }
        return [];
    };

    // 검색어로 노드 찾기 함수
    const searchNodes = useCallback((query) => {
        if (!query.trim() || allNodes.length === 0) {
            setReferencedNodes([]);
            return;
        }
        
        const searchTerms = query.toLowerCase().split(/\s+/);
        const matchingNodes = allNodes.filter(nodeName => 
            searchTerms.some(term => 
                nodeName.toLowerCase().includes(term)
            )
        );
        
        console.log('Search query:', query);
        console.log('Matching nodes:', matchingNodes);
        setReferencedNodes(matchingNodes);
    }, [allNodes]);

    // 컴포넌트 마운트 시 URL에서 참고된 노드 정보 읽기
    useEffect(() => {
        const urlReferencedNodes = getReferencedNodesFromUrl();
        if (urlReferencedNodes.length > 0) {
            setReferencedNodes(urlReferencedNodes);
        }
    }, []);

    // 부모 창과의 메시지 통신 (옵션)
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'UPDATE_REFERENCED_NODES') {
                setReferencedNodes(event.data.nodes || []);
            }
        };
        
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // 검색 입력 핸들러
    const handleSearchInput = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        searchNodes(query);
    };

    // 키보드 단축키
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+F 또는 Cmd+F로 검색창 포커스
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                document.getElementById('node-search')?.focus();
            }
            // ESC로 검색 초기화
            if (e.key === 'Escape') {
                setSearchQuery('');
                setReferencedNodes([]);
                document.getElementById('node-search')?.blur();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div style={{ 
            width: '100vw', 
            height: '100vh', 
            overflow: 'hidden',
            position: 'relative'
        }}>
            <GraphView 
                brainId={brainId} 
                height="100%" 
                isFullscreen={true}
                referencedNodes={referencedNodes}
                graphRefreshTrigger={graphRefreshTrigger}
                onGraphDataUpdate={handleGraphDataUpdate}
            />
            
            {/* 상단 컨트롤 패널 */}
            <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                right: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                zIndex: 1000,
                pointerEvents: 'none' // 그래프 인터랙션 방해하지 않도록
            }}>
                {/* 검색 영역 */}
                <div style={{ 
                    pointerEvents: 'auto',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)'
                }}>
                    <input
                        id="node-search"
                        type="text"
                        placeholder="노드 검색... (Ctrl+F)"
                        value={searchQuery}
                        onChange={handleSearchInput}
                        style={{
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '14px',
                            width: '200px',
                            outline: 'none'
                        }}
                    />
                    {searchQuery && (
                        <span style={{ fontSize: '12px', color: '#666' }}>
                            {referencedNodes.length}개 발견
                        </span>
                    )}
                </div>
                
                {/* 버튼 영역 */}
                <div style={{
                    pointerEvents: 'auto',
                    display: 'flex',
                    gap: '10px'
                }}>
                    <button 
                        onClick={refreshGraph}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '14px'
                        }}
                        title="그래프 새로고침"
                    >
                        🔄 새로고침
                    </button>
                    
                    {referencedNodes.length > 0 && (
                        <button 
                            onClick={() => {
                                setReferencedNodes([]);
                                setSearchQuery('');
                            }}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '4px',
                                border: '1px solid #ff6b6b',
                                background: '#fff5f5',
                                color: '#c92a2a',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                            title="하이라이트 해제"
                        >
                            ✕ 하이라이트 해제
                        </button>
                    )}
                </div>
            </div>

            {/* 하단 상태 표시 */}
            {referencedNodes.length > 0 && (
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(255,255,255,0.95)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    backdropFilter: 'blur(10px)',
                    fontSize: '14px',
                    color: '#333',
                    zIndex: 1000
                }}>
                    📍 하이라이트된 노드: {referencedNodes.join(', ')}
                </div>
            )}

            {/* 도움말 */}
            <div style={{
                position: 'absolute',
                bottom: '10px',
                right: '10px',
                fontSize: '12px',
                color: '#666',
                background: 'rgba(255,255,255,0.8)',
                padding: '4px 8px',
                borderRadius: '4px',
                zIndex: 1000
            }}>
                Ctrl+F: 검색 | ESC: 초기화 | 더블클릭: 노드로 이동
            </div>
        </div>
    );
}

export default GraphViewStandalone;

// src/components/GraphViewStandalone.jsx
// import React, { useState, useCallback, useEffect } from 'react';
// import GraphView from './GraphView';

// function GraphViewStandalone() {
//     const searchParams = new URLSearchParams(window.location.search);
//     const brainId = searchParams.get('brainId') || 'default-brain-id';
    
//     const [referencedNodes, setReferencedNodes] = useState([]);
//     const [graphRefreshTrigger, setGraphRefreshTrigger] = useState(0);
//     const [allNodes, setAllNodes] = useState([]); // 전체 노드 목록 저장
//     const [searchQuery, setSearchQuery] = useState(''); // 검색어 상태
    
//     // GraphView에서 그래프 데이터가 업데이트될 때 전체 노드 목록 저장
//     const handleGraphDataUpdate = useCallback((graphData) => {
//         console.log('Graph data updated:', graphData);
//         if (graphData && graphData.nodes) {
//             setAllNodes(graphData.nodes.map(node => node.name));
//         }
//     }, []);
    
//     // 그래프 새로고침 함수
//     const refreshGraph = useCallback(() => {
//         setGraphRefreshTrigger(prev => prev + 1);
//     }, []);
    
//     // URL 파라미터에서 참고된 노드 읽기
//     const getReferencedNodesFromUrl = () => {
//         const referencedParam = searchParams.get('referencedNodes');
//         if (referencedParam) {
//             try {
//                 return JSON.parse(decodeURIComponent(referencedParam));
//             } catch (e) {
//                 console.warn('Invalid referencedNodes parameter:', e);
//                 return [];
//             }
//         }
//         return [];
//     };

//     // 검색어로 노드 찾기 함수
//     const searchNodes = useCallback((query) => {
//         if (!query.trim() || allNodes.length === 0) {
//             setReferencedNodes([]);
//             return;
//         }
        
//         const searchTerms = query.toLowerCase().split(/\s+/);
//         const matchingNodes = allNodes.filter(nodeName => 
//             searchTerms.some(term => 
//                 nodeName.toLowerCase().includes(term)
//             )
//         );
        
//         console.log('Search query:', query);
//         console.log('Matching nodes:', matchingNodes);
//         setReferencedNodes(matchingNodes);
//     }, [allNodes]);

//     // 컴포넌트 마운트 시 URL에서 참고된 노드 정보 읽기
//     useEffect(() => {
//         const urlReferencedNodes = getReferencedNodesFromUrl();
//         if (urlReferencedNodes.length > 0) {
//             setReferencedNodes(urlReferencedNodes);
//         }
//     }, []);

//     // 부모 창과의 메시지 통신 (옵션)
//     useEffect(() => {
//         const handleMessage = (event) => {
//             if (event.data.type === 'UPDATE_REFERENCED_NODES') {
//                 setReferencedNodes(event.data.nodes || []);
//             }
//         };
        
//         window.addEventListener('message', handleMessage);
//         return () => window.removeEventListener('message', handleMessage);
//     }, []);

//     // 검색 입력 핸들러
//     const handleSearchInput = (e) => {
//         const query = e.target.value;
//         setSearchQuery(query);
//         searchNodes(query);
//     };

//     // 키보드 단축키
//     useEffect(() => {
//         const handleKeyDown = (e) => {
//             // Ctrl+F 또는 Cmd+F로 검색창 포커스
//             if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
//                 e.preventDefault();
//                 document.getElementById('node-search')?.focus();
//             }
//             // ESC로 검색 초기화
//             if (e.key === 'Escape') {
//                 setSearchQuery('');
//                 setReferencedNodes([]);
//                 document.getElementById('node-search')?.blur();
//             }
//         };
        
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, []);

//     return (
//         <div style={{ 
//             width: '100vw', 
//             height: '100vh', 
//             overflow: 'hidden',
//             position: 'relative'
//         }}>
//             <GraphView 
//                 brainId={brainId} 
//                 height="100%" 
//                 isFullscreen={true}
//                 referencedNodes={referencedNodes}
//                 graphRefreshTrigger={graphRefreshTrigger}
//                 onGraphDataUpdate={handleGraphDataUpdate}
//             />
            
//             {/* 좌측 상단 검색 영역 */}
//             <div style={{
//                 position: 'absolute',
//                 top: '10px',
//                 left: '10px',
//                 zIndex: 1000,
//                 pointerEvents: 'auto'
//             }}>
//                 <div style={{ 
//                     display: 'flex', 
//                     alignItems: 'center', 
//                     gap: '10px',
//                     background: 'rgba(255,255,255,0.95)',
//                     padding: '8px 12px',
//                     borderRadius: '8px',
//                     boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
//                     backdropFilter: 'blur(10px)'
//                 }}>
//                     <input
//                         id="node-search"
//                         type="text"
//                         placeholder="노드 검색... (Ctrl+F)"
//                         value={searchQuery}
//                         onChange={handleSearchInput}
//                         style={{
//                             border: '1px solid #ddd',
//                             borderRadius: '4px',
//                             padding: '6px 10px',
//                             fontSize: '14px',
//                             width: '200px',
//                             outline: 'none',
//                             color: '#333'
//                         }}
//                     />
//                     {searchQuery && (
//                         <span style={{ fontSize: '12px', color: '#666' }}>
//                             {referencedNodes.length}개
//                         </span>
//                     )}
//                 </div>
//             </div>

//             {/* 우측 상단 버튼들 - PiMagicWand와 같은 높이 */}
//             <div style={{
//                 position: 'absolute',
//                 top: '10px', // PiMagicWand와 같은 높이
//                 right: '60px', // PiMagicWand 버튼 옆에 배치
//                 display: 'flex',
//                 gap: '8px',
//                 zIndex: 1000,
//                 pointerEvents: 'auto'
//             }}>
//                 <button 
//                     onClick={refreshGraph}
//                     style={{
//                         display: 'flex',
//                         alignItems: 'center',
//                         justifyContent: 'center',
//                         width: '40px',
//                         height: '40px',
//                         borderRadius: '50%',
//                         border: 'none',
//                         background: 'rgba(255,255,255,0.9)',
//                         boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//                         cursor: 'pointer',
//                         fontSize: '16px',
//                         transition: 'all 0.2s ease'
//                     }}
//                     onMouseEnter={(e) => {
//                         e.target.style.transform = 'scale(1.05)';
//                         e.target.style.background = 'rgba(255,255,255,1)';
//                     }}
//                     onMouseLeave={(e) => {
//                         e.target.style.transform = 'scale(1)';
//                         e.target.style.background = 'rgba(255,255,255,0.9)';
//                     }}
//                     title="그래프 새로고침"
//                 >
//                     🔄
//                 </button>
                
//                 {referencedNodes.length > 0 && (
//                     <button 
//                         onClick={() => {
//                             setReferencedNodes([]);
//                             setSearchQuery('');
//                         }}
//                         style={{
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center',
//                             width: '40px',
//                             height: '40px',
//                             borderRadius: '50%',
//                             border: 'none',
//                             background: 'rgba(255, 235, 235, 0.9)',
//                             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
//                             cursor: 'pointer',
//                             fontSize: '16px',
//                             transition: 'all 0.2s ease'
//                         }}
//                         onMouseEnter={(e) => {
//                             e.target.style.transform = 'scale(1.05)';
//                             e.target.style.background = 'rgba(255, 235, 235, 1)';
//                         }}
//                         onMouseLeave={(e) => {
//                             e.target.style.transform = 'scale(1)';
//                             e.target.style.background = 'rgba(255, 235, 235, 0.9)';
//                         }}
//                         title="하이라이트 해제"
//                     >
//                         ✕
//                     </button>
//                 )}
//             </div>

//             {/* 키보드 단축키 안내 - 위치 조정 */}
//             <div style={{
//                 position: 'absolute',
//                 bottom: '10px',
//                 right: '10px',
//                 fontSize: '11px',
//                 color: '#666',
//                 background: 'rgba(255,255,255,0.85)',
//                 padding: '6px 10px',
//                 borderRadius: '6px',
//                 zIndex: 1000,
//                 fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
//             }}>
//                 <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
//                     <div>⌘F 검색</div>
//                     <div>ESC 초기화</div>
//                     <div>더블클릭 이동</div>
//                 </div>
//             </div>
//         </div>
//     );
// }

// export default GraphViewStandalone;