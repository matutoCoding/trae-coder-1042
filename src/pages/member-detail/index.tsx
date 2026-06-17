import React, { useState } from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import Taro, { useRouter, useDidShow, usePullDownRefresh } from '@tarojs/taro';
import { useStore } from '@/store';
import { formatMoney, getLevelColor, getStatusColor } from '@/utils';
import styles from './index.module.scss';

const paymentOptions = ['余额支付', '微信支付', '支付宝', '现金', '银行卡'];

const MemberDetailPage: React.FC = () => {
  const router = useRouter();
  const store = useStore();
  const { state } = store;
  const memberId = router.params.id || '';

  const [member, setMember] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);

  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargePayIdx, setRechargePayIdx] = useState(0);

  const [deductVisible, setDeductVisible] = useState(false);
  const [deductHours, setDeductHours] = useState('');
  const [deductDesc, setDeductDesc] = useState('');

  const loadData = () => {
    const mem = store.getMemberById(memberId);
    setMember(mem || null);
    const memberExpenses = state.expenseRecords.filter(
      (r) => r.memberId === memberId
    );
    setExpenses(memberExpenses.slice(0, 10));
  };

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    loadData();
    Taro.stopPullDownRefresh().catch(console.error);
  });

  const handleExpenseClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/expense-detail/index?id=${id}` }).catch(console.error);
  };

  const submitRecharge = () => {
    if (!member) return;
    const amount = Number(rechargeAmount);
    if (!amount || amount <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' }).catch(console.error);
      return;
    }
    const res = store.rechargeMember(member.id, amount, paymentOptions[rechargePayIdx] as any);
    if (res.success) {
      Taro.showToast({ title: res.message, icon: 'success' }).catch(console.error);
      setRechargeVisible(false);
      setTimeout(() => loadData(), 300);
    } else {
      Taro.showToast({ title: res.message, icon: 'none' }).catch(console.error);
    }
  };

  const submitDeduct = () => {
    if (!member) return;
    const hours = Number(deductHours);
    if (!hours || hours <= 0) {
      Taro.showToast({ title: '请输入有效课时数', icon: 'none' }).catch(console.error);
      return;
    }
    if (hours > member.remainingHours) {
      Taro.showToast({
        title: `课时不足，该会员仅剩 ${member.remainingHours} 节`,
        icon: 'none',
        duration: 2000,
      }).catch(console.error);
      return;
    }
    const desc = deductDesc.trim() || '课程消耗';
    const res = store.deductMemberHours(member.id, hours, desc);
    if (res.success) {
      Taro.showToast({ title: res.message, icon: 'success' }).catch(console.error);
      setDeductVisible(false);
      setTimeout(() => loadData(), 300);
    } else {
      Taro.showToast({ title: res.message, icon: 'none' }).catch(console.error);
    }
  };

  const getExpenseTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      课程消费: '#8B4513',
      装备租赁: '#2E8B57',
      赛事报名: '#DAA520',
      赛事退款: '#D32F2F',
      会员充值: '#1976D2',
      课时扣减: '#7B1FA2',
      商品购买: '#1976D2',
      其他: '#86909C',
    };
    return colorMap[type] || '#86909C';
  };

  if (!member) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>👤</Text>
          <Text className={styles.emptyText}>会员信息不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.avatarWrap}>
          <Text className={styles.avatarText}>{member.name.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View className={styles.nameRow}>
            <Text className={styles.memberName}>{member.name}</Text>
            <View
              className={styles.levelTag}
              style={{ backgroundColor: getLevelColor(member.memberLevel) + '30', color: getLevelColor(member.memberLevel) }}
            >
              <Text>{member.memberLevel}</Text>
            </View>
          </View>
          <Text className={styles.phoneText}>📱 {member.phone}</Text>
        </View>
        <View
          className={styles.statusTag}
          style={{ backgroundColor: getStatusColor(member.status) + '20', color: getStatusColor(member.status) }}
        >
          <Text>{member.status}</Text>
        </View>
      </View>

      <View className={styles.statGrid}>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>¥{member.totalSpent.toLocaleString('zh-CN')}</Text>
          <Text className={styles.statLabel}>累计消费</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{member.remainingHours}</Text>
          <Text className={styles.statLabel}>剩余课时</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statValue}>{member.totalHours}</Text>
          <Text className={styles.statLabel}>总课时</Text>
        </View>
      </View>

      <View className={styles.actionRow}>
        <View className={styles.actionBtnPrimary} onClick={() => { setRechargeAmount(''); setRechargePayIdx(0); setRechargeVisible(true); }}>
          <Text>💳 充值</Text>
        </View>
        <View className={styles.actionBtnSecondary} onClick={() => { setDeductHours(''); setDeductDesc(''); setDeductVisible(true); }}>
          <Text>⏱️ 扣课时</Text>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardTitleText}>会员信息</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>手机号</Text>
          <Text className={styles.infoValue}>{member.phone}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>会员等级</Text>
          <Text className={styles.infoValue}>{member.memberLevel}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>入会日期</Text>
          <Text className={styles.infoValue}>{member.joinDate}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel">有效期至</Text>
          <Text className={styles.infoValue}>{member.expiryDate}</Text>
        </View>
        {member.address && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>地址</Text>
            <Text className={styles.infoValue}>{member.address}</Text>
          </View>
        )}
        {member.emergencyContact && (
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>紧急联系人</Text>
            <Text className={styles.infoValue}>{member.emergencyContact} {member.emergencyPhone}</Text>
          </View>
        )}
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>
          <Text className={styles.cardTitleText}>最近消费</Text>
          <Text className={styles.cardTitleSub}>{expenses.length} 条</Text>
        </View>
        {expenses.length === 0 && (
          <View className={styles.emptyBox}>
            <Text className={styles.emptyBoxText}>暂无消费记录</Text>
          </View>
        )}
        {expenses.map((record) => (
          <View
            key={record.id}
            className={styles.expenseItem}
            onClick={() => handleExpenseClick(record.id)}
          >
            <View className={styles.expenseLeft}>
              <View
                className={styles.expenseTypeTag}
                style={{ backgroundColor: getExpenseTypeColor(record.type) + '20', color: getExpenseTypeColor(record.type) }}
              >
                <Text>{record.type}</Text>
              </View>
              <Text className={styles.expenseDesc}>{record.description}</Text>
            </View>
            <View className={styles.expenseRight}>
              <Text className={styles.expenseAmount} style={{ color: record.type === '赛事退款' ? '#D32F2F' : '#2E8B57' }}>
                {record.type === '赛事退款' ? '-' : record.type === '会员充值' ? '+' : ''}¥{record.amount.toLocaleString('zh-CN')}
              </Text>
              <Text className={styles.expenseTime}>
                {record.time ? `${record.date.split(' ')[0]} ${record.time}` : record.date}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {rechargeVisible && (
        <View className={styles.modalMask} onClick={() => setRechargeVisible(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation?.()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>会员充值</Text>
              <Text className={styles.modalClose} onClick={() => setRechargeVisible(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>充值金额（元）</Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  placeholder="请输入充值金额"
                  value={rechargeAmount}
                  onInput={(e) => setRechargeAmount(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>支付方式</Text>
                <Picker
                  range={paymentOptions}
                  value={rechargePayIdx}
                  onChange={(e) => setRechargePayIdx(Number(e.detail.value))}
                >
                  <View className={styles.formPicker}>
                    <Text>{paymentOptions[rechargePayIdx]}</Text>
                    <Text className={styles.pickerArrow}>›</Text>
                  </View>
                </Picker>
              </View>
            </View>
            <View className={styles.modalFooter}>
              <View className={styles.modalBtnCancel} onClick={() => setRechargeVisible(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.modalBtnPrimary} onClick={submitRecharge}>
                <Text>确认充值</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {deductVisible && (
        <View className={styles.modalMask} onClick={() => setDeductVisible(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation?.()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>课时扣减</Text>
              <Text className={styles.modalClose} onClick={() => setDeductVisible(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.deductInfo}>
                <Text className={styles.deductInfoText}>当前剩余课时：{member.remainingHours} 节</Text>
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>扣减课时（节）</Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  placeholder="请输入扣减课时数量"
                  value={deductHours}
                  onInput={(e) => setDeductHours(e.detail.value)}
                />
              </View>
              <View className={styles.formItem}>
                <Text className={styles.formLabel}>扣减描述</Text>
                <Input
                  className={styles.formInput}
                  placeholder="例如：初级骑乘课"
                  value={deductDesc}
                  onInput={(e) => setDeductDesc(e.detail.value)}
                />
              </View>
            </View>
            <View className={styles.modalFooter}>
              <View className={styles.modalBtnCancel} onClick={() => setDeductVisible(false)}>
                <Text>取消</Text>
              </View>
              <View className={styles.modalBtnPrimary} onClick={submitDeduct}>
                <Text>确认扣减</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default MemberDetailPage;
