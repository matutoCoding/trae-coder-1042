import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';

const ExpenseDetailPage: React.FC = () => {
  const router = useRouter();
  const [expenseId, setExpenseId] = useState<string>('');

  useEffect(() => {
    console.log('[ExpenseDetailPage] 页面加载');
    const id = router.params.id || '';
    setExpenseId(id);
    console.log('[ExpenseDetailPage] 消费记录ID:', id);
  }, [router.params]);

  useDidShow(() => {
    console.log('[ExpenseDetailPage] 页面显示');
  });

  return (
    <View className={styles.pageContainer}>
      <View className={styles.placeholder}>
        <View className={styles.placeholderIcon}>
          <Text>💰</Text>
        </View>
        <Text className={styles.placeholderTitle}>消费详情页</Text>
        <Text className={styles.placeholderText}>
          此页面将展示消费记录的完整信息，包括消费明细、支付信息、发票信息、关联会员等。
        </Text>
        {expenseId && (
          <Text className={styles.idText}>消费ID：{expenseId}</Text>
        )}
      </View>
    </View>
  );
};

export default ExpenseDetailPage;
