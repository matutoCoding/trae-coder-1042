import React, { useState, useEffect, useCallback } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import QuickEntry from '@/components/QuickEntry';
import StatCard from '@/components/StatCard';
import { stables, feedingRecords, equipmentList, cleanRecords } from '@/data/stables';
import type { Stable, FeedingRecord, Equipment, QuickEntryItem, StatItem } from '@/types';

const tabs = [
  { key: 'stable', label: '马房管理' },
  { key: 'feeding', label: '饲料投喂' },
  { key: 'equipment', label: '装备租赁' },
];

const quickEntries: QuickEntryItem[] = [
  { id: '1', name: '卫生清扫', icon: '🧹', color: '#2E8B57', path: '' },
  { id: '2', name: '饲料投喂', icon: '🥕', color: '#FF8C00', path: '' },
  { id: '3', name: '装备租赁', icon: '🎽', color: '#1976D2', path: '' },
  { id: '4', name: '马房维修', icon: '🔧', color: '#D32F2F', path: '' },
];

const equipmentIcons: Record<string, string> = {
  '马鞍': '🐴',
  '缰绳': '🎗️',
  '头盔': '⛑️',
  '护具': '🦵',
  '马靴': '👢',
  '其他': '📦',
};

const StablePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('stable');
  const [stableList, setStableList] = useState<Stable[]>([]);
  const [feedingList, setFeedingList] = useState<FeedingRecord[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats: StatItem[] = [
    { label: '马房总数', value: '12', unit: '间' },
    { label: '已占用', value: '10', unit: '间' },
    { label: '今日投喂', value: '28', unit: '次' },
  ];

  const loadData = useCallback(() => {
    console.log('[StablePage] 加载数据');
    setStableList(stables);
    setFeedingList(feedingRecords);
    setEquipment(equipmentList);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    console.log('[StablePage] 页面显示');
    loadData();
  });

  usePullDownRefresh(() => {
    console.log('[StablePage] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      Taro.stopPullDownRefresh().catch((err) => {
        console.error('[StablePage] 停止刷新失败:', err);
      });
    }, 1000);
  });

  const handleTabClick = (key: string) => {
    console.log('[StablePage] 切换标签:', key);
    setActiveTab(key);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case '已占用':
        return styles.statusOccupied;
      case '空置':
        return styles.statusEmpty;
      case '维修中':
        return styles.statusRepair;
      default:
        return '';
    }
  };

  const handleStableClick = (stable: Stable) => {
    console.log('[StablePage] 点击马房:', stable.stableNo);
    Taro.showActionSheet({
      itemList: ['查看详情', '登记清扫', '记录投喂', '维修申请'],
    }).then((res) => {
      const actions = ['查看详情', '登记清扫', '记录投喂', '维修申请'];
      Taro.showToast({
        title: `${actions[res.tapIndex]}功能开发中`,
        icon: 'none',
      }).catch(console.error);
    }).catch((err) => {
      if (err.errMsg !== 'showActionSheet:fail cancel') {
        console.error('[StablePage] ActionSheet失败:', err);
      }
    });
  };

  const handleEquipmentClick = (item: Equipment) => {
    console.log('[StablePage] 点击装备:', item.name);
    Taro.showModal({
      title: item.name,
      content: `品牌：${item.brand}\n尺寸：${item.size}\n可租赁：${item.availableQuantity}件\n租金：${item.pricePerHour}元/小时`,
      confirmText: '立即租赁',
      cancelText: '取消',
    }).then((res) => {
      if (res.confirm) {
        Taro.showToast({ title: '租赁成功', icon: 'success' }).catch(console.error);
      }
    }).catch((err) => {
      console.error('[StablePage] Modal失败:', err);
    });
  };

  return (
    <View className={styles.pageContainer}>
      <View style={{ display: 'flex', gap: '24rpx', marginBottom: '32rpx' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </View>

      <View className={styles.quickSection}>
        <QuickEntry data={quickEntries} columns={4} />
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

      {activeTab === 'stable' && (
        <View className={styles.section}>
          <SectionHeader title="马房状态" subtitle={`共 ${stableList.length} 间`} />
          <View className={styles.stableGrid}>
            {stableList.map((stable) => (
              <View
                key={stable.id}
                className={styles.stableCard}
                onClick={() => handleStableClick(stable)}
              >
                <View className={styles.stableHeader}>
                  <Text className={styles.stableNo}>{stable.stableNo}</Text>
                  <View className={classNames(styles.statusTag, getStatusClass(stable.status))}>
                    <Text>{stable.status}</Text>
                  </View>
                </View>
                {stable.horseName && (
                  <Text className={styles.horseName}>{stable.horseName}</Text>
                )}
                <Text className={styles.stableInfo}>垫料：{stable.beddingType}</Text>
                <View className={styles.stableFooter}>
                  <Text className={styles.cleanDate}>上次清扫：{stable.lastCleanDate}</Text>
                  <Text className={styles.size}>{stable.size}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: '48rpx' }}>
            <SectionHeader title="今日清扫记录" extraText="查看全部" />
            {cleanRecords.slice(0, 3).map((record) => (
              <View key={record.id} className={styles.feedingCard}>
                <View className={styles.feedingHeader}>
                  <Text className={styles.feedingHorse}>马房 {record.stableNo}</Text>
                  <Text className={styles.feedingTime}>{record.time}</Text>
                </View>
                <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8rpx', marginBottom: '16rpx' }}>
                  {record.items.map((item, i) => (
                    <View key={i} style={{
                      padding: '4rpx 12rpx',
                      background: 'rgba(46, 139, 87, 0.1)',
                      borderRadius: '8rpx',
                      fontSize: '22rpx',
                      color: '#2E8B57',
                    }}>
                      <Text>{item}</Text>
                    </View>
                  ))}
                </View>
                <Text className={styles.feedingOperator}>清洁人员：{record.operator}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'feeding' && (
        <View className={styles.section}>
          <SectionHeader title="今日投喂记录" subtitle={`${feedingList.length} 条记录`} />
          <View className={styles.feedingList}>
            {feedingList.map((record) => (
              <View key={record.id} className={styles.feedingCard}>
                <View className={styles.feedingHeader}>
                  <Text className={styles.feedingHorse}>{record.horseName}</Text>
                  <Text className={styles.feedingTime}>{record.time}</Text>
                </View>
                <View className={styles.feedingContent}>
                  <Text className={styles.feedType}>{record.feedType}</Text>
                  <Text className={styles.feedQuantity}>{record.quantity} kg</Text>
                </View>
                <Text className={styles.feedingOperator}>饲养员：{record.operator}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'equipment' && (
        <View className={styles.section}>
          <SectionHeader title="可租赁装备" subtitle={`${equipment.length} 种装备`} />
          <View className={styles.equipmentList}>
            {equipment.map((item) => (
              <View
                key={item.id}
                className={styles.equipmentCard}
                onClick={() => handleEquipmentClick(item)}
              >
                <View className={styles.equipmentIcon}>
                  <Text>{equipmentIcons[item.type] || '📦'}</Text>
                </View>
                <View className={styles.equipmentInfo}>
                  <Text className={styles.equipmentName}>{item.name}</Text>
                  <Text className={styles.equipmentMeta}>{item.brand} · {item.size}</Text>
                  <View className={styles.equipmentStock}>
                    <Text className={styles.stockText}>库存：{item.availableQuantity}/{item.quantity}</Text>
                  </View>
                </View>
                <Text className={styles.price}>¥{item.pricePerHour}/时</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default StablePage;
