import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const CourseDetailPage: React.FC = () => {
  const router = useRouter();
  const [courseId, setCourseId] = useState<string>('');

  useEffect(() => {
    console.log('[CourseDetailPage] 页面加载');
    const id = router.params.id || '';
    setCourseId(id);
    console.log('[CourseDetailPage] 课程ID:', id);
  }, [router.params]);

  useDidShow(() => {
    console.log('[CourseDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholder}>
        <View className={styles.placeholderIcon}>
          <Text>📅</Text>
        </View>
        <Text className={styles.placeholderTitle}>课程详情页</Text>
        <Text className={styles.placeholderText}>
          此页面将展示课程的完整信息，包括课程介绍、教练信息、排课时间、学员报名情况等。
        </Text>
        {courseId && (
          <Text className={styles.idText}>课程ID：{courseId}</Text>
        )}
      </View>
    </View>
  );
};

export default CourseDetailPage;
