import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import type { Horse } from '@/types';
import { getStatusColor } from '@/utils';

interface HorseCardProps {
  data: Horse;
  onClick?: () => void;
}

const HorseCard: React.FC<HorseCardProps> = ({ data, onClick }) => {
  const { id, name, breed, age, gender, status, avatar, stableNo, trainer } = data;

  const handleClick = () => {
    console.log('[HorseCard] 点击马匹:', name);
    if (onClick) {
      onClick();
    } else {
      Taro.navigateTo({ url: `/pages/horse-detail/index?id=${id}` }).catch((err) => {
        console.error('[HorseCard] 跳转失败:', err);
      });
    }
  };

  return (
    <View className={styles.horseCard} onClick={handleClick}>
      <Image className={styles.horseAvatar} src={avatar} mode="aspectFill" />
      <View className={styles.horseInfo}>
        <View className={styles.horseHeader}>
          <Text className={styles.horseName}>{name}</Text>
          <View
            className={styles.statusTag}
            style={{ backgroundColor: getStatusColor(status) + '20', color: getStatusColor(status) }}
          >
            <Text>{status}</Text>
          </View>
        </View>
        <View className={styles.horseMeta}>
          <Text className={styles.metaItem}>{breed}</Text>
          <Text className={styles.metaItem}>·</Text>
          <Text className={styles.metaItem}>{age}岁</Text>
          <Text className={styles.metaItem}>·</Text>
          <Text className={styles.metaItem}>{gender}</Text>
        </View>
        <View className={styles.horseFooter}>
          <View className={styles.footerItem}>
            <Text className={styles.footerLabel}>马房</Text>
            <Text className={styles.footerValue}>{stableNo}</Text>
          </View>
          <View className={styles.footerItem}>
            <Text className={styles.footerLabel}>教练</Text>
            <Text className={styles.footerValue}>{trainer}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default HorseCard;
