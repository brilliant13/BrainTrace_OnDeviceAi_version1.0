// src/data/projectData.js
import { BsGraphUp } from "react-icons/bs";
import { FiFigma } from "react-icons/fi";
import { MdWorkOutline, MdLocalHospital } from "react-icons/md";
import { FaGraduationCap } from "react-icons/fa";
import { BsRocket } from "react-icons/bs";
import { PiStudentBold } from "react-icons/pi";

const projectData = [
  {
    id: 1,
    name: "팀워터 사이언스",
    icon: BsGraphUp,
    files: [
      {
        name: "<나의 팀워터 사이언스 브레인>",
        type: "folder",
        children: [
          { name: "아이디어.txt", type: "file" },
          { name: "마인드맵.png", type: "file" }
        ]
      },
      {
        name: "컴퓨터공학",
        type: "folder",
        children: [
          { name: "Week 1 - 팀워터의 구조.pdf", type: "file" },
          { name: "DB 설계 ERD.png", type: "file" }
        ]
      },
      {
        name: "학습메모",
        type: "folder",
        children: [
          { name: "<1주차> Spring Overview.txt", type: "file" },
          { name: "<2주차> Dependency Injection.txt", type: "file" },
          { name: "<3주차> SpringMVC.txt", type: "file" }
        ]
      }
    ],
    chat: {
      title: "인공지능의 장점",
      content: "인공지능(AI)은 수많은 장점을 제공하며 우리 삶의 다양한 측면을 혁신할 가능성을 가지고 있습니다. AI의 주요 장점은 다음과 같습니다:\n\n1. 자동화: AI는 반복적이고 단순한 작업을 자동화하여 인간의 시간과 노력을 절약할 수 있습니다. 대용량 데이터 처리, 복잡한 계산 수행 및 정밀도와 일관성을 갖춘 작업 실행이 가능합니다.\n\n2. 의사결정: AI 시스템은 방대한 양의 데이터를 분석하고 패턴을 식별하며 해당 분석을 기반으로 정보에 입각한 결정을 내릴 수 있습니다.\n\n3. 정확도 향상: AI 알고리즘은 이미지 인식, 자연어 처리 및 데이터 분석과 같은 작업에서 높은 수준의 정확도와 정밀도를 달성할 수 있습니다.\n\n4. 연속 작동: AI 시스템은 휴식 없이 지치지 않고 작동할 수 있어 24/7 중단 없는 운영이 가능합니다."
    },
    memo: {
      title: "팀워터 프로젝트 계획",
      content: "# 팀워터 프로젝트 로드맵\n\n## 1단계: 요구사항 분석\n- 사용자 인터뷰 진행\n- 요구사항 문서화\n\n## 2단계: 설계\n- DB 스키마 설계\n- API 명세 작성\n\n## 3단계: 개발\n```java\n@Service\npublic class TeamService {\n  private final TeamRepository repository;\n  \n  @Autowired\n  public TeamService(TeamRepository repository) {\n    this.repository = repository;\n  }\n}\n```\n\n개발 일정 준수를 위해 노력합시다!"
    },
    nodes: [
      { id: "main", label: "L", type: "main", x: 50, y: 50 },
      { id: "dev", label: "Devel...", type: "sub", x: 35, y: 30 },
      { id: "app", label: "Appl...", type: "sub", x: 65, y: 70 },
      { id: "b1", label: "B", type: "small", x: 45, y: 40 },
      { id: "b2", label: "B", type: "small", x: 55, y: 60 }
    ],

    createdAt: "2025. 4. 14.",
  },
  {
    id: 2,
    name: "Figma",
    icon: FiFigma,
    files: [
      {
        name: "디자인 에셋",
        type: "folder",
        children: [
          { name: "로고.svg", type: "file" },
          { name: "아이콘 세트.png", type: "file" },
          { name: "컬러 팔레트.png", type: "file" }
        ]
      },
      {
        name: "UI 컴포넌트",
        type: "folder",
        children: [
          { name: "버튼.txt", type: "file" },
          { name: "카드.pdf", type: "file" },
          { name: "내비게이션.txt", type: "file" }
        ]
      },
      {
        name: "프로토타입",
        type: "folder",
        children: [
          { name: "로그인 화면.txt", type: "file" },
          { name: "대시보드.txt", type: "file" },
          { name: "사용자 흐름.txt", type: "file" }
        ]
      }
    ],
    chat: {
      title: "Figma 디자인 시스템 설명",
      content: "Figma 디자인 시스템은 다음과 같은 구성 요소로 이루어져 있습니다:\n\n1. 기본 요소(Primitives): 색상, 타이포그래피, 그리드, 간격 등 디자인의 기본이 되는 요소들입니다.\n\n2. 컴포넌트(Components): 버튼, 입력 필드, 카드 등 재사용 가능한 UI 요소들입니다. 이들은 기본 요소를 활용하여 구축됩니다.\n\n3. 패턴(Patterns): 컴포넌트들이 함께 작동하는 방식을 정의합니다. 예를 들어 폼, 내비게이션 메뉴, 데이터 테이블 등이 있습니다.\n\n4. 페이지 템플릿(Page Templates): 실제 사용자 인터페이스의 전체 레이아웃을 정의하는 구조입니다."
    },
    memo: {
      title: "디자인 핵심 원칙",
      content: "# 디자인 시스템 핵심 원칙\n\n## 일관성(Consistency)\n- 동일한 요소는 항상 동일하게 보이고 동작해야 함\n- 사용자가 패턴을 학습하고 예측할 수 있도록 함\n\n## 재사용성(Reusability)\n- 모든 컴포넌트는 여러 상황에서 재사용 가능하도록 설계\n- 중복 작업 최소화, 효율성 극대화\n\n## 접근성(Accessibility)\n```css\n/* 충분한 색상 대비 예시 */\n.button-primary {\n  background-color: #0056b3;\n  color: #ffffff;\n  padding: 12px 20px;\n  border-radius: 4px;\n}\n```\n\n## 확장성(Scalability)\n- 시스템이 성장함에 따라 쉽게 확장할 수 있도록 설계"
    },
    nodes: [
      { id: "main", label: "D", type: "main", x: 50, y: 50 },
      { id: "ui", label: "UI", type: "sub", x: 30, y: 30 },
      { id: "ux", label: "UX", type: "sub", x: 70, y: 30 },
      { id: "comp", label: "Comp", type: "sub", x: 50, y: 70 },
      { id: "c", label: "C", type: "small", x: 40, y: 40 },
      { id: "p", label: "P", type: "small", x: 60, y: 60 }
    ],

    createdAt: "2025. 2. 14.",
  },
  {
    id: 3,
    name: "Freelance",
    icon: MdWorkOutline,
    files: [
      {
        name: "클라이언트",
        type: "folder",
        children: [
          { name: "ABC 회사.txt", type: "file" },
          { name: "XYZ 스타트업.txt", type: "file" },
          { name: "연락처 목록.xlsx", type: "file" }
        ]
      },
      {
        name: "프로젝트",
        type: "folder",
        children: [
          { name: "요구사항.docx", type: "file" },
          { name: "견적서.pdf", type: "file" },
          { name: "계약서.pdf", type: "file" }
        ]
      },
      {
        name: "재무",
        type: "folder",
        children: [
          { name: "2023 수입.xlsx", type: "file" },
          { name: "세금 관련.pdf", type: "file" },
          { name: "인보이스 템플릿.docx", type: "file" }
        ]
      }
    ],
    chat: {
      title: "프리랜서 작업 가이드",
      content: "성공적인 프리랜서 작업을 위한 핵심 단계들은 다음과 같습니다:\n\n1. 초기 상담: 클라이언트의 요구사항을 명확히 이해하고 프로젝트 범위를 정의합니다.\n\n2. 제안 및 계약: 상세한 제안서와 명확한 계약서를 작성하여 업무 범위, 일정, 비용, 지적 재산권 등을 명시합니다.\n\n3. 작업 과정: 정기적인 업데이트와 피드백을 통해 클라이언트와 지속적으로 소통합니다.\n\n4. 납품 및 피드백: 최종 결과물을 제공하고 필요한 수정 사항을 반영합니다.\n\n5. 사후 관리: 추가 지원이나 유지보수에 대한 계획을 세웁니다."
    },
    memo: {
      title: "프리랜서 효율성 팁",
      content: "# 프리랜서 생산성 향상 전략\n\n## 시간 관리\n- 포모도로 기법: 25분 집중, 5분 휴식\n- 일일 우선순위 목록 작성\n- 가장 중요한 작업을 아침에 처리\n\n## 클라이언트 관리\n- 명확한 커뮤니케이션 유지\n- 기대치 관리\n- 정기적인 업데이트 제공\n\n## 재무 관리\n```javascript\n// 간단한 수입 계산기\nfunction calculateIncome(hourlyRate, hoursWorked, expenses) {\n  const grossIncome = hourlyRate * hoursWorked;\n  const netIncome = grossIncome - expenses;\n  return { grossIncome, netIncome };\n}\n```\n\n## 지속적 학습\n- 주간 2시간 새로운 기술 학습\n- 월간 1개 온라인 강좌 수강"
    },
    nodes: [
      { id: "main", label: "F", type: "main", x: 50, y: 50 },
      { id: "client", label: "Client", type: "sub", x: 30, y: 30 },
      { id: "project", label: "Project", type: "sub", x: 70, y: 30 },
      { id: "finance", label: "Finance", type: "sub", x: 50, y: 70 },
      { id: "w", label: "W", type: "small", x: 40, y: 40 },
      { id: "m", label: "M", type: "small", x: 60, y: 60 }
    ],

    createdAt: "2025. 1. 22.",
  },
  {
    id: 4,
    name: "Student Loans",
    icon: MdLocalHospital,
    files: [
      {
        name: "대출 정보",
        type: "folder",
        children: [
          { name: "대출 계약서.pdf", type: "file" },
          { name: "이자율 정보.xlsx", type: "file" },
          { name: "상환 일정.pdf", type: "file" }
        ]
      },
      {
        name: "납부 기록",
        type: "folder",
        children: [
          { name: "2023년 납부 내역.xlsx", type: "file" },
          { name: "영수증.pdf", type: "file" }
        ]
      },
      {
        name: "장학금",
        type: "folder",
        children: [
          { name: "지원 가능 장학금.docx", type: "file" },
          { name: "신청서 양식.pdf", type: "file" },
          { name: "합격 통지서.pdf", type: "file" }
        ]
      }
    ],
    chat: {
      title: "학자금 대출 관리 방법",
      content: "학자금 대출을 효과적으로 관리하는 방법에는 다음과 같은 것들이 있습니다:\n\n1. 대출 조건 이해: 이자율, 상환 기간, 연체 페널티 등 대출 조건을 정확히 파악하는 것이 중요합니다.\n\n2. 상환 계획 수립: 재정 상황에 맞는 현실적인 상환 계획을 세우고, 가능하다면 최소 납부액보다 더 많이 납부하여 원금을 빠르게 줄이는 것이 좋습니다.\n\n3. 자동 납부 설정: 납부일을 놓치지 않도록 자동 납부를 설정하면 연체를 방지하고 때로는 이자율 할인 혜택도 받을 수 있습니다.\n\n4. 대출 통합: 여러 개의 대출이 있다면, 대출 통합을 통해 관리를 단순화하고 경우에 따라 더 나은 조건으로 재융자할 수 있는지 알아볼 수 있습니다."
    },
    memo: {
      title: "학자금 대출 상환 전략",
      content: "# 학자금 대출 상환 전략\n\n## 눈덩이 전략 (Snowball Method)\n- 가장 작은 대출부터 집중적으로 상환\n- 성취감을 느끼며 동기 부여\n- 하나씩 완전히 갚아나가는 방식\n\n## 눈사태 전략 (Avalanche Method)\n- 이자율이 가장 높은 대출부터 집중적으로 상환\n- 장기적으로 더 적은 이자 납부\n- 재정적으로 가장 효율적인 방법\n\n## 계산 예시\n```javascript\nfunction calculateLoanPayoff(principal, interestRate, monthlyPayment) {\n  const monthlyRate = interestRate / 100 / 12;\n  const months = Math.log(monthlyPayment / (monthlyPayment - principal * monthlyRate)) / Math.log(1 + monthlyRate);\n  return Math.ceil(months);\n}\n```\n\n## 추가 팁\n- 상환 능력이 생길 때마다 추가 납부\n- 세금 공제 혜택 활용\n- 대출 면제/감면 프로그램 확인"
    },
    nodes: [
      { id: "main", label: "S", type: "main", x: 50, y: 50 },
      { id: "loan", label: "Loan", type: "sub", x: 30, y: 30 },
      { id: "payment", label: "Payment", type: "sub", x: 70, y: 30 },
      { id: "scholarship", label: "Scholarship", type: "sub", x: 50, y: 70 },
      { id: "i", label: "I", type: "small", x: 40, y: 40 },
      { id: "r", label: "R", type: "small", x: 60, y: 60 }
    ],

    createdAt: "2024. 12. 09.",
  },
  {
    id: 5,
    name: "Virta Health",
    icon: FaGraduationCap,
    files: [
      {
        name: "건강 기록",
        type: "folder",
        children: [
          { name: "검사 결과.pdf", type: "file" },
          { name: "의사 소견서.docx", type: "file" },
          { name: "약물 정보.pdf", type: "file" }
        ]
      },
      {
        name: "식단 계획",
        type: "folder",
        children: [
          { name: "저탄수화물 식단.xlsx", type: "file" },
          { name: "식단 일지.docx", type: "file" },
          { name: "레시피 모음.pdf", type: "file" }
        ]
      },
      {
        name: "건강 목표",
        type: "folder",
        children: [
          { name: "일일 활동 계획.xlsx", type: "file" },
          { name: "주간 진행 상황.xlsx", type: "file" },
          { name: "장기 목표.docx", type: "file" }
        ]
      }
    ],
    chat: {
      title: "건강 관리 팁",
      content: "효과적인 건강 관리를 위한 핵심 팁은 다음과 같습니다:\n\n1. 균형 잡힌 식단: 다양한 영양소를 포함한 균형 잡힌 식사는 전반적인 건강의 기초입니다. 과일, 채소, 통곡물, 건강한 단백질 및 지방을 적절히 섭취하세요.\n\n2. 규칙적인 운동: 주당 최소 150분의 중등도 유산소 운동과 주 2회 이상의 근력 운동을 목표로 하세요. 일상 활동량도 증가시키는 것이 좋습니다.\n\n3. 충분한 수면: 대부분의 성인은 7-9시간의 양질의 수면이 필요합니다. 일관된 수면 습관과 편안한 수면 환경을 조성하세요.\n\n4. 스트레스 관리: 명상, 깊은 호흡, 요가, 취미 활동 등 자신에게 맞는 스트레스 해소 방법을 찾아 정기적으로 실천하세요."
    },
    memo: {
      title: "건강 목표 설정 방법",
      content: "# 효과적인 건강 목표 설정 방법\n\n## SMART 원칙 적용\n- Specific(구체적): '체중 감량'보다 '3개월 안에 5kg 감량'\n- Measurable(측정 가능): 진행 상황을 추적할 수 있는 방법 포함\n- Achievable(달성 가능): 현실적인 목표 설정\n- Relevant(관련성): 전반적인 건강 향상과 연관된 목표\n- Time-bound(기한): 명확한 시간 프레임 설정\n\n## 단계별 접근\n```markdown\n### 장기 목표 (6개월)\n- 체지방률 5% 감소\n- 10km 완주 가능한 체력 확보\n\n### 중기 목표 (3개월)\n- 주 3회 30분 유산소 운동 습관화\n- 일일 설탕 섭취량 25g 이하로 유지\n\n### 단기 목표 (1개월)\n- 매일 8잔의 물 마시기\n- 주 2회 근력 운동 시작하기\n```\n\n## 성과 축하하기\n- 작은 성취도 인정하고 축하\n- 건강한 방식으로 보상 제공"
    },
    nodes: [
      { id: "main", label: "H", type: "main", x: 50, y: 50 },
      { id: "diet", label: "Diet", type: "sub", x: 30, y: 30 },
      { id: "exercise", label: "Exercise", type: "sub", x: 70, y: 30 },
      { id: "sleep", label: "Sleep", type: "sub", x: 50, y: 70 },
      { id: "n", label: "N", type: "small", x: 40, y: 40 },
      { id: "f", label: "F", type: "small", x: 60, y: 60 }
    ],

    createdAt: "2024. 05. 19.",
  },
  {
    id: 6,
    name: "Space Research",
    icon: BsRocket,
    files: [
      {
        name: "논문 자료",
        type: "folder",
        children: [
          { name: "우주 탐사 개요.pdf", type: "file" },
          { name: "엔진 설계.docx", type: "file" }
        ]
      },
      {
        name: "시뮬레이션 결과",
        type: "folder",
        children: [
          { name: "모델링 결과.png", type: "file" },
          { name: "테스트 로그.txt", type: "file" }
        ]
      }
    ],
    chat: {
      title: "로켓 엔진 효율 향상",
      content: "로켓 엔진 효율을 높이기 위한 주요 전략은 다음과 같습니다:\n\n1. 연료 최적화\n2. 연소실 압력 개선\n3. 배기 시스템 간소화\n4. 재사용 가능한 부품 도입"
    },
    memo: {
      title: "우주 프로젝트 회의록",
      content: "# 우주 추진 회의\n\n- 차세대 액체 연료 엔진에 대한 논의\n- 열 손실 최소화를 위한 재료 제안\n- 프로젝트 마일스톤 확인"
    },
    nodes: [
      { id: "main", label: "R", type: "main", x: 50, y: 50 },
      { id: "eng", label: "Engine", type: "sub", x: 30, y: 30 },
      { id: "fuel", label: "Fuel", type: "sub", x: 70, y: 30 },
      { id: "sim", label: "Sim", type: "sub", x: 50, y: 70 }
    ],
    createdAt: "2025. 4. 29."
  },

  {
    id: 7,
    name: "대학생 커뮤니티",
    icon: PiStudentBold,
    files: [
      {
        name: "운영 계획",
        type: "folder",
        children: [
          { name: "동아리 소개.txt", type: "file" },
          { name: "활동 일정.pdf", type: "file" }
        ]
      },
      {
        name: "홍보 자료",
        type: "folder",
        children: [
          { name: "포스터 디자인.png", type: "file" },
          { name: "SNS 콘텐츠.md", type: "file" }
        ]
      }
    ],
    chat: {
      title: "대학생 커뮤니티 운영 가이드",
      content: "성공적인 커뮤니티 운영을 위한 3가지:\n\n1. 소통 중심의 문화\n2. 꾸준한 콘텐츠 제작\n3. 참여 유도 캠페인"
    },
    memo: {
      title: "운영진 회의 요약",
      content: "# 5월 회의 요약\n\n- 신입부원 환영 행사 준비\n- 회비 사용 내역 보고\n- 여름방학 프로그램 기획 시작"
    },
    nodes: [
      { id: "main", label: "U", type: "main", x: 50, y: 50 },
      { id: "event", label: "Event", type: "sub", x: 30, y: 30 },
      { id: "promo", label: "Promo", type: "sub", x: 70, y: 30 },
      { id: "doc", label: "Doc", type: "sub", x: 50, y: 70 }
    ],
    createdAt: "2025. 4. 30."
  }
];

export default projectData;