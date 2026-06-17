import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Input, Picker } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import HorseCard from '@/components/HorseCard';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/StatCard';
import QuickEntry from '@/components/QuickEntry';
import { breeds } from '@/data/horses';
import { useStore } from '@/store';
import type { Horse, QuickEntryItem, StatItem } from '@/types';

const quickEntries: QuickEntryItem[] = [
  { id: '1', name: '新增马匹', icon: '🐴', color: '#8B4513', path: '' },
  { id: '2', name: '健康登记', icon: '🏥', color: '#2E8B57', path: '/pages/health/index' },
  { id: '3', name: '钉蹄预约', icon: '🦶', color: '#DAA520', path: '/pages/health/index' },
  { id: '4', name: '兽医诊疗', icon: '👨‍⚕️', color: '#1976D2', path: '/pages/health/index' },
  { id: '5', name: '疫苗接种', icon: '💉', color: '#D32F2F', path: '/pages/health/index' },
  { id: '6', name: '驱虫', icon: '💊', color: '#FF8C00', path: '/pages/health/index' },
  { id: '7', name: '品种档案', icon: '📋', color: '#8D6E63', path: '' },
  { id: '8', name: '马房管理', icon: '🏠', color: '#607D8B', path: '/pages/stable/index' },
];

const filterOptions = [
  { key: 'all', label: '全部' },
  { key: '健康', label: '健康' },
  { key: '训练中', label: '训练中' },
  { key: '休息', label: '休息' },
  { key: '治疗中', label: '治疗中' },
];

const breedOptions = ['阿拉伯马', '纯血马', '温血马', '夸特马', '弗里斯兰马', '安达卢西亚马', '设特兰矮马', '蒙古马', '伊犁马', '其他'];
const statusOptions: Horse['status'][] = ['健康', '训练中', '休息', '治疗中'];
const genderOptions: Horse['gender'][] = ['公', '母'];

const HomePage: React.FC = () => {
  const { state, addHorse } = useStore();
  const [horseList, setHorseList] = useState<Horse[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [horseForm, setHorseForm] = useState<{
    name: string;
    breed: string;
    age: string;
    gender: Horse['gender'];
    color: string;
    origin: string;
    height: string;
    weight: string;
    stableNo: string;
    trainer: string;
    status: Horse['status'];
    description: string;
  }>({
    name: '',
    breed: breedOptions[0],
    age: '',
    gender: '公',
    color: '',
    origin: '',
    height: '',
    weight: '',
    stableNo: '',
    trainer: '',
    status: '健康',
    description: '',
  });

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
    setHorseList(state.horses);
  }, [state.horses]);

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
      Taro.stopPullDownRefresh().catch(console.error);
    }, 1000);
  });

  const handleFilterClick = (key: string) => {
    setActiveFilter(key);
  };

  const getFilteredHorses = () => {
    if (activeFilter === 'all') return horseList;
    return horseList.filter((h) => h.status === activeFilter);
  };

  const openAddModal = () => {
    const today = new Date().toISOString().slice(0, 10);
    setHorseForm({
      name: '',
      breed: breedOptions[0],
      age: '',
      gender: '公',
      color: '',
      origin: '',
      height: '',
      weight: '',
      stableNo: '',
      trainer: '',
      status: '健康',
      description: '',
    });
    setShowAddModal(true);
  };

  const handleQuickEntry = (item: QuickEntryItem) => {
    if (item.name === '新增马匹') {
      openAddModal();
      return;
    }
    if (item.name === '品种档案') {
      Taro.showToast({ title: '品种档案开发中', icon: 'none' }).catch(console.error);
      return;
    }
    if (item.path) {
      Taro.switchTab({ url: item.path }).catch(() => {
        Taro.navigateTo({ url: item.path }).catch(console.error);
      });
    }
  };

  const handleAddHorse = () => {
    if (!horseForm.name.trim()) {
      Taro.showToast({ title: '请输入马匹名称', icon: 'none' }).catch(console.error);
      return;
    }
    if (!horseForm.age || Number(horseForm.age) <= 0) {
      Taro.showToast({ title: '请输入正确年龄', icon: 'none' }).catch(console.error);
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const birthDate = new Date(
      new Date().getFullYear() - Number(horseForm.age),
      new Date().getMonth(),
      new Date().getDate()
    )
      .toISOString()
      .slice(0, 10);
    const nextMonth = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      new Date().getDate()
    )
      .toISOString()
      .slice(0, 10);

    addHorse({
      name: horseForm.name.trim(),
      breed: horseForm.breed,
      age: Number(horseForm.age),
      gender: horseForm.gender,
      color: horseForm.color.trim() || '未登记',
      birthDate,
      origin: horseForm.origin.trim() || '未登记',
      height: Number(horseForm.height) || 160,
      weight: Number(horseForm.weight) || 500,
      stableNo: horseForm.stableNo.trim() || '未分配',
      trainer: horseForm.trainer.trim() || '待分配',
      status: horseForm.status,
      avatar: 'https://picsum.photos/seed/horse' + Date.now() + '/200/200',
      description: horseForm.description,
      purchaseDate: today,
      lastHealthCheck: today,
      nextHealthCheck: nextMonth,
    });

    Taro.showToast({ title: '马匹添加成功', icon: 'success' }).catch(console.error);
    setShowAddModal(false);
    setTimeout(() => loadData(), 500);
  };

  const filteredHorses = getFilteredHorses();

  const getHeaderStats = () => {
    const total = horseList.length;
    const healthy = horseList.filter((h) => h.status === '健康').length;
    const training = horseList.filter((h) => h.status === '训练中').length;
    const treating = horseList.filter((h) => h.status === '治疗中').length;
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
        <QuickEntry data={quickEntries} columns={4} onItemClick={handleQuickEntry} />
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
        <SectionHeader
          title="马匹列表"
          subtitle={`共 ${filteredHorses.length} 匹`}
          extraText="新增"
          onExtraClick={openAddModal}
        />
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
            filteredHorses.map((horse) => <HorseCard key={horse.id} data={horse} />)
          ) : (
            <View className={styles.emptyState}>
              <Text style={{ fontSize: '80rpx' }}>🐴</Text>
              <Text className={styles.emptyText}>暂无该状态的马匹</Text>
            </View>
          )}
        </View>
      </View>

      <View className={styles.addBtn} onClick={openAddModal}>
        <Text style={{ color: '#fff', fontSize: '60rpx', lineHeight: '96rpx', textAlign: 'center' }}>+</Text>
      </View>

      {showAddModal && (
        <View className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>新增马匹</Text>
            <ScrollView scrollY className={styles.modalScroll}>
              <Text className={styles.formLabel}>马匹名称 *</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入马匹名称"
                value={horseForm.name}
                onInput={(e) => setHorseForm({ ...horseForm, name: e.detail.value })}
              />

              <Text className={styles.formLabel}>品种</Text>
              <Picker
                mode="selector"
                range={breedOptions}
                onChange={(e) => {
                  setHorseForm({ ...horseForm, breed: breedOptions[Number(e.detail.value)] });
                }}
              >
                <View className={styles.formPicker}>
                  <Text>{horseForm.breed}</Text>
                </View>
              </Picker>

              <View style={{ display: 'flex', gap: '16rpx' }}>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>年龄（岁）*</Text>
                  <Input
                    className={styles.formInput}
                    type="number"
                    placeholder="例如：5"
                    value={horseForm.age}
                    onInput={(e) => setHorseForm({ ...horseForm, age: e.detail.value })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>性别</Text>
                  <Picker
                    mode="selector"
                    range={genderOptions}
                    onChange={(e) => {
                      setHorseForm({
                        ...horseForm,
                        gender: genderOptions[Number(e.detail.value)],
                      });
                    }}
                  >
                    <View className={styles.formPicker}>
                      <Text>{horseForm.gender}</Text>
                    </View>
                  </Picker>
                </View>
              </View>

              <View style={{ display: 'flex', gap: '16rpx' }}>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>毛色</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="例如：枣红色"
                    value={horseForm.color}
                    onInput={(e) => setHorseForm({ ...horseForm, color: e.detail.value })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>产地</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="例如：中国"
                    value={horseForm.origin}
                    onInput={(e) => setHorseForm({ ...horseForm, origin: e.detail.value })}
                  />
                </View>
              </View>

              <View style={{ display: 'flex', gap: '16rpx' }}>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>身高（cm）</Text>
                  <Input
                    className={styles.formInput}
                    type="digit"
                    placeholder="例如：165"
                    value={horseForm.height}
                    onInput={(e) => setHorseForm({ ...horseForm, height: e.detail.value })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>体重（kg）</Text>
                  <Input
                    className={styles.formInput}
                    type="digit"
                    placeholder="例如：500"
                    value={horseForm.weight}
                    onInput={(e) => setHorseForm({ ...horseForm, weight: e.detail.value })}
                  />
                </View>
              </View>

              <View style={{ display: 'flex', gap: '16rpx' }}>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>马房号</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="例如：A-01"
                    value={horseForm.stableNo}
                    onInput={(e) => setHorseForm({ ...horseForm, stableNo: e.detail.value })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text className={styles.formLabel}>教练</Text>
                  <Input
                    className={styles.formInput}
                    placeholder="负责教练"
                    value={horseForm.trainer}
                    onInput={(e) => setHorseForm({ ...horseForm, trainer: e.detail.value })}
                  />
                </View>
              </View>

              <Text className={styles.formLabel}>状态</Text>
              <Picker
                mode="selector"
                range={statusOptions}
                onChange={(e) => {
                  setHorseForm({ ...horseForm, status: statusOptions[Number(e.detail.value)] });
                }}
              >
                <View className={styles.formPicker}>
                  <Text>{horseForm.status}</Text>
                </View>
              </Picker>

              <Text className={styles.formLabel}>备注</Text>
              <Input
                className={styles.formInput}
                placeholder="选填"
                value={horseForm.description}
                onInput={(e) => setHorseForm({ ...horseForm, description: e.detail.value })}
              />
            </ScrollView>
            <View className={styles.modalFooter}>
              <View
                className={classNames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowAddModal(false)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classNames(styles.modalBtn, styles.modalBtnPrimary)}
                onClick={handleAddHorse}
              >
                <Text>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default HomePage;
