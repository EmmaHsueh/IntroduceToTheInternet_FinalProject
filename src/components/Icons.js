import React from 'react';
import {
  FaUser, FaUsers, FaEdit, FaComments, FaBook, FaGlobeAsia,
  FaUtensils, FaCalendarAlt, FaGraduationCap, FaHome,
  FaRocket, FaPizzaSlice, FaSearch, FaCheckCircle,
  FaTimesCircle, FaTrash, FaMapMarkerAlt, FaPaw,
  FaQuestionCircle, FaHandshake, FaDog
} from 'react-icons/fa';
import {
  BsFillChatDotsFill, BsPinAngleFill
} from 'react-icons/bs';
import {
  MdSentimentDissatisfied
} from 'react-icons/md';
import {
  GiBearFace, GiOpenBook
} from 'react-icons/gi';
import {
  IoMdGlobe, IoMdChatboxes
} from 'react-icons/io';
import {
  MdEdit
} from 'react-icons/md';

// 通用图标组件
export const Icon = ({ type, size = 20, color, style, className }) => {
  const IconComponent = ICON_MAP[type] || FaQuestionCircle;

  return (
    <IconComponent
      size={size}
      color={color}
      style={style}
      className={className}
    />
  );
};

// 图标映射表
const ICON_MAP = {
  // 用户相关
  'user': FaUser,
  'users': FaUsers,

  // 动物头像
  'bear': GiBearFace,
  'paw': FaPaw,
  'rabbit': FaDog,
  'student': FaGraduationCap,

  // 功能图标
  'chat': BsFillChatDotsFill,
  'comments': FaComments,
  'edit': FaEdit,
  'book': FaBook,
  'openbook': GiOpenBook,
  'rocket': FaRocket,
  'pizza': FaPizzaSlice,
  'graduation': FaGraduationCap,

  // 分类/主题
  'food': FaUtensils,
  'calendar': FaCalendarAlt,
  'globe': FaGlobeAsia,
  'worldglobe': IoMdGlobe,
  'home': FaHome,

  // 状态
  'search': FaSearch,
  'success': FaCheckCircle,
  'error': FaTimesCircle,
  'sad': MdSentimentDissatisfied,
  'delete': FaTrash,
  'pin': BsPinAngleFill,
  'question': FaQuestionCircle,

  // 位置
  'location': FaMapMarkerAlt,

  // 其他功能
  'handshake': FaHandshake,
  'chatboxes': IoMdChatboxes,
  'pencil': MdEdit,
};

// 头像图标映射（用于用户头像系统）
export const AvatarIcon = ({ avatar, size = 48, color }) => {
  const getIconType = () => {
    if (!avatar || avatar === 'emoji-default') return 'user';

    const mapping = {
      'emoji-bear_face': 'bear',
      'emoji-cat_paw': 'paw',
      'emoji-rabbit_face': 'rabbit',
      'emoji-student': 'student',
      'emoji-graduation': 'graduation',
      'emoji-book': 'book',
      'emoji-rocket': 'rocket',
      'emoji-pizza': 'pizza',
    };

    return mapping[avatar] || 'user';
  };

  return <Icon type={getIconType()} size={size} color={color} />;
};

// 导出头像选项（用于注册和个人资料编辑）
export const AVATAR_OPTIONS = [
  { key: 'emoji-cat_paw', label: '猫咪', iconType: 'paw' },
  { key: 'emoji-bear_face', label: '熊熊', iconType: 'bear' },
  { key: 'emoji-rabbit_face', label: '兔子', iconType: 'rabbit' },
  { key: 'emoji-student', label: '学生', iconType: 'student' },
  { key: 'emoji-graduation', label: '学士帽', iconType: 'graduation' },
  { key: 'emoji-pizza', label: '披萨', iconType: 'pizza' },
  { key: 'emoji-book', label: '书本', iconType: 'book' },
  { key: 'emoji-rocket', label: '火箭', iconType: 'rocket' },
];

export default Icon;
