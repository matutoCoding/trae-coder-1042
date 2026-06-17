import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import MemberCard from '@/components/MemberCard';
import EventCard from '@/components/EventCard';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/StatCard';
import { members, memberCards, expenseRecords } from '@/data/members';
import { events } from '@/data/events';
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

const MemberPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [cardList, setCardList] = useState<MemberCardType[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseRecord[]>([]);
  const [eventList, setEventList] = useState<Event[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats: StatItem[] = [
    { label: '会员总数', value: '8', unit: '人' },
    { label: '今日消费', value: '3,280', unit: '元' },
    { label: '本月收入', value: '56,800', unit: '元' },
  ];

  const loadData = useCallback(() => {
    console.log('[MemberPage] 加载数据');
    setMemberList(members);
    setCardList(memberCards);
    setExpenseList(expenseRecords);
    setEventList(events);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    console.log('[MemberPage] 页面显示');
    loadData();
  });

  usePullDownRefresh(() => {
    console.log('[MemberPage] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      Taro.stopPullDownRefresh().catch((err) => {
        console.error('[MemberPage] 停止刷新失败:', err);
      });
    }, 1000);
  });

  const handleTabClick = (key: string) => {
    console.log('[MemberPage] 切换标签:', key);
    setActiveTab(key);
  };

  const handleQuickEntry = (item: QuickEntryItem) => {
    console.log('[MemberPage] 点击快捷入口:', item.name);
    if (item.name === '马术考级') {
      setActiveTab('events');
    } else if (item.name === '赛事报名') {
      setActiveTab('events');
    } else if (item.name === '马场参观') {
      setActiveTab('events');
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' }).catch(console.error);
    }
  };

  const handleExpenseClick = (record: ExpenseRecord) => {
    console.log('[MemberPage] 点击消费记录:', record.id);
    Taro.navigateTo({ url: `/pages/expense-detail/index?id=${record.id}` }).catch((err) => {
      console.error('[MemberPage] 跳转失败:', err);
    });
  };

  const getExpenseTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      '课程消费': '#8B4513',
      '装备租赁': '#2E8B57',
      '赛事报名': '#DAA520',
      '商品购买': '#1976D2',
      '其他': '#86909C',
    };
    return colorMap[type] || '#86909C';
  };

  const quickColors: Record<string, string> = {
    '1': '#DAA520',
    '2': '#8B4513',
    '3': '#2E8B57',
    '4': '#86909C',
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
              <MemberCard key={member.id} data={member} />
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
                    <Text className={styles.expenseAmount}>{formatMoney(record.amount)}</Text>
                  </View>
                </View>
                <Text className={styles.expenseDesc}>{record.description}</Text>
                <Text style={{ fontSize: '24rpx', color: '#5D4037', marginBottom: '12rpx' }}>
                  会员：{record.memberName}
                </Text>
                <View className={styles.expenseFooter}>
                  <Text className={styles.expenseDate}>{record.date}</Text>
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
    </View>
  );
};

export default MemberPage;
