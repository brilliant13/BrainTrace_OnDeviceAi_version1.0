// // src/components/GraphModal.jsx
// import React from 'react';
// import ForceGraph2D from 'react-force-graph-2d'; // ForceGraph2D 직접 임포트

// function GraphModal({ isOpen, onClose, graphData }) {
//   if (!isOpen) return null;

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0, 0, 0, 0.7)',
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       zIndex: 1000
//     }}>
//       <div style={{
//         width: '80%',
//         height: '80%',
//         backgroundColor: '#000',
//         borderRadius: '8px',
//         padding: '20px',
//         display: 'flex',
//         flexDirection: 'column'
//       }}>
//         <div style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           marginBottom: '20px'
//         }}>
//           <h2 style={{ color: '#fff', margin: 0 }}>지식 그래프</h2>
//           <button 
//             onClick={onClose}
//             style={{
//               background: 'none',
//               border: 'none',
//               color: '#fff',
//               fontSize: '24px',
//               cursor: 'pointer'
//             }}
//           >×</button>
//         </div>
//         <div style={{ flex: 1 }}>
//           <ForceGraph2D
//             graphData={graphData}
//             nodeLabel="id"
//             linkLabel="label"
//             nodeAutoColorBy="id"
//             linkDirectionalArrowLength={6}
//             linkDirectionalArrowRelPos={1}
//             linkWidth={2}
//             linkColor={() => "#cccccc"}
//             width={800}
//             height={600}
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default GraphModal;