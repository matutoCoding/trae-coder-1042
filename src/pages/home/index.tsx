import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import HorseCard from '@/components/HorseCard';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/StatCard';
import QuickEntry from '@/components/QuickEntry';
import { horses, breeds } from '@/data/horses';
import type { Horse, QuickEntryItem, StatItem } from '@/types';

const quickEntries: QuickEntryItem[] = [
  { id: '1', name: '新增马匹', icon: '🐴', color: '#8B4513', path: '/pages/horse-detail/index' },
  { id: '2', name: '健康登记', icon: '🏥', color: '#2E8B57', path: '/pages/health-detail/index' },
  { id: '3', name: '钉蹄预约', icon: '🦶', color: '#DAA520', path: '/pages/health-detail/index' },
  { id: '4', name: '兽医诊疗', icon: '👨‍⚕️', color: '#1976D2', path: '/pages/health-detail/index' },
  { id: '5', name: '疫苗接种', icon: '💉', color: '#D32F2F', path: '/pages/health-detail/index' },
  { id: '6', name: '驱虫', icon: '💊', color: '#FF8C00', path: '/pages/health-detail/index' },
  { id: '7', name: '品种档案', icon: '📋', color: '#8D6E63', path: '' },
  { id: '8', name: '更多功能', icon: '⋯', color: '#86909C', path: '' },
];

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: '健康', label: '健康' },
  { key: '训练中', label: '训练中' },
  { key: '休息', label: '休息' },
  { key: '治疗中', label: '治疗中' },
];

const HomePage: React.FC = () => {
  const [horseList, setHorseList] = useState<Horse[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const today = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const stats: StatItem[] = [
    { label: '今日预约', value: '8', unit: '个', trend: 'up' },
    { label: '待处理', value: '3', unit: '项', trend: 'down' },
    { label: '课程排课', value: '12', unit: '节', trend: 'neutral' },
    { label: '本月收入', value: '5.8', unit: '万', trend: 'up' },
  ];

  const loadData = useCallback(() => {
    console.log('[HomePage] 加载数据');
    setHorseList(horses);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    console.log('[HomePage] 页面显示');
    loadData();
  });

  usePullDownRefresh(() => {
    console.log('[HomePage] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      Taro.stopPullDownRefresh().catch((err) => {
        console.error('[HomePage] 停止刷新失败:', err);
      });
    }, 1000);
  });

  const handleFilterClick = (key: string) => {
    console.log('[HomePage] 筛选:', key);
    setActiveFilter(key);
  };

  const getFilteredHorses = () => {
    if (activeFilter === 'all') return horseList;
    return horseList.filter(h => h.status === activeFilter);
  };

  const handleAddHorse = () => {
    console.log('[HomePage] 新增马匹');
    Taro.showToast({
      title: '功能开发中',
      icon: 'none',
    }).catch((err) => {
      console.error('[HomePage] Toast失败:', err);
    });
  };

  const filteredHorses = getFilteredHorses();

  const getHeaderStats = () => {
    const total = horseList.length;
    const healthy = horseList.filter(h => h.status === '健康').length;
    const training = horseList.filter(h => h.status === '训练中').length;
    const treating = horseList.filter(h => h.status === '治疗中').length;
    return { total, healthy, training, treating };
  };

  const headerStats = getHeaderStats();

  return (
    <View className={styles.pageContainer}>
      <View className={styles.header}>
        <View className={styles.headerTop}>
          <Text className={styles.clubName}>🐎 马术俱乐部</Text>
          <Text className={styles.headerDate}>{today}</Text>
        </View>
        <View className={styles.headerStats}>
          <View className={styles.headerStat}>
            <Text className={styles.statNumber}>{headerStats.total}</Text>
            <Text className={styles.statLabel}>马匹总数</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.statNumber}>{headerStats.healthy}</Text>
            <Text className={styles.statLabel}>健康</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.statNumber}>{headerStats.training}</Text>
            <Text className={styles.statLabel}>训练中</Text>
          </View>
          <View className={styles.headerStat}>
            <Text className={styles.statNumber}>{headerStats.treating}</Text>
            <Text className={styles.statLabel}>治疗中</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <ScrollView scrollX className={styles.statsRow} enableFlex>
          {stats.map((stat, index) => (
            <StatCard key={index} data={stat} />
          ))}
        </ScrollView>
      </View>

      <View className={styles.quickSection}>
        <SectionHeader title="快捷功能" />
        <QuickEntry data={quickEntries} columns={4} />
      </View>

      <View className={styles.section}>
        <SectionHeader title="马匹品种档案" extraText="查看全部" />
        <ScrollView scrollX className={styles.breedsScroll}>
          {breeds.map((breed, index) => (
            <View key={index} className={styles.breedCard}>
              <Text className={styles.breedName}>{breed.name}</Text>
              <Text className={styles.breedInfo}>{breed.origin}</Text>
              <View className={styles.breedCount}>
                <Text>{breed.count} 匹</Text>
              </View>
              <Text className={styles.breedDesc}>{breed.description}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.section}>
        <SectionHeader title="马匹列表" subtitle={`共 ${filteredHorses.length} 匹`} />
        <ScrollView scrollX className={styles.filterTabs}>
          {filterOptions.map((option) => (
            <View
              key={option.key}
              className={classNames(styles.filterTab, activeFilter === option.key && styles.filterTabActive)}
              onClick={() => handleFilterClick(option.key)}
            >
              <Text>{option.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View className={styles.listContainer}>
          {filteredHorses.length > 0 ? (
            filteredHorses.map((horse) => (
              <HorseCard key={horse.id} data={horse} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text>🐴</Text>
              <Text className={styles.emptyText}>暂无该状态的马匹</Text>
            </View>
          )}
        </View>
      </View>

      <Button className={styles.addBtn} onClick={handleAddHorse}>
        <Text>+</Text>
      </Button>
    </View>
  );
};

export default HomePage;
