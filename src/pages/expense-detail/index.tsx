import React, { useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useStore } from '@/store';
import { formatMoney, getStatusColor } from '@/utils';
import styles from './index.module.scss';

const ExpenseDetailPage: React.FC = () => {
  const router = useRouter();
  const { state, getExpenseById, getMemberById } = useStore();
  const [expense, setExpense] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const expenseId = router.params.id || '';

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh();
  });

  const loadData = () => {
    const exp = getExpenseById(expenseId);
    setExpense(exp || null);
    if (exp && exp.memberId) {
      const mem = getMemberById(exp.memberId);
      setMember(mem || null);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      '课时消费': '🏇',
      '装备租赁': '🎽',
      '餐饮消费': '☕',
      '赛事报名': '🏆',
      '会员充值': '💳',
      '其他消费': '💰',
    };
    return icons[type] || '💰';
  };

  if (!expense) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>消费记录不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.headerBanner}>
        <View className={styles.expenseType}>
          <Text className={styles.typeIcon}>{getTypeIcon(expense.type)}</Text>
          <Text className={styles.typeName}>{expense.type}</Text>
        </View>
        <View className={styles.amountRow}>
          <Text className={styles.amountLabel}>消费金额</Text>
          <Text className={styles.amountValue}>¥{formatMoney(expense.amount)}</Text>
        </View>
        <View className={styles.statusBadge} style={{ background: getStatusColor(expense.status) }}>
          {expense.status}
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardTitleText}>消费信息</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>订单编号</Text>
          <Text className={styles.infoValue}>{expense.id}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>消费项目</Text>
          <Text className={styles.infoValue}>{expense.item || expense.description || '-'}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>消费时间</Text>
          <Text className={styles.infoValue}>{expense.time}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>支付方式</Text>
          <Text className={styles.infoValue}>{expense.paymentMethod || '余额支付'}</Text>
        </View>
        {expense.quantity && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>数量</Text>
            <Text className={styles.infoValue}>{expense.quantity}</Text>
          </View>
        )}
        {expense.hours && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时长</Text>
            <Text className={styles.infoValue}>{expense.hours} 小时</Text>
          </View>
        )}
      </View>

      {member && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardTitleText}>关联会员</Text>
          </View>
          <View className={styles.memberInfo}>
            <View className={styles.memberAvatar}>
              <Text>{member.name?.charAt(0) || '会'}</Text>
            </View>
            <View className={styles.memberDetail}>
              <Text className={styles.memberName}>{member.name}</Text>
              <Text className={styles.memberMeta}>📱 {member.phone}</Text>
              <Text className={styles.memberMeta}>🏅 {member.memberLevel} | 剩余课时 {member.remainingHours} 节</Text>
            </View>
          </View>
        </View>
      )}

      {expense.remark && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardTitleText}>备注信息</Text>
          </View>
          <Text className={styles.remarkText}>{expense.remark}</Text>
        </View>
      )}
    </View>
  );
};

export default ExpenseDetailPage;
