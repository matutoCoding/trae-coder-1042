import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import HealthCard from '@/components/HealthCard';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/StatCard';
import { healthRecords } from '@/data/health';
import type { HealthRecord, StatItem } from '@/types';

const typeOptions = [
  { key: 'all', label: '全部', icon: '📋' },
  { key: '钉蹄', label: '钉蹄', icon: '🦶' },
  { key: '兽医诊疗', label: '兽医诊疗', icon: '🏥' },
  { key: '体检', label: '体检', icon: '❤️' },
  { key: '驱虫', label: '驱虫', icon: '💊' },
  { key: '疫苗', label: '疫苗', icon: '💉' },
];

const statusOptions = [
  { key: 'all', label: '全部状态' },
  { key: '待处理', label: '待处理' },
  { key: '进行中', label: '进行中' },
  { key: '已完成', label: '已完成' },
];

const HealthPage: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [activeType, setActiveType] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats: StatItem[] = [
    { label: '本月健康检查', value: '28', unit: '次', trend: 'up' },
    { label: '待处理事项', value: '3', unit: '项', trend: 'neutral' },
    { label: '医疗费用', value: '8,500', unit: '元', trend: 'down' },
  ];

  const loadData = useCallback(() => {
    console.log('[HealthPage] 加载数据');
    setRecords(healthRecords);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    console.log('[HealthPage] 页面显示');
    loadData();
  });

  usePullDownRefresh(() => {
    console.log('[HealthPage] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      Taro.stopPullDownRefresh().catch((err) => {
        console.error('[HealthPage] 停止刷新失败:', err);
      });
    }, 1000);
  });

  const handleTypeClick = (key: string) => {
    console.log('[HealthPage] 类型筛选:', key);
    setActiveType(key);
  };

  const handleStatusClick = (key: string) => {
    console.log('[HealthPage] 状态筛选:', key);
    setActiveStatus(key);
  };

  const getFilteredRecords = () => {
    let filtered = records;
    if (activeType !== 'all') {
      filtered = filtered.filter(r => r.type === activeType);
    }
    if (activeStatus !== 'all') {
      filtered = filtered.filter(r => r.status === activeStatus);
    }
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handleAddRecord = () => {
    console.log('[HealthPage] 新增健康记录');
    Taro.navigateTo({ url: '/pages/health-detail/index' }).catch((err) => {
      console.error('[HealthPage] 跳转失败:', err);
    });
  };

  const filteredRecords = getFilteredRecords();

  return (
    <View className={styles.pageContainer}>
      <View className={styles.statsSection}>
        {stats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </View>

      <View className={styles.section}>
        <SectionHeader title="健康记录类型" />
        <ScrollView scrollX className={styles.typeTabs}>
          {typeOptions.map((option) => (
            <View
              key={option.key}
              className={classNames(styles.typeTab, activeType === option.key && styles.typeTabActive)}
              onClick={() => handleTypeClick(option.key)}
            >
              <Text className={styles.tabIcon}>{option.icon}</Text>
              <Text>{option.label}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <View className={styles.section}>
        <SectionHeader
          title="健康记录"
          subtitle={`${filteredRecords.length} 条记录`}
          extraText="筛选"
          onExtraClick={() => {
            const statusTitles = statusOptions.map(o => o.label);
            Taro.showActionSheet({
              itemList: statusTitles,
            }).then((res) => {
              handleStatusClick(statusOptions[res.tapIndex].key);
            }).catch((err) => {
              if (err.errMsg !== 'showActionSheet:fail cancel') {
                console.error('[HealthPage] ActionSheet失败:', err);
              }
            });
          }}
        />

        <View className={styles.listContainer}>
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <HealthCard key={record.id} data={record} />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text>📋</Text>
              <Text className={styles.emptyText}>暂无健康记录</Text>
            </View>
          )}
        </View>
      </View>

      <Button className={styles.addBtn} onClick={handleAddRecord}>
        <Text>+</Text>
      </Button>
    </View>
  );
};

export default HealthPage;
