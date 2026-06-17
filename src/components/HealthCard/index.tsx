import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import type { HealthRecord } from '@/types';
import { formatDate, formatMoney, getStatusColor } from '@/utils';

interface HealthCardProps {
  data: HealthRecord;
  onClick?: () => void;
}

const typeIcons: Record<string, string> = {
  '钉蹄': '🦶',
  '兽医诊疗': '🏥',
  '体检': '📋',
  '驱虫': '💊',
  '疫苗': '💉',
};

const HealthCard: React.FC<HealthCardProps> = ({ data, onClick }) => {
  const { id, type, horseName, date, description, cost, status, veterinarian, farrier } = data;

  const handleClick = () => {
    console.log('[HealthCard] 点击健康记录:', id);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/health-detail/index?id=${id}` }).catch((err) => {
        console.error('[HealthCard] 跳转失败:', err);
      });
    }
  };

  const operator = veterinarian || farrier || '-';

  return (
    <View className={styles.healthCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View className={styles.typeIcon}>{typeIcons[type] || '📋'}</View>
        <View className={styles.typeInfo}>
          <Text className={styles.typeText}>{type}</Text>
          <Text className={styles.horseName}>{horseName}</Text>
        </View>
        <View
          className={styles.statusTag}
          style={{ backgroundColor: getStatusColor(status) + '20', color: getStatusColor(status) }}
        >
          <Text>{status}</Text>
        </View>
      </View>
      <Text className={styles.description}>{description}</Text>
      <View className={styles.cardFooter}>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>日期</Text>
          <Text className={styles.footerValue}>{formatDate(date)}</Text>
        </View>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>人员</Text>
          <Text className={styles.footerValue}>{operator}</Text>
        </View>
        <View className={styles.footerItem}>
          <Text className={styles.footerLabel}>费用</Text>
          <Text className={styles.footerValue}>{formatMoney(cost)}</Text>
        </View>
      </View>
    </View>
  );
};

export default HealthCard;
