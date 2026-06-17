import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';
import type { StatItem } from '@/types';

interface StatCardProps {
  data: StatItem;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ data, onClick }) => {
  const { label, value, unit, trend } = data;

  const getTrendClass = () => {
    switch (trend) {
      case 'up':
        return styles.trendUp;
      case 'down':
        return styles.trendDown;
      default:
        return '';
    }
  };

  return (
    <View
      className={classNames(styles.statCard, onClick && styles.clickable)}
      onClick={onClick}
    >
      <Text className={styles.statLabel}>{label}</Text>
      <View className={styles.statValueRow}>
        <Text className={styles.statValue}>{value}</Text>
        {unit && <Text className={styles.statUnit}>{unit}</Text>}
      </View>
      {trend && (
        <View className={classNames(styles.statTrend, getTrendClass())}>
          <Text>{trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}</Text>
          <Text>较上周</Text>
        </View>
      )}
    </View>
  );
};

export default StatCard;
