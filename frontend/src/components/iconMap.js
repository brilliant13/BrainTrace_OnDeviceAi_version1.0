// src/components/iconMap.js
import { BsGraphUp, BsRocket } from 'react-icons/bs';
import { FiFigma } from 'react-icons/fi';
import { MdWorkOutline, MdLocalHospital } from 'react-icons/md';
import { FaGraduationCap } from 'react-icons/fa';
import { PiStudentBold } from 'react-icons/pi';

export const ICONS = [
    { key: 'BsGraphUp', label: '그래프', cmp: BsGraphUp },
    { key: 'FiFigma', label: 'Figma', cmp: FiFigma },
    { key: 'MdWorkOutline', label: '작업', cmp: MdWorkOutline },
    { key: 'MdLocalHospital', label: '헬스', cmp: MdLocalHospital },
    { key: 'FaGraduationCap', label: '교육', cmp: FaGraduationCap },
    { key: 'BsRocket', label: '로켓', cmp: BsRocket },
    { key: 'PiStudentBold', label: '커뮤니티', cmp: PiStudentBold },
];

export const iconByKey = ICONS.reduce((m, o) => ({ ...m, [o.key]: o.cmp }), {});
