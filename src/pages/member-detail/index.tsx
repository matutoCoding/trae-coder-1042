import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const MemberDetailPage: React.FC = () => {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string>('');

  useEffect(() => {
    console.log('[MemberDetailPage] 页面加载');
    const id = router.params.id || '';
    setMemberId(id);
    console.log('[MemberDetailPage] 会员ID:', id);
  }, [router.params]);

  useDidShow(() => {
    console.log('[MemberDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholder}>
        <View className={styles.placeholderIcon}>
          <Text>👤</Text>
        </View>
        <Text className={styles.placeholderTitle}>会员详情页</Text>
        <Text className={styles.placeholderText}>
          此页面将展示会员的完整信息，包括个人资料、会员卡信息、课时余额、消费记录、预约记录等。
        </Text>
        {memberId && (
          <Text className={styles.idText}>会员ID：{memberId}</Text>
        )}
      </View>
    </View>
  );
};

export default MemberDetailPage;
