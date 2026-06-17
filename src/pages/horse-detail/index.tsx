import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const HorseDetailPage: React.FC = () => {
  const router = useRouter();
  const [horseId, setHorseId] = useState<string>('');

  useEffect(() => {
    console.log('[HorseDetailPage] 页面加载');
    const id = router.params.id || '';
    setHorseId(id);
    console.log('[HorseDetailPage] 马匹ID:', id);
  }, [router.params]);

  useDidShow(() => {
    console.log('[HorseDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholder}>
        <View className={styles.placeholderIcon}>
          <Text>🐎</Text>
        </View>
        <Text className={styles.placeholderTitle}>马匹详情页</Text>
        <Text className={styles.placeholderText}>
          此页面将展示马匹的完整档案信息，包括基础信息、血统、健康记录、训练记录、赛事成绩等。
        </Text>
        {horseId && (
          <Text className={styles.idText}>马匹ID：{horseId}</Text>
        )}
      </View>
    </View>
  );
};

export default HorseDetailPage;
