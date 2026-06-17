import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const EventDetailPage: React.FC = () => {
  const router = useRouter();
  const [eventId, setEventId] = useState<string>('');

  useEffect(() => {
    console.log('[EventDetailPage] 页面加载');
    const id = router.params.id || '';
    setEventId(id);
    console.log('[EventDetailPage] 活动ID:', id);
  }, [router.params]);

  useDidShow(() => {
    console.log('[EventDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholder}>
        <View className={styles.placeholderIcon}>
          <Text>🏆</Text>
        </View>
        <Text className={styles.placeholderTitle}>活动详情页</Text>
        <Text className={styles.placeholderText}>
          此页面将展示赛事、考级、参观等活动的完整信息，包括活动介绍、报名流程、时间地点、报名情况等。
        </Text>
        {eventId && (
          <Text className={styles.idText}>活动ID：{eventId}</Text>
        )}
      </View>
    </View>
  );
};

export default EventDetailPage;
