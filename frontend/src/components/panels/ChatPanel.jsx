// // src/components/panels/ChatPanel.jsx
// import React from 'react';
// import './Panels.css';

// function ChatPanel() {
//   return (
//     <div className="panel-container">
//       <h2>Chat</h2>
//       <div className="panel-content chat-content">
//         <div className="chat-header">
//           <div className="message-title">The advantages of Artificial Intelligence</div>
//         </div>
//         <div className="chat-messages">
//           <div className="user-presence">
//             <div className="user-avatar">👤</div>
//           </div>
//           <div className="message">
//             <div className="message-body">
//               <p>Artificial Intelligence (AI) offers numerous advantages and has the potential to revolutionize various aspects of our lives. Here are some key advantages of AI:</p>
//               <ol>
//                 <li>Automation: AI can automate repetitive and mundane tasks, saving time and effort for humans. It can handle large volumes of data, perform complex calculations, and execute tasks with precision and consistency. This automation leads to increased productivity and efficiency in various industries.</li>
//                 <li>Decision-making: AI systems can analyze vast amounts of data, identify patterns, and make informed decisions based on that analysis. This ability is particularly useful in complex scenarios where humans may struggle to process large datasets or where quick and accurate decisions are crucial.</li>
//                 <li>Improved accuracy: AI algorithms can achieve high levels of accuracy and precision in tasks such as image recognition, natural language processing, and data analysis. They can eliminate human errors caused by fatigue, distractions, or bias, leading to more reliable and consistent results.</li>
//                 <li>Continuous operation: AI systems can work tirelessly without the need for breaks, resulting in uninterrupted 24/7 operations. This capability is especially beneficial in applications like customer support chatbots, manufacturing processes, and surveillance systems.</li>
//               </ol>
//             </div>
//           </div>
//         </div>

//         <div className="chat-input-container">
//           <div className="chat-controls">
//             <button className="control-button">Regenerate response</button>
//             <button className="control-button submit-button">Submit</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatPanel;

// src/components/panels/ChatPanel.jsx
import React from 'react';
import './Panels.css';
import projectData from '../../data/projectData';

function ChatPanel({ activeProject }) {
  const project = projectData.find(p => p.id === activeProject) || projectData[0];
  const { title, content } = project.chat || { title: '', content: '' };

  return (
    <div className="panel-container">
      <div className="panel-header">
        {/* <h2 style={{  cdisplay: collapsed ? 'none' : 'block' }}>Source</h2> */}
        <span
          className="header-title"
          style={{
            fontSize: '16px',

          }}
        >
          Chat
        </span>
      </div>


      {/* <h2>Chat</h2> */}

      <div className="panel-content chat-content">
        <div className="chat-header">
          <div className="message-title">{title}</div>
        </div>
        <div className="chat-messages">
          <div className="user-presence">
            <div className="user-avatar">👤</div>
          </div>
          <div className="message">
            <div className="message-body">
              {content.split('\n\n').map((paragraph, index) => {
                // 숫자로 시작하는 문단은 목록 항목으로 처리
                if (/^\d+\./.test(paragraph)) {
                  return (
                    <div key={index} style={{ marginBottom: '10px' }}>
                      {paragraph}
                    </div>
                  );
                }
                return <p key={index}>{paragraph}</p>;
              })}
            </div>
          </div>
        </div>

        <div className="chat-input-container">
          <div className="chat-controls">
            <button className="control-button">Regenerate response</button>
            <button className="control-button submit-button">Submit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatPanel;