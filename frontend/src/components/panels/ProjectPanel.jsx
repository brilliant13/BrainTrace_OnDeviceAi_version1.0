// // src/components/panels/ProjectPanel.jsx
// import React from 'react';
// import './Panels.css';

// function ProjectPanel() {
//   return (
//     <div className="panel-container sidebar-container">
//       <div className="panel-content">
//         <div className="sidebar-icons">
//           <div className="sidebar-icon active">
//             <span role="img" aria-label="project">📊</span>
//           </div>
//           <div className="sidebar-icon">
//             <span role="img" aria-label="chat">💬</span>
//           </div>
//           <div className="sidebar-icon">
//             <span role="img" aria-label="settings">⚙️</span>
//           </div>
//           <div className="sidebar-icon add-icon">
//             <span role="img" aria-label="add">➕</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProjectPanel;
// src/components/panels/ProjectPanel.jsx
import React from 'react';
import './Panels.css';
import projectData from '../../data/projectData';

function ProjectPanel({ activeProject, onProjectChange }) {
  return (
    <div className="panel-container sidebar-container">
      <div className="panel-content">
        <div className="sidebar-icons">
          {projectData.map(project => (
            <div 
              key={project.id}
              className={`sidebar-icon ${activeProject === project.id ? 'active' : ''}`}
              onClick={() => onProjectChange(project.id)}
              title={project.name}
            >
              <span role="img" aria-label={project.name}>{project.icon}</span>
            </div>
          ))}
          
          <div className="sidebar-icon add-icon">
            <span role="img" aria-label="add">➕</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectPanel;