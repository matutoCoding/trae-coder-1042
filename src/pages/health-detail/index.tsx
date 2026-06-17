import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const HealthDetailPage: React.FC = () => {
  const router = useRouter();
  const [recordId, setRecordId] = useState<string>('');

  useEffect(() => {
    console.log('[HealthDetailPage] 页面加载');
    const id = router.params.id || '';
    setRecordId(id);
    console.log('[HealthDetailPage] 健康记录ID:', id);
  }, [router.params]);

  useDidShow(() => {
    console.log('[HealthDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholder}>
        <View className={styles.placeholderIcon}>
          <Text>📋</Text>
        </View>
        <Text className={styles.placeholderTitle}>健康记录详情</Text>
        <Text className={styles.placeholderText}>
          此页面将展示完整的健康记录信息，包括钉蹄、兽医诊疗、体检、疫苗接种、驱虫等详细信息。
        </Text>
        {recordId && (
          <Text className={styles.idText}>记录ID：{recordId}</Text>
        )}
      </View>
    </View>
  );
};

export default HealthDetailPage;
