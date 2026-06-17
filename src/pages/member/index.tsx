import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Input, Picker } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import MemberCard from '@/components/MemberCard';
import EventCard from '@/components/EventCard';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/StatCard';
import { useStore } from '@/store';
import { memberCards } from '@/data/members';
import type { Member, MemberCard as MemberCardType, ExpenseRecord, Event, QuickEntryItem, StatItem } from '@/types';
import { formatMoney, getLevelColor, getStatusColor } from '@/utils';

const tabs = [
  { key: 'members', label: '会员管理' },
  { key: 'cards', label: '会员卡管理' },
  { key: 'expenses', label: '消费台账' },
  { key: 'events', label: '赛事活动' },
];

const quickEntries: QuickEntryItem[] = [
  { id: '1', name: '马术考级', icon: '📜', color: '#DAA520', path: '' },
  { id: '2', name: '赛事报名', icon: '🏆', color: '#8B4513', path: '' },
  { id: '3', name: '马场参观', icon: '👥', color: '#2E8B57', path: '' },
  { id: '4', name: '更多功能', icon: '⋯', color: '#86909C', path: '' },
];

const paymentOptions = ['余额支付', '微信支付', '支付宝', '现金', '银行卡'];

const MemberPage: React.FC = () => {
  const store = useStore();
  const { state } = store;
  const doRecharge = store.rechargeMember;
  const doDeduct = store.deductMemberHours;

  const [activeTab, setActiveTab] = useState('members');
  const [cardList, setCardList] = useState<MemberCardType[]>([]);

  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [rechargePayIdx, setRechargePayIdx] = useState(0);

  const [deductVisible, setDeductVisible] = useState(false);
  const [deductMember, setDeductMember] = useState<Member | null>(null);
  const [deductHours, setDeductHours] = useState('');
  const [deductDesc, setDeductDesc] = useState('');

  const expenseList = state.expenseRecords;
  const eventList = state.events;
  const memberList = state.members;

  const stats: StatItem[] = [
    { label: '会员总数', value: String(memberList.length), unit: '人' },
    { label: '今日消费', value: '3,280', unit: '元' },
    { label: '本月收入', value: '56,800', unit: '元' },
  ];

  const loadData = useCallback(() => {
    setCardList(memberCards);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    setTimeout(() => {
      loadData();
      Taro.stopPullDownRefresh().catch(console.error);
    }, 800);
  });

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const handleQuickEntry = (item: QuickEntryItem) => {
    if (item.name === '马术考级' || item.name === '赛事报名' || item.name === '马场参观') {
      setActiveTab('events');
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' }).catch(console.error);
    }
  };

  const handleExpenseClick = (record: ExpenseRecord) => {
    Taro.navigateTo({ url: `/pages/expense-detail/index?id=${record.id}` }).catch(console.error);
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

  const quickColors: Record<string, string> = {
    '1': '#DAA520',
    '2': '#8B4513',
    '3': '#2E8B57',
    '4': '#86909C',
  };

  const openRecharge = (member: Member, e: any) => {
    e.stopPropagation?.();
    setSelectedMember(member);
    setRechargeAmount('');
    setRechargePayIdx(0);
    setRechargeVisible(true);
  };

  const submitRecharge = () => {
    if (!selectedMember) return;
    const amount = Number(rechargeAmount);
    if (!amount || amount <= 0) {
      Taro.showToast({ title: '请输入有效金额', icon: 'none' }).catch(console.error);
      return;
    }
    const res = doRecharge(selectedMember.id, amount, paymentOptions[rechargePayIdx] as any);
    if (res.success) {
      Taro.showToast({ title: res.message, icon: 'success' }).catch(console.error);
      setRechargeVisible(false);
    } else {
      Taro.showToast({ title: res.message, icon: 'none' }).catch(console.error);
    }
  };

  const openDeduct = (member: Member, e: any) => {
    e.stopPropagation?.();
    setDeductMember(member);
    setDeductHours('');
    setDeductDesc('');
    setDeductVisible(true);
  };

  const submitDeduct = () => {
    if (!deductMember) return;
    const hours = Number(deductHours);
    if (!hours || hours <= 0) {
      Taro.showToast({ title: '请输入有效课时数', icon: 'none' }).catch(console.error);
      return;
    }
    if (hours > deductMember.remainingHours) {
      Taro.showToast({
        title: `课时不足，该会员仅剩 ${deductMember.remainingHours} 节`,
        icon: 'none',
        duration: 2000,
      }).catch(console.error);
      return;
    }
    const desc = deductDesc.trim() || '课程消耗';
    const res = doDeduct(deductMember.id, hours, desc);
    if (res.success) {
      Taro.showToast({ title: res.message, icon: 'success' }).catch(console.error);
      setDeductVisible(false);
    } else {
      Taro.showToast({ title: res.message, icon: 'none' }).catch(console.error);
    }
  };

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <Text className={styles.welcomeText}>🐎 会员中心</Text>
        <Text className={styles.subText}>高效管理会员，提升服务质量</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{memberList.length}</Text>
            <Text className={styles.statLabel}>会员总数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>3</Text>
            <Text className={styles.statLabel}>今日新增</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>¥5.6万</Text>
            <Text className={styles.statLabel}>本月收入</Text>
          </View>
        </View>
      </View>

      <View style={{ display: 'flex', gap: '24rpx', marginBottom: '32rpx' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </View>

      <View className={styles.quickGrid}>
        {quickEntries.map((item) => (
          <View
            key={item.id}
            className={styles.quickItem}
            onClick={() => handleQuickEntry(item)}
          >
            <View
              className={styles.quickIcon}
              style={{ backgroundColor: quickColors[item.id] + '20', color: quickColors[item.id] }}
            >
              <Text>{item.icon}</Text>
            </View>
            <Text className={styles.quickName}>{item.name}</Text>
          </View>
        ))}
      </View>

      <View className={styles.tabs}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classNames(styles.tabItem, activeTab === tab.key && styles.tabItemActive)}
            onClick={() => handleTabClick(tab.key)}
          >
            <Text>{tab.label}</Text>
          </View>
        ))}
      </View>

      {activeTab === 'members' && (
        <View className={styles.section}>
          <SectionHeader title="会员列表" subtitle={`共 ${memberList.length} 位会员`} />
          <View className={styles.listContainer}>
            {memberList.map((member) => (
              <View key={member.id}>
                <MemberCard data={member} />
                <View className={styles.memberActions}>
                  <View
                    className={classNames(styles.actionBtn, styles.actionBtnPrimary)}
                    onClick={(e) => openRecharge(member, e)}
                  >
                    <Text>💳 充值</Text>
                  </View>
                  <View
                    className={classNames(styles.actionBtn, styles.actionBtnSecondary)}
                    onClick={(e) => openDeduct(member, e)}
                  >
                    <Text>⏱️ 扣课时</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'cards' && (
        <View className={styles.section}>
          <SectionHeader title="会员卡管理" subtitle={`共 ${cardList.length} 张卡`} />
          <View className={styles.listContainer}>
            {cardList.map((card) => (
              <View
                key={card.id}
                className={styles.memberCard}
                onClick={() => {
                  Taro.showToast({ title: '会员卡详情开发中', icon: 'none' }).catch(console.error);
                }}
              >
                <View className={styles.memberInfo}>
                  <View className={styles.memberNameRow}>
                    <Text className={styles.memberName}>{card.memberName}</Text>
                    <View
                      className={styles.levelTag}
                      style={{ backgroundColor: getLevelColor(card.type) + '30', color: getLevelColor(card.type) }}
                    >
                      <Text>{card.type}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: '24rpx', color: '#8D6E63', marginBottom: '8rpx' }}>
                    有效期：{card.purchaseDate} ~ {card.expiryDate}
                  </Text>
                  <View className={styles.memberHours}>
                    <View className={styles.hourItem}>
                      <Text className={styles.hourValue}>{card.totalHours}</Text>
                      <Text className={styles.hourLabel}>总课时</Text>
                    </View>
                    <View className={styles.hourItem}>
                      <Text className={styles.hourValue}>{card.remainingHours}</Text>
                      <Text className={styles.hourLabel}>剩余课时</Text>
                    </View>
                    <View className={styles.hourItem}>
                      <Text className={styles.hourValue}>{formatMoney(card.price)}</Text>
                      <Text className={styles.hourLabel}>购卡金额</Text>
                    </View>
                  </View>
                </View>
                <View
                  className={styles.statusTag}
                  style={{ backgroundColor: getStatusColor(card.status) + '20', color: getStatusColor(card.status) }}
                >
                  <Text>{card.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'expenses' && (
        <View className={styles.section}>
          <SectionHeader
            title="消费台账"
            subtitle={`${expenseList.length} 条记录`}
            extraText="导出"
            onExtraClick={() => {
              Taro.showToast({ title: '导出功能开发中', icon: 'none' }).catch(console.error);
            }}
          />
          <View className={styles.listContainer}>
            {expenseList.map((record) => (
              <View
                key={record.id}
                className={styles.expenseCard}
                onClick={() => handleExpenseClick(record)}
              >
                <View className={styles.expenseHeader}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                    <View
                      style={{
                        padding: '4rpx 12rpx',
                        backgroundColor: getExpenseTypeColor(record.type) + '20',
                        color: getExpenseTypeColor(record.type),
                        borderRadius: '8rpx',
                        fontSize: '22rpx',
                      }}
                    >
                      <Text>{record.type}</Text>
                    </View>
                    <Text className={styles.expenseAmount}>
                      {record.type === '赛事退款' ? '-' : ''}{formatMoney(record.amount)}
                    </Text>
                  </View>
                </View>
                <Text className={styles.expenseDesc}>{record.description}</Text>
                <Text style={{ fontSize: '24rpx', color: '#5D4037', marginBottom: '12rpx' }}>
                  会员：{record.memberName}
                </Text>
                <View className={styles.expenseFooter}>
                  <Text className={styles.expenseDate}>
                    {record.time ? `${record.date.split(' ')[0]} ${record.time}` : record.date}
                  </Text>
                  <View className={styles.paymentMethod}>
                    <Text>{record.paymentMethod}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'events' && (
        <View className={styles.eventSection}>
          <SectionHeader title="赛事活动" subtitle={`${eventList.length} 个活动`} />
          <View className={styles.listContainer}>
            {eventList.map((event) => (
              <EventCard key={event.id} data={event} />
            ))}
          </View>
        </View>
      )}

      {rechargeVisible && selectedMember && (
        <View className={styles.modalMask} onClick={() => setRechargeVisible(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation?.()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>会员充值</Text>
              <Text className={styles.modalClose} onClick={() => setRechargeVisible(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.modalMemberRow}>
                <View className={styles.modalMemberAvatar}>
                  <Text>{selectedMember.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.modalMemberName}>{selectedMember.name}</Text>
                  <Text className={styles.modalMemberMeta}>
                    {selectedMember.memberLevel} · 剩余课时 {selectedMember.remainingHours} 节
                  </Text>
                </View>
              </View>

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

              <View className={styles.formHint}>
                <Text>充值后将在消费台账生成"会员充值"记录，累计消费同步增加</Text>
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

      {deductVisible && deductMember && (
        <View className={styles.modalMask} onClick={() => setDeductVisible(false)}>
          <View className={styles.modal} onClick={(e) => e.stopPropagation?.()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>课时扣减</Text>
              <Text className={styles.modalClose} onClick={() => setDeductVisible(false)}>✕</Text>
            </View>
            <View className={styles.modalBody}>
              <View className={styles.modalMemberRow}>
                <View className={styles.modalMemberAvatar}>
                  <Text>{deductMember.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.modalMemberName}>{deductMember.name}</Text>
                  <Text className={styles.modalMemberMeta}>
                    剩余课时 {deductMember.remainingHours} 节
                  </Text>
                </View>
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

              <View className={styles.formHint}>
                <Text>课时不足时将直接拦截，扣减后剩余课时同步减少并在消费台账生成记录</Text>
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

export default MemberPage;
