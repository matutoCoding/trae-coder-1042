import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import type { Event } from '@/types';
import { formatDate, formatMoney, getStatusColor } from '@/utils';

interface EventCardProps {
  data: Event;
  onClick?: () => void;
}

const typeColors: Record<string, string> = {
  '马术考级': '#DAA520',
  '赛事活动': '#8B4513',
  '马场参观': '#2E8B57',
};

const EventCard: React.FC<EventCardProps> = ({ data, onClick }) => {
  const { id, name, type, date, location, price, maxParticipants, currentParticipants, status } = data;

  const handleClick = () => {
    console.log('[EventCard] 点击活动:', name);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/event-detail/index?id=${id}` }).catch((err) => {
        console.error('[EventCard] 跳转失败:', err);
      });
    }
  };

  const progress = (currentParticipants / maxParticipants) * 100;

  return (
    <View className={styles.eventCard} onClick={handleClick}>
      <View className={styles.cardHeader}>
        <View
          className={styles.typeTag}
          style={{ backgroundColor: typeColors[type] + '20', color: typeColors[type] }}
        >
          <Text>{type}</Text>
        </View>
        <View
          className={styles.statusTag}
          style={{ backgroundColor: getStatusColor(status) + '20', color: getStatusColor(status) }}
        >
          <Text>{status}</Text>
        </View>
      </View>
      <Text className={styles.eventName}>{name}</Text>
      <View className={styles.eventMeta}>
        <View className={styles.metaRow}>
          <Text className={styles.metaIcon}>📅</Text>
          <Text className={styles.metaText}>{formatDate(date)}</Text>
        </View>
        <View className={styles.metaRow}>
          <Text className={styles.metaIcon}>📍</Text>
          <Text className={styles.metaText}>{location}</Text>
        </View>
      </View>
      <View className={styles.progressSection}>
        <View className={styles.progressInfo}>
          <Text className={styles.progressLabel}>报名进度</Text>
          <Text className={styles.progressCount}>{currentParticipants}/{maxParticipants}人</Text>
        </View>
        <View className={styles.progressBar}>
          <View className={styles.progressFill} style={{ width: `${progress}%` }} />
        </View>
      </View>
      <View className={styles.cardFooter}>
        <Text className={styles.price}>{price === 0 ? '免费' : formatMoney(price)}</Text>
        <View className={styles.detailBtn}>
          <Text>查看详情</Text>
          <Text className={styles.arrow}>›</Text>
        </View>
      </View>
    </View>
  );
};

export default EventCard;
