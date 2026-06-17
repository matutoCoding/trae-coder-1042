import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Input, Picker, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import SectionHeader from '@/components/SectionHeader';
import QuickEntry from '@/components/QuickEntry';
import StatCard from '@/components/StatCard';
import { stables as staticStables } from '@/data/stables';
import { useStore } from '@/store';
import type {
  Stable,
  Equipment,
  QuickEntryItem,
  StatItem,
  Member,
  EquipmentRental,
} from '@/types';
import { formatMoney, getStatusColor } from '@/utils';

const tabs = [
  { key: 'stable', label: '马房管理' },
  { key: 'feeding', label: '饲料投喂' },
  { key: 'equipment', label: '装备租赁' },
  { key: 'rentals', label: '租赁记录' },
];

const quickEntries: QuickEntryItem[] = [
  { id: '1', name: '卫生清扫', icon: '🧹', color: '#2E8B57', path: '' },
  { id: '2', name: '饲料投喂', icon: '🥕', color: '#FF8C00', path: '' },
  { id: '3', name: '装备租赁', icon: '🎽', color: '#1976D2', path: '' },
  { id: '4', name: '租赁记录', icon: '�', color: '#DAA520', path: '' },
];

const equipmentIcons: Record<string, string> = {
  马鞍: '🐴',
  缰绳: '🎗️',
  头盔: '⛑️',
  护具: '🦵',
  马靴: '👢',
  其他: '📦',
};

const defaultCleanItems = ['清理粪便', '更换垫料', '清洗食槽', '消毒地面', '通风', '整理用品'];
const feedTypeOptions = [
  '苜蓿干草',
  '优质干草',
  '配合饲料',
  '高能配合饲料',
  '燕麦+玉米',
  '燕麦+亚麻籽',
  '易消化干草',
  '配合饲料+胡萝卜',
  '青草',
];

const StablePage: React.FC = () => {
  const {
    state,
    addCleanRecord,
    addFeedingRecord,
    rentEquipment,
    returnEquipment,
  } = useStore();

  const [activeTab, setActiveTab] = useState('stable');
  const [stableList] = useState<Stable[]>(staticStables);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showCleanModal, setShowCleanModal] = useState(false);
  const [showFeedingModal, setShowFeedingModal] = useState(false);
  const [showRentModal, setShowRentModal] = useState(false);

  const [cleanForm, setCleanForm] = useState<{
    stableId: string;
    stableNo: string;
    horseId: string;
    horseName: string;
    items: string[];
    operator: string;
    date: string;
    time: string;
  }>({
    stableId: '',
    stableNo: '',
    horseId: '',
    horseName: '',
    items: [],
    operator: '',
    date: new Date().toISOString().slice(0, 10),
    time: '',
  });

  const [feedingForm, setFeedingForm] = useState<{
    stableId: string;
    stableNo: string;
    horseId: string;
    horseName: string;
    feedType: string;
    quantity: string;
    operator: string;
    date: string;
    time: string;
  }>({
    stableId: '',
    stableNo: '',
    horseId: '',
    horseName: '',
    feedType: '',
    quantity: '',
    operator: '',
    date: new Date().toISOString().slice(0, 10),
    time: '',
  });

  const [rentForm, setRentForm] = useState<{
    equipment: Equipment | null;
    memberId: string;
    memberName: string;
    hours: string;
    quantity: string;
  }>({
    equipment: null,
    memberId: '',
    memberName: '',
    hours: '1',
    quantity: '1',
  });

  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const stats: StatItem[] = [
    { label: '马房总数', value: String(stableList.length), unit: '间' },
    { label: '已占用', value: String(stableList.filter(s => s.status === '已占用').length), unit: '间' },
    { label: '今日投喂', value: String(state.feedingRecords.filter(r => r.date === todayStr).length), unit: '次' },
  ];

  const loadData = useCallback(() => {
    console.log('[StablePage] 加载数据');
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    loadData();
  });

  usePullDownRefresh(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      Taro.stopPullDownRefresh().catch(console.error);
    }, 800);
  });

  const handleTabClick = (key: string) => {
    setActiveTab(key);
  };

  const handleQuickEntry = (item: QuickEntryItem) => {
    if (item.name === '卫生清扫') {
      openCleanModal();
    } else if (item.name === '饲料投喂') {
      openFeedingModal();
    } else if (item.name === '装备租赁') {
      setActiveTab('equipment');
    } else if (item.name === '租赁记录') {
      setActiveTab('rentals');
    } else {
      Taro.showToast({ title: '功能开发中', icon: 'none' }).catch(console.error);
    }
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

  const openCleanModal = (presetStable?: Stable) => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setCleanForm({
      stableId: presetStable?.id || '',
      stableNo: presetStable?.stableNo || '',
      horseId: presetStable?.horseId || '',
      horseName: presetStable?.horseName || '',
      items: ['清理粪便', '清洗食槽'],
      operator: '',
      date: todayStr,
      time: `${hh}:${mm}`,
    });
    setShowCleanModal(true);
  };

  const openFeedingModal = (presetStable?: Stable) => {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    setFeedingForm({
      stableId: presetStable?.id || '',
      stableNo: presetStable?.stableNo || '',
      horseId: presetStable?.horseId || '',
      horseName: presetStable?.horseName || '',
      feedType: '苜蓿干草',
      quantity: '4',
      operator: '',
      date: todayStr,
      time: `${hh}:${mm}`,
    });
    setShowFeedingModal(true);
  };

  const handleStableClick = (stable: Stable) => {
    Taro.showActionSheet({
      itemList: ['查看详情', '登记清扫', '记录投喂', '维修申请'],
    })
      .then((res) => {
        switch (res.tapIndex) {
          case 0:
            Taro.showToast({ title: '详情开发中', icon: 'none' }).catch(console.error);
            break;
          case 1:
            openCleanModal(stable);
            break;
          case 2:
            openFeedingModal(stable);
            break;
          case 3:
            Taro.showToast({ title: '维修申请已提交', icon: 'success' }).catch(console.error);
            break;
        }
      })
      .catch((err) => {
        if (err?.errMsg?.includes('cancel')) return;
        console.error(err);
      });
  };

  const submitCleanRecord = () => {
    if (!cleanForm.stableNo) {
      Taro.showToast({ title: '请选择马房', icon: 'none' }).catch(console.error);
      return;
    }
    if (cleanForm.items.length === 0) {
      Taro.showToast({ title: '请选择清扫项目', icon: 'none' }).catch(console.error);
      return;
    }
    if (!cleanForm.operator.trim()) {
      Taro.showToast({ title: '请填写操作人', icon: 'none' }).catch(console.error);
      return;
    }
    if (!cleanForm.time) {
      Taro.showToast({ title: '请选择时间', icon: 'none' }).catch(console.error);
      return;
    }
    addCleanRecord({
      stableId: cleanForm.stableId || 'custom',
      stableNo: cleanForm.stableNo,
      horseId: cleanForm.horseId || undefined,
      horseName: cleanForm.horseName.trim() || undefined,
      date: cleanForm.date,
      time: cleanForm.time,
      operator: cleanForm.operator.trim(),
      items: cleanForm.items,
      status: '已完成',
    });
    Taro.showToast({ title: '清扫记录已保存', icon: 'success' }).catch(console.error);
    setShowCleanModal(false);
  };

  const submitFeedingRecord = () => {
    if (!feedingForm.horseName.trim()) {
      Taro.showToast({ title: '请填写马匹名称', icon: 'none' }).catch(console.error);
      return;
    }
    if (!feedingForm.feedType) {
      Taro.showToast({ title: '请选择饲料类型', icon: 'none' }).catch(console.error);
      return;
    }
    const qty = Number(feedingForm.quantity);
    if (!qty || qty <= 0) {
      Taro.showToast({ title: '请填写正确数量', icon: 'none' }).catch(console.error);
      return;
    }
    if (!feedingForm.operator.trim()) {
      Taro.showToast({ title: '请填写操作人', icon: 'none' }).catch(console.error);
      return;
    }
    if (!feedingForm.time) {
      Taro.showToast({ title: '请选择时间', icon: 'none' }).catch(console.error);
      return;
    }
    addFeedingRecord({
      stableId: feedingForm.stableId || undefined,
      stableNo: feedingForm.stableNo || undefined,
      horseId: feedingForm.horseId || 'custom',
      horseName: feedingForm.horseName.trim(),
      date: feedingForm.date,
      time: feedingForm.time,
      feedType: feedingForm.feedType,
      quantity: qty,
      operator: feedingForm.operator.trim(),
    });
    Taro.showToast({ title: '投喂记录已保存', icon: 'success' }).catch(console.error);
    setShowFeedingModal(false);
  };

  const handleEquipmentClick = (item: Equipment) => {
    if (item.availableQuantity <= 0) {
      Taro.showToast({ title: '该装备已全部租出', icon: 'none' }).catch(console.error);
      return;
    }
    setRentForm({
      equipment: item,
      memberId: '',
      memberName: '',
      hours: '1',
      quantity: '1',
    });
    setShowRentModal(true);
  };

  const handleMemberSelect = (member: Member) => {
    setRentForm({ ...rentForm, memberId: member.id, memberName: member.name });
  };

  const submitRent = () => {
    if (!rentForm.equipment) return;
    if (!rentForm.memberId) {
      Taro.showToast({ title: '请选择会员', icon: 'none' }).catch(console.error);
      return;
    }
    const hours = Number(rentForm.hours);
    const qty = Number(rentForm.quantity);
    if (!hours || hours <= 0) {
      Taro.showToast({ title: '请填写正确时长', icon: 'none' }).catch(console.error);
      return;
    }
    if (!qty || qty <= 0) {
      Taro.showToast({ title: '请填写正确数量', icon: 'none' }).catch(console.error);
      return;
    }
    const result = rentEquipment(
      rentForm.equipment.id,
      rentForm.memberId,
      rentForm.memberName,
      hours,
      qty
    );
    if (result.success) {
      Taro.showToast({ title: result.message, icon: 'success' }).catch(console.error);
      setShowRentModal(false);
    } else {
      Taro.showToast({ title: result.message, icon: 'none' }).catch(console.error);
    }
  };

  const handleReturnRental = (rental: EquipmentRental) => {
    Taro.showModal({
      title: '确认归还',
      content: `确定要归还 ${rental.equipmentName} × ${rental.quantity} 吗？`,
    })
      .then((res) => {
        if (res.confirm) {
          const result = returnEquipment(rental.id);
          Taro.showToast({
            title: result.message,
            icon: result.success ? 'success' : 'none',
          }).catch(console.error);
        }
      })
      .catch(console.error);
  };

  const toggleCleanItem = (item: string) => {
    const exists = cleanForm.items.includes(item);
    setCleanForm({
      ...cleanForm,
      items: exists
        ? cleanForm.items.filter((i) => i !== item)
        : [...cleanForm.items, item],
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
        <QuickEntry data={quickEntries} columns={4} onItemClick={handleQuickEntry} />
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
                {stable.horseName && <Text className={styles.horseName}>🐴 {stable.horseName}</Text>}
                <Text className={styles.stableInfo}>垫料：{stable.beddingType}</Text>
                <View className={styles.stableFooter}>
                  <Text className={styles.cleanDate}>上次清扫：{stable.lastCleanDate}</Text>
                  <Text className={styles.size}>{stable.size}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ marginTop: '48rpx' }}>
            <SectionHeader
              title="清扫记录"
              subtitle={`${state.cleanRecords.length} 条`}
              extraText="登记清扫"
              onExtraClick={() => openCleanModal()}
            />
            {state.cleanRecords.slice(0, 10).map((record) => (
              <View key={record.id} className={styles.feedingCard}>
                <View className={styles.feedingHeader}>
                  <Text className={styles.feedingHorse}>
                    马房 {record.stableNo}
                    {record.horseName ? ` · ${record.horseName}` : ''}
                  </Text>
                  <Text className={styles.feedingTime}>
                    {record.date.slice(5)} {record.time}
                  </Text>
                </View>
                <View className={styles.tagGroup}>
                  {record.items.map((item, i) => (
                    <View key={i} className={styles.tagItem}>
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
          <SectionHeader
            title="投喂记录"
            subtitle={`${state.feedingRecords.length} 条`}
            extraText="记录投喂"
            onExtraClick={() => openFeedingModal()}
          />
          <View className={styles.feedingList}>
            {state.feedingRecords.map((record) => (
              <View key={record.id} className={styles.feedingCard}>
                <View className={styles.feedingHeader}>
                  <Text className={styles.feedingHorse}>
                    {record.stableNo ? `马房 ${record.stableNo} · ` : ''}🐴 {record.horseName}
                  </Text>
                  <Text className={styles.feedingTime}>
                    {record.date.slice(5)} {record.time}
                  </Text>
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
          <SectionHeader
            title="可租赁装备"
            subtitle={`${state.equipment.length} 种装备`}
          />
          <View className={styles.equipmentList}>
            {state.equipment.map((item) => (
              <View
                key={item.id}
                className={classNames(
                  styles.equipmentCard,
                  item.availableQuantity === 0 && styles.equipmentDisabled
                )}
                onClick={() => handleEquipmentClick(item)}
              >
                <View className={styles.equipmentIcon}>
                  <Text>{equipmentIcons[item.type] || '📦'}</Text>
                </View>
                <View className={styles.equipmentInfo}>
                  <Text className={styles.equipmentName}>{item.name}</Text>
                  <Text className={styles.equipmentMeta}>
                    {item.brand} · {item.size}
                  </Text>
                  <View className={styles.equipmentStock}>
                    <Text className={styles.stockText}>
                      可租：{item.availableQuantity}/{item.quantity}
                    </Text>
                  </View>
                </View>
                <Text className={styles.price}>¥{item.pricePerHour}/时</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {activeTab === 'rentals' && (
        <View className={styles.section}>
          <SectionHeader
            title="租赁记录"
            subtitle={`${state.rentals.length} 条记录`}
          />
          {state.rentals.length === 0 && (
            <View className={styles.emptyState}>
              <Text className={styles.emptyIcon}>📦</Text>
              <Text className={styles.emptyText}>暂无租赁记录</Text>
            </View>
          )}
          <View className={styles.feedingList}>
            {state.rentals.map((rental) => (
              <View key={rental.id} className={styles.feedingCard}>
                <View className={styles.feedingHeader}>
                  <Text className={styles.feedingHorse}>
                    {equipmentIcons[
                      state.equipment.find(e => e.id === rental.equipmentId)?.type || '其他'
                    ] || '📦'} {rental.equipmentName}
                  </Text>
                  <View
                    className={classNames(styles.statusTag, rental.status === '租赁中' ? styles.statusOccupied : styles.statusEmpty)}
                  >
                    <Text>{rental.status}</Text>
                  </View>
                </View>
                <View style={{ display: 'flex', flexDirection: 'column', gap: '8rpx', marginBottom: '12rpx' }}>
                  <Text style={{ fontSize: '24rpx', color: '#5D4037' }}>
                    会员：{rental.memberName} · {rental.quantity}件 × {rental.hours}小时
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#5D4037' }}>
                    租赁时间：{rental.rentTime}
                  </Text>
                  {rental.returnTime && (
                    <Text style={{ fontSize: '24rpx', color: '#2E8B57' }}>
                      归还时间：{rental.returnTime}
                    </Text>
                  )}
                </View>
                <View className={styles.rentalFooter}>
                  <Text style={{ fontSize: '30rpx', color: '#8B4513', fontWeight: '600' }}>
                    ¥{formatMoney(rental.totalAmount)}
                  </Text>
                  {rental.status === '租赁中' && (
                    <View
                      className={classNames(styles.modalBtn, styles.modalBtnPrimary, styles.rentalReturnBtn)}
                      onClick={() => handleReturnRental(rental)}
                    >
                      <Text>归还</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      )}

      {showCleanModal && (
        <View className={styles.modalOverlay} onClick={() => setShowCleanModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>登记清扫</Text>
            <ScrollView scrollY className={styles.modalScroll}>
              <Text className={styles.formLabel}>选择马房 *</Text>
              <Picker
                mode="selector"
                range={stableList.map((s) => `${s.stableNo}${s.horseName ? ` · ${s.horseName}` : ''}`)}
                onChange={(e) => {
                  const idx = Number(e.detail.value);
                  const s = stableList[idx];
                  if (s) {
                    setCleanForm({
                      ...cleanForm,
                      stableNo: s.stableNo,
                      stableId: s.id,
                      horseId: s.horseId || '',
                      horseName: s.horseName || '',
                    });
                  }
                }}
              >
                <View className={styles.formPicker}>
                  <Text>{cleanForm.stableNo ? `${cleanForm.stableNo}${cleanForm.horseName ? ` · ${cleanForm.horseName}` : ''}` : '请选择马房'}</Text>
                </View>
              </Picker>

              <Text className={styles.formLabel}>马匹名称（可修改）</Text>
              <Input
                className={styles.formInput}
                placeholder="未绑定马房请手动填写"
                value={cleanForm.horseName}
                onInput={(e) => setCleanForm({ ...cleanForm, horseName: e.detail.value })}
              />

              <Text className={styles.formLabel}>清扫时间 *</Text>
              <View style={{ display: 'flex', gap: '16rpx' }}>
                <Picker
                  mode="date"
                  value={cleanForm.date}
                  onChange={(e) => setCleanForm({ ...cleanForm, date: e.detail.value })}
                >
                  <View className={classNames(styles.formPicker, styles.formPickerHalf)}>
                    <Text>{cleanForm.date}</Text>
                  </View>
                </Picker>
                <Picker
                  mode="time"
                  value={cleanForm.time}
                  onChange={(e) => setCleanForm({ ...cleanForm, time: e.detail.value })}
                >
                  <View className={classNames(styles.formPicker, styles.formPickerHalf)}>
                    <Text>{cleanForm.time || '选择时间'}</Text>
                  </View>
                </Picker>
              </View>

              <Text className={styles.formLabel}>清扫项目 *</Text>
              <View className={styles.tagGroup}>
                {defaultCleanItems.map((item) => (
                  <View
                    key={item}
                    className={classNames(
                      styles.tagItem,
                      cleanForm.items.includes(item) && styles.tagItemActive
                    )}
                    onClick={() => toggleCleanItem(item)}
                  >
                    <Text>{item}</Text>
                  </View>
                ))}
              </View>

              <Text className={styles.formLabel}>操作人 *</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入操作人姓名"
                value={cleanForm.operator}
                onInput={(e) => setCleanForm({ ...cleanForm, operator: e.detail.value })}
              />
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={classNames(styles.modalBtn, styles.modalBtnCancel)} onClick={() => setShowCleanModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={classNames(styles.modalBtn, styles.modalBtnPrimary)} onClick={submitCleanRecord}>
                <Text>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showFeedingModal && (
        <View className={styles.modalOverlay} onClick={() => setShowFeedingModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>记录投喂</Text>
            <ScrollView scrollY className={styles.modalScroll}>
              <Text className={styles.formLabel}>选择马房 *</Text>
              <Picker
                mode="selector"
                range={stableList.map((s) => `${s.stableNo}${s.horseName ? ` · ${s.horseName}` : ''}`)}
                onChange={(e) => {
                  const idx = Number(e.detail.value);
                  const s = stableList[idx];
                  if (s) {
                    setFeedingForm({
                      ...feedingForm,
                      stableNo: s.stableNo,
                      stableId: s.id,
                      horseId: s.horseId || '',
                      horseName: s.horseName || '',
                    });
                  }
                }}
              >
                <View className={styles.formPicker}>
                  <Text>{feedingForm.stableNo ? `${feedingForm.stableNo}${feedingForm.horseName ? ` · ${feedingForm.horseName}` : ''}` : '请选择马房'}</Text>
                </View>
              </Picker>

              <Text className={styles.formLabel}>马匹名称（可修改）*</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入或确认马匹名称"
                value={feedingForm.horseName}
                onInput={(e) => setFeedingForm({ ...feedingForm, horseName: e.detail.value })}
              />

              <Text className={styles.formLabel}>投喂时间 *</Text>
              <View style={{ display: 'flex', gap: '16rpx' }}>
                <Picker
                  mode="date"
                  value={feedingForm.date}
                  onChange={(e) => setFeedingForm({ ...feedingForm, date: e.detail.value })}
                >
                  <View className={classNames(styles.formPicker, styles.formPickerHalf)}>
                    <Text>{feedingForm.date}</Text>
                  </View>
                </Picker>
                <Picker
                  mode="time"
                  value={feedingForm.time}
                  onChange={(e) => setFeedingForm({ ...feedingForm, time: e.detail.value })}
                >
                  <View className={classNames(styles.formPicker, styles.formPickerHalf)}>
                    <Text>{feedingForm.time || '选择时间'}</Text>
                  </View>
                </Picker>
              </View>

              <Text className={styles.formLabel}>饲料类型 *</Text>
              <Picker
                mode="selector"
                range={feedTypeOptions}
                onChange={(e) => {
                  setFeedingForm({ ...feedingForm, feedType: feedTypeOptions[Number(e.detail.value)] });
                }}
              >
                <View className={styles.formPicker}>
                  <Text>{feedingForm.feedType || '请选择饲料'}</Text>
                </View>
              </Picker>

              <Text className={styles.formLabel}>投喂数量 (kg) *</Text>
              <Input
                className={styles.formInput}
                type="digit"
                placeholder="请输入投喂数量"
                value={feedingForm.quantity}
                onInput={(e) => setFeedingForm({ ...feedingForm, quantity: e.detail.value })}
              />

              <Text className={styles.formLabel}>操作人 *</Text>
              <Input
                className={styles.formInput}
                placeholder="请输入操作人姓名"
                value={feedingForm.operator}
                onInput={(e) => setFeedingForm({ ...feedingForm, operator: e.detail.value })}
              />
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={classNames(styles.modalBtn, styles.modalBtnCancel)} onClick={() => setShowFeedingModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={classNames(styles.modalBtn, styles.modalBtnPrimary)} onClick={submitFeedingRecord}>
                <Text>保存</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {showRentModal && rentForm.equipment && (
        <View className={styles.modalOverlay} onClick={() => setShowRentModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>装备租赁</Text>
            <ScrollView scrollY className={styles.modalScroll}>
              <View className={styles.rentHeader}>
                <View className={styles.equipmentIcon} style={{ width: '80rpx', height: '80rpx' }}>
                  <Text>{equipmentIcons[rentForm.equipment.type] || '📦'}</Text>
                </View>
                <View style={{ flex: 1, marginLeft: '20rpx' }}>
                  <Text style={{ fontSize: '30rpx', fontWeight: '600', color: '#2C1810' }}>
                    {rentForm.equipment.name}
                  </Text>
                  <Text style={{ fontSize: '24rpx', color: '#86909C', marginTop: '4rpx' }}>
                    {rentForm.equipment.brand} · {rentForm.equipment.size} · 可租 {rentForm.equipment.availableQuantity} 件
                  </Text>
                  <Text style={{ fontSize: '28rpx', color: '#8B4513', fontWeight: '600', marginTop: '8rpx' }}>
                    ¥{rentForm.equipment.pricePerHour}/时
                  </Text>
                </View>
              </View>

              <Text className={styles.formLabel}>选择会员 *</Text>
              <Picker
                mode="selector"
                range={state.members.filter((m) => m.status === '正常').map((m) => `${m.name}（${m.memberLevel}）`)}
                onChange={(e) => {
                  const idx = Number(e.detail.value);
                  const m = state.members.filter((mm) => mm.status === '正常')[idx];
                  if (m) handleMemberSelect(m);
                }}
              >
                <View className={styles.formPicker}>
                  <Text>{rentForm.memberName || '请选择会员'}</Text>
                </View>
              </Picker>

              <Text className={styles.formLabel}>租赁时长（小时）*</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder="请输入租赁小时数"
                value={rentForm.hours}
                onInput={(e) => setRentForm({ ...rentForm, hours: e.detail.value })}
              />

              <Text className={styles.formLabel}>租赁数量（件）*</Text>
              <Input
                className={styles.formInput}
                type="number"
                placeholder={`最多可租 ${rentForm.equipment.availableQuantity} 件`}
                value={rentForm.quantity}
                onInput={(e) => {
                  const v = e.detail.value;
                  const num = Math.min(Number(v) || 0, rentForm.equipment!.availableQuantity);
                  setRentForm({ ...rentForm, quantity: String(Math.max(0, num)) });
                }}
              />

              {rentForm.memberId && rentForm.hours && rentForm.quantity && (
                <View className={styles.priceSummary}>
                  <Text style={{ color: '#86909C' }}>预计费用</Text>
                  <Text style={{ fontSize: '36rpx', fontWeight: '700', color: '#8B4513' }}>
                    ¥
                    {rentForm.equipment.pricePerHour *
                      Number(rentForm.hours) *
                      Number(rentForm.quantity)}
                  </Text>
                </View>
              )}
            </ScrollView>
            <View className={styles.modalFooter}>
              <View className={classNames(styles.modalBtn, styles.modalBtnCancel)} onClick={() => setShowRentModal(false)}>
                <Text>取消</Text>
              </View>
              <View className={classNames(styles.modalBtn, styles.modalBtnPrimary)} onClick={submitRent}>
                <Text>确认租赁</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default StablePage;
