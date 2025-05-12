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
<<<<<<< HEAD
=======
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
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
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
<<<<<<< HEAD
=======
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
>>>>>>> bd4809b5b92c8587ae68d8717c7d2ac8f664af1e
    createdAt: "2025. 4. 30."
  }
];

export default projectData;