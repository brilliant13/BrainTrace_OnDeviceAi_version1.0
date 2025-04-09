// src/components/layout/MainLayout.jsx
// import React, { useState } from 'react';
// import './MainLayout.css';

// // 패널 컴포넌트 가져오기
// import ProjectPanel from '../panels/ProjectPanel';
// import SourcePanel from '../panels/SourcePanel';
// import ChatPanel from '../panels/ChatPanel';
// import MemoPanel from '../panels/MemoPanel';

// function MainLayout() {
//   // 활성화된 프로젝트 ID 상태 관리
//   const [activeProject, setActiveProject] = useState(1);
  
//   // 프로젝트 변경 핸들러
//   const handleProjectChange = (projectId) => {
//     setActiveProject(projectId);
//   };

//   return (
//     <div className="main-container">
//       <div className="layout project-layout">
//         <ProjectPanel 
//           activeProject={activeProject} 
//           onProjectChange={handleProjectChange} 
//         />
//       </div>
//       <div className="layout source-layout">
//         <SourcePanel activeProject={activeProject} />
//       </div>
//       <div className="layout chat-layout">
//         <ChatPanel activeProject={activeProject} />
//       </div>
//       <div className="layout memo-layout">
//         <MemoPanel activeProject={activeProject} />
//       </div>
//     </div>
//   );
// }

// export default MainLayout;

// src/components/layout/MainLayout.jsx
import React, { useState } from 'react';
import './MainLayout.css';

// 패널 컴포넌트 가져오기
import ProjectPanel from '../panels/ProjectPanel';
import SourcePanel from '../panels/SourcePanel';
import ChatPanel from '../panels/ChatPanel';
import MemoPanel from '../panels/MemoPanel';

function MainLayout() {
  // 활성화된 프로젝트 ID 상태 관리
  const [activeProject, setActiveProject] = useState(1);
  
  // 프로젝트 변경 핸들러
  const handleProjectChange = (projectId) => {
    setActiveProject(projectId);
  };

  return (
    <div className="main-container">
      <div className="layout project-layout">
        <ProjectPanel 
          activeProject={activeProject} 
          onProjectChange={handleProjectChange} 
        />
      </div>
      <div className="layout source-layout">
        <SourcePanel activeProject={activeProject} />
      </div>
      <div className="layout chat-layout">
        <ChatPanel activeProject={activeProject} />
      </div>
      <div className="layout memo-layout">
        <MemoPanel activeProject={activeProject} />
      </div>
    </div>
  );
}

export default MainLayout;