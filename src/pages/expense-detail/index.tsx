import React, { useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useRouter, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useStore } from '@/store';
import { formatMoney, getStatusColor } from '@/utils';
import styles from './index.module.scss';

const ExpenseDetailPage: React.FC = () => {
  const router = useRouter();
  const { state, getExpenseById, getMemberById, getEquipmentById, getEventById, getRentalById } = useStore();
  const expenseId = router.params.id || '';
  const [expense, setExpense] = useState<any>(null);
  const [member, setMember] = useState<any>(null);
  const [relatedEquipment, setRelatedEquipment] = useState<any>(null);
  const [relatedEvent, setRelatedEvent] = useState<any>(null);
  const [relatedRental, setRelatedRental] = useState<any>(null);

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh().catch(console.error);
  });

  const loadData = () => {
    const exp = getExpenseById(expenseId);
    setExpense(exp || null);
    setMember(null);
    setRelatedEquipment(null);
    setRelatedEvent(null);
    setRelatedRental(null);
    if (exp) {
      if (exp.memberId) {
        const mem = getMemberById(exp.memberId);
        setMember(mem || null);
      }
      if (exp.type === '装备租赁' && exp.relatedId) {
        const eq = getEquipmentById(exp.relatedId);
        setRelatedEquipment(eq || null);
        if (exp.quantity && exp.hours) {
          const rental = state.rentals.find(
            (r) =>
              r.equipmentId === exp.relatedId &&
              r.memberId === exp.memberId &&
              r.totalAmount === exp.amount
          );
          setRelatedRental(rental || null);
        }
      }
      if ((exp.type === '赛事报名' || exp.type === '赛事退款') && exp.relatedId) {
        const ev = getEventById(exp.relatedId);
        setRelatedEvent(ev || null);
      }
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      课程消费: '🏇',
      装备租赁: '🎽',
      餐饮消费: '☕',
      赛事报名: '🏆',
      赛事退款: '↩️',
      会员充值: '💳',
      课时扣减: '⏱️',
      商品购买: '🛒',
      其他消费: '💰',
      其他: '💰',
    };
    return icons[type] || '💰';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      课程消费: '#8B4513',
      装备租赁: '#2E8B57',
      餐饮消费: '#FF8C00',
      赛事报名: '#DAA520',
      赛事退款: '#D32F2F',
      会员充值: '#1976D2',
      课时扣减: '#7B1FA2',
      商品购买: '#388E3C',
      其他: '#86909C',
    };
    return colors[type] || '#86909C';
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

  const displayTime = expense.time
    ? `${expense.date} ${expense.time}`
    : expense.date;

  return (
    <View className={styles.pageContainer}>
      <View
        className={styles.headerBanner}
        style={{
          background: `linear-gradient(135deg, ${getTypeColor(expense.type)} 0%, ${getTypeColor(
            expense.type
          )}CC 100%)`,
        }}
      >
        <View className={styles.expenseType}>
          <Text className={styles.typeIcon}>{getTypeIcon(expense.type)}</Text>
          <Text className={styles.typeName}>{expense.type}</Text>
        </View>
        <View className={styles.amountRow}>
          <Text className={styles.amountLabel}>
            {expense.type === '赛事退款' ? '退款金额' : expense.type === '会员充值' ? '充值金额' : '消费金额'}
          </Text>
          <Text className={styles.amountValue}>
            {expense.type === '赛事退款' ? '-' : ''}¥{formatMoney(expense.amount)}
          </Text>
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
          <Text className={styles.infoValue}>{displayTime}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>支付方式</Text>
          <Text className={styles.infoValue}>{expense.paymentMethod || '余额支付'}</Text>
        </View>
        {expense.quantity && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>数量</Text>
            <Text className={styles.infoValue}>{expense.quantity} 件</Text>
          </View>
        )}
        {expense.hours && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时长</Text>
            <Text className={styles.infoValue}>{expense.hours} 小时</Text>
          </View>
        )}
      </View>

      {relatedEquipment && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardTitleText}>关联装备</Text>
          </View>
          <View className={styles.relatedRow}>
            <View className={styles.relatedIcon}>
              <Text>🎽</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text className={styles.relatedName}>{relatedEquipment.name}</Text>
              <Text className={styles.relatedMeta}>
                {relatedEquipment.brand} · {relatedEquipment.size} · ¥{relatedEquipment.pricePerHour}/时
              </Text>
            </View>
          </View>
          {relatedRental && (
            <View style={{ marginTop: '16rpx' }}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>租赁状态</Text>
                <Text className={styles.infoValue}>{relatedRental.status}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>租赁时间</Text>
                <Text className={styles.infoValue}>{relatedRental.rentTime}</Text>
              </View>
              {relatedRental.returnTime && (
                <View className={styles.infoRow}>
                  <Text className={styles.infoLabel}>归还时间</Text>
                  <Text className={styles.infoValue}>{relatedRental.returnTime}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {relatedEvent && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardTitleText}>关联活动</Text>
          </View>
          <View className={styles.relatedRow}>
            <View className={styles.relatedIcon}>
              <Text>🏆</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text className={styles.relatedName}>{relatedEvent.name}</Text>
              <Text className={styles.relatedMeta}>
                {relatedEvent.type} · {relatedEvent.date} · {relatedEvent.location}
              </Text>
            </View>
          </View>
        </View>
      )}

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
              <Text className={styles.memberMeta}>
                🏅 {member.memberLevel} | 剩余课时 {member.remainingHours} 节
              </Text>
              <Text className={styles.memberMeta}>💰 累计消费 ¥{formatMoney(member.totalSpent)}</Text>
            </View>
          </View>
        </View>
      )}

      {(expense.remark || expense.description) && (
        <View className={styles.card}>
          <View className={styles.cardTitle}>
            <Text className={styles.cardTitleText}>备注信息</Text>
          </View>
          {expense.remark && <Text className={styles.remarkText}>{expense.remark}</Text>}
          {!expense.remark && expense.description && (
            <Text className={styles.remarkText}>{expense.description}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default ExpenseDetailPage;
