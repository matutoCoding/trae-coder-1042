import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Input, Picker, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import { useStore } from '@/store';
import { members } from '@/data/members';
import type { Event, Member } from '@/types';
import { formatMoney, getStatusColor } from '@/utils';

const eventTypeColors: Record<string, string> = {
  马术考级: '#DAA520',
  赛事活动: '#8B4513',
  马场参观: '#2E8B57',
};

const EventDetailPage: React.FC = () => {
  const router = useRouter();
  const eventId = router.params.id || '';
  const { getEventById, registerForEvent, state } = useStore();

  const [event, setEvent] = useState<Event | undefined>(getEventById(eventId));
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    console.log('[EventDetailPage] 页面加载，活动ID:', eventId);
    const ev = getEventById(eventId);
    setEvent(ev);
  }, [eventId, getEventById]);

  useDidShow(() => {
    console.log('[EventDetailPage] 页面显示');
    const ev = getEventById(eventId);
    setEvent(ev);
  });

  const refreshEvent = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      const ev = getEventById(eventId);
      setEvent(ev);
      setIsRefreshing(false);
    }, 500);
  }, [eventId, getEventById]);

  if (!event) {
    return (
      <View className={styles.pageContainer}>
        <View className={styles.notFound}>
          <Text style={{ fontSize: '100rpx' }}>🤔</Text>
          <Text style={{ marginTop: '24rpx', color: '#86909C' }}>活动不存在或已删除</Text>
        </View>
      </View>
    );
  }

  const remaining = event.maxParticipants - event.currentParticipants;
  const canRegister = event.status === '报名中' && remaining > 0;
  const progress = Math.min(100, (event.currentParticipants / event.maxParticipants) * 100);

  const openRegisterModal = () => {
    if (!canRegister) {
      if (event.status !== '报名中') {
        Taro.showToast({ title: `当前状态：${event.status}`, icon: 'none' }).catch(console.error);
      } else {
        Taro.showToast({ title: '活动已报满', icon: 'none' }).catch(console.error);
      }
      return;
    }
    setSelectedMember(null);
    setShowRegisterModal(true);
  };

  const handleRegister = () => {
    if (!selectedMember) {
      Taro.showToast({ title: '请选择报名会员', icon: 'none' }).catch(console.error);
      return;
    }
    const result = registerForEvent(event.id, selectedMember.id, selectedMember.name);
    if (result.success) {
      Taro.showToast({ title: result.message, icon: 'success' }).catch(console.error);
      setShowRegisterModal(false);
      setTimeout(() => refreshEvent(), 800);
    } else {
      Taro.showToast({ title: result.message, icon: 'none' }).catch(console.error);
    }
  };

  const handleMemberSelect = (member: Member) => {
    setSelectedMember(member);
  };

  return (
    <View className={styles.pageContainer}>
      <ScrollView scrollY refresherEnabled refresherTriggered={isRefreshing} onRefresherRefresh={refreshEvent}>
        <View
          className={styles.eventBanner}
          style={{
            background: `linear-gradient(135deg, ${eventTypeColors[event.type] || '#8B4513'} 0%, ${
              eventTypeColors[event.type] || '#8B4513'
            }AA 100%)`,
          }}
        >
          <View
            className={styles.typeTag}
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              color: '#fff',
            }}
          >
            <Text>{event.type}</Text>
          </View>
          <Text className={styles.eventName}>{event.name}</Text>
          <View style={{ display: 'flex', marginTop: '16rpx', gap: '24rpx' }}>
            <Text className={styles.bannerInfo}>📅 {event.date}</Text>
            <Text className={styles.bannerInfo}>📍 {event.location}</Text>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>报名进度</Text>
          <View className={styles.progressRow}>
            <Text className={styles.progressText}>
              已报 {event.currentParticipants} / {event.maxParticipants} 人
            </Text>
            <Text
              className={styles.progressRemaining}
              style={{ color: remaining <= 5 ? '#D32F2F' : '#2E8B57' }}
            >
              剩余 {remaining} 个名额
            </Text>
          </View>
          <View className={styles.progressBar}>
            <View
              className={styles.progressFill}
              style={{
                width: `${progress}%`,
                background: progress >= 90 ? '#D32F2F' : eventTypeColors[event.type] || '#8B4513',
              }}
            />
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>活动信息</Text>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>活动类型</Text>
            <View
              className={styles.infoTag}
              style={{
                backgroundColor: eventTypeColors[event.type] + '20',
                color: eventTypeColors[event.type],
              }}
            >
              <Text>{event.type}</Text>
            </View>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>活动时间</Text>
            <Text className={styles.infoValue}>{event.date}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>活动地点</Text>
            <Text className={styles.infoValue}>{event.location}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>报名截止</Text>
            <Text className={styles.infoValue}>{event.registrationDeadline}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>报名费用</Text>
            <Text className={styles.infoPrice}>
              {event.price > 0 ? formatMoney(event.price) : '免费'}
            </Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>活动状态</Text>
            <View
              className={styles.infoTag}
              style={{
                backgroundColor: getStatusColor(event.status) + '20',
                color: getStatusColor(event.status),
              }}
            >
              <Text>{event.status}</Text>
            </View>
          </View>
        </View>

        <View className={styles.card}>
          <Text className={styles.cardTitle}>活动介绍</Text>
          <Text className={styles.descriptionText}>{event.description}</Text>
        </View>

        {event.requirements && (
          <View className={styles.card}>
            <Text className={styles.cardTitle}>报名要求</Text>
            <View className={styles.requirementBox}>
              <Text className={styles.requirementText}>📋 {event.requirements}</Text>
            </View>
          </View>
        )}

        <View style={{ height: '160rpx' }} />
      </ScrollView>

      <View className={styles.footer}>
        <View className={styles.footerPrice}>
          <Text style={{ color: '#86909C', fontSize: '24rpx' }}>费用</Text>
          <Text className={styles.footerPriceValue}>
            {event.price > 0 ? formatMoney(event.price) : '免费'}
          </Text>
        </View>
        <View
          className={classNames(styles.footerBtn, !canRegister && styles.footerBtnDisabled)}
          onClick={openRegisterModal}
        >
          <Text>{canRegister ? '立即报名' : event.status !== '报名中' ? event.status : '已报满'}</Text>
        </View>
      </View>

      {showRegisterModal && (
        <View className={styles.modalOverlay} onClick={() => setShowRegisterModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Text className={styles.modalTitle}>报名活动</Text>
            <View className={styles.modalScroll}>
              <View className={styles.eventSummary}>
                <Text style={{ fontSize: '30rpx', fontWeight: '600', color: '#2C1810' }}>
                  {event.name}
                </Text>
                <Text style={{ fontSize: '24rpx', color: '#86909C', marginTop: '8rpx' }}>
                  {event.date} · {event.location}
                </Text>
                <Text style={{ fontSize: '32rpx', color: '#8B4513', fontWeight: '700', marginTop: '16rpx' }}>
                  {event.price > 0 ? formatMoney(event.price) : '免费'}
                </Text>
              </View>

              <Text className={styles.formLabel}>选择报名会员 *</Text>
              <Picker
                mode="selector"
                range={members.filter((m) => m.status === '正常').map((m) => `${m.name} (${m.memberLevel})`)}
                onChange={(e) => {
                  const idx = Number(e.detail.value);
                  const m = members.filter((mm) => mm.status === '正常')[idx];
                  if (m) handleMemberSelect(m);
                }}
              >
                <View className={styles.formPicker}>
                  <Text>
                    {selectedMember
                      ? `${selectedMember.name} (${selectedMember.memberLevel})`
                      : '请选择报名会员'}
                  </Text>
                </View>
              </Picker>

              {selectedMember && (
                <View className={styles.memberPreview}>
                  <Text style={{ color: '#86909C', fontSize: '24rpx' }}>会员信息</Text>
                  <Text style={{ color: '#2C1810', marginTop: '8rpx', fontSize: '26rpx' }}>
                    📱 {selectedMember.phone}
                  </Text>
                  <Text style={{ color: '#2C1810', marginTop: '4rpx', fontSize: '26rpx' }}>
                    💰 剩余课时：{selectedMember.remainingHours} 课时
                  </Text>
                </View>
              )}

              {event.price > 0 && selectedMember && (
                <View className={styles.priceSummary}>
                  <Text style={{ color: '#86909C' }}>报名费</Text>
                  <Text style={{ fontSize: '36rpx', fontWeight: '700', color: '#8B4513' }}>
                    {formatMoney(event.price)}
                  </Text>
                </View>
              )}
            </View>
            <View className={styles.modalFooter}>
              <View
                className={classNames(styles.modalBtn, styles.modalBtnCancel)}
                onClick={() => setShowRegisterModal(false)}
              >
                <Text>取消</Text>
              </View>
              <View
                className={classNames(styles.modalBtn, styles.modalBtnPrimary)}
                onClick={handleRegister}
              >
                <Text>{event.price > 0 ? '确认支付并报名' : '确认报名'}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default EventDetailPage;
