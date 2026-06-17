import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import type { Course } from '@/types';
import { formatMoney, getStatusColor } from '@/utils';

interface CourseCardProps {
  data: Course;
  onClick?: () => void;
}

const levelColors: Record<string, string> = {
  '初级': '#2E8B57',
  '中级': '#FF8C00',
  '高级': '#D32F2F',
};

const CourseCard: React.FC<CourseCardProps> = ({ data, onClick }) => {
  const { id, name, coachName, type, level, duration, price, maxStudents, currentStudents, status } = data;

  const handleClick = () => {
    console.log('[CourseCard] 点击课程:', name);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/course-detail/index?id=${id}` }).catch((err) => {
        console.error('[CourseCard] 跳转失败:', err);
      });
    }
  };

  const progress = (currentStudents / maxStudents) * 100;

  return (
    <View className={styles.courseCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.courseType}>{type}</View>
        <View
          className={styles.levelTag}
          style={{ backgroundColor: levelColors[level] + '20', color: levelColors[level] }}
        >
          <Text>{level}</Text>
        </View>
      </View>
      <Text className={styles.courseName}>{name}</Text>
      <View className={styles.courseMeta}>
        <Text className={styles.metaItem}>👨‍🏫 {coachName}</Text>
        <Text className={styles.metaItem}>⏱ {duration}分钟</Text>
      </View>
      <View className={styles.progressSection}>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progress}%` }} />
        </View>
        <Text className={styles.progressText}>
          {currentStudents}/{maxStudents}人
        </Text>
      </View>
      <View className={styles.cardFooter}>
        <Text className={styles.price}>{formatMoney(price)}</Text>
        <View
          className={styles.statusTag}
          style={{ backgroundColor: getStatusColor(status) + '20', color: getStatusColor(status) }}
        >
          <Text>{status}</Text>
        </View>
      </View>
    </View>
  );
};

export default CourseCard;
