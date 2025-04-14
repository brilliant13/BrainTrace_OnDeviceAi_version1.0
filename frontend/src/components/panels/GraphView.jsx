// src/components/panels/GraphView.jsx
import React from 'react';

function GraphView({ nodes }) {
  return (
    <div className="graph-area">
      <div className="graph-visualization">
        {nodes.map(node => {
          let className = "node";
          if (node.type === 'main') className += " main-node";
          else if (node.type === 'sub') className += " sub-node";
          else if (node.type === 'small') className += " small-node";
          return (
            <div
              key={node.id}
              className={className}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              {node.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default GraphView;
