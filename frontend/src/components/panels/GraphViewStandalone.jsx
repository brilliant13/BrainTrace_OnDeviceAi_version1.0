// src/components/GraphViewStandalone.jsx
import React from 'react';
import GraphView from './GraphView';

function GraphViewStandalone() {
    const searchParams = new URLSearchParams(window.location.search);
    const brainId = searchParams.get('brainId') || 'default-brain-id';

    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
            <GraphView brainId={brainId} height="100%" isFullscreen={true} />
        </div>
    );
}

export default GraphViewStandalone;
