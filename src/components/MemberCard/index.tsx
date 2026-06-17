import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import type { Member } from '@/types';
import { formatMoney, getLevelColor, getStatusColor } from '@/utils';

interface MemberCardProps {
  data: Member;
  onClick?: () => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ data, onClick }) => {
  const { id, name, avatar, memberLevel, remainingHours, totalSpent, status, phone } = data;

  const handleClick = () => {
    console.log('[MemberCard] 点击会员:', name);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/member-detail/index?id=${id}` }).catch((err) => {
        console.error('[MemberCard] 跳转失败:', err);
      });
    }
  };

  return (
    <View className={styles.memberCard} onClick={handleClick}>
      <Image className={styles.memberAvatar} src={avatar} mode="aspectFill" />
      <View className={styles.memberInfo}>
        <View className={styles.memberHeader}>
          <Text className={styles.memberName}>{name}</Text>
          <View
            className={styles.levelTag}
            style={{ backgroundColor: getLevelColor(memberLevel) + '30', color: getLevelColor(memberLevel) }}
          >
            <Text>{memberLevel}</Text>
          </View>
        </View>
        <Text className={styles.memberPhone}>{phone}</Text>
        <View className={styles.memberStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{remainingHours}</Text>
            <Text className={styles.statLabel}>剩余课时</Text>
          </View>
          <View className={styles.statDivider} />
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{formatMoney(totalSpent)}</Text>
            <Text className={styles.statLabel}>累计消费</Text>
          </View>
        </View>
      </View>
      <View
        className={styles.statusTag}
        style={{ backgroundColor: getStatusColor(status) + '20', color: getStatusColor(status) }}
      >
        <Text>{status}</Text>
      </View>
    </View>
  );
};

export default MemberCard;
