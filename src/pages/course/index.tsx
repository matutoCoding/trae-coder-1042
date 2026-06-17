import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import CourseCard from '@/components/CourseCard';
import SectionHeader from '@/components/SectionHeader';
import StatCard from '@/components/StatCard';
import { courses, courseSchedules, coaches } from '@/data/courses';
import type { Course, CourseSchedule, StatItem } from '@/types';

const tabs = [
  { key: 'schedule', label: '今日排课' },
  { key: 'courses', label: '课程列表' },
  { key: 'coaches', label: '教练管理' },
];

const CoursePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [scheduleList, setScheduleList] = useState<CourseSchedule[]>([]);
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const stats: StatItem[] = [
    { label: '今日课程', value: '6', unit: '节', trend: 'up' },
    { label: '预约人数', value: '18', unit: '人', trend: 'up' },
    { label: '本月课时', value: '256', unit: '节', trend: 'neutral' },
  ];

  const loadData = useCallback(() => {
    console.log('[CoursePage] 加载数据');
    setScheduleList(courseSchedules);
    setCourseList(courses);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useDidShow(() => {
    console.log('[CoursePage] 页面显示');
    loadData();
  });

  usePullDownRefresh(() => {
    console.log('[CoursePage] 下拉刷新');
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
      Taro.stopPullDownRefresh().catch((err) => {
        console.error('[CoursePage] 停止刷新失败:', err);
      });
    }, 1000);
  });

  const handleTabClick = (key: string) => {
    console.log('[CoursePage] 切换标签:', key);
    setActiveTab(key);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case '待上课':
        return styles.statusTagPending;
      case '进行中':
        return styles.statusTagOngoing;
      case '已完成':
        return styles.statusTagCompleted;
      default:
        return '';
    }
  };

  const getTodaySchedules = () => {
    return scheduleList.filter(s => s.status !== '已完成');
  };

  const handleScheduleClick = (schedule: CourseSchedule) => {
    console.log('[CoursePage] 点击排课:', schedule.courseName);
    Taro.navigateTo({ url: `/pages/course-detail/index?id=${schedule.id}` }).catch((err) => {
      console.error('[CoursePage] 跳转失败:', err);
    });
  };

  const todaySchedules = getTodaySchedules();

  return (
    <View className={styles.pageContainer}>
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

      {activeTab === 'schedule' && (
        <>
          <View style={{ display: 'flex', gap: '24rpx', marginBottom: '48rpx' }}>
            {stats.map((stat, index) => (
              <StatCard key={index} data={stat} />
            ))}
          </View>

          <View className={styles.scheduleSection}>
            <View className={styles.scheduleDate}>
              <Text>今日排课</Text>
              <View className={styles.todayTag}>
                <Text>{new Date().toLocaleDateString('zh-CN')}</Text>
              </View>
            </View>

            {todaySchedules.length > 0 ? (
              todaySchedules.map((schedule) => (
                <View
                  key={schedule.id}
                  className={styles.scheduleCard}
                  onClick={() => handleScheduleClick(schedule)}
                >
                  <View className={styles.timeColumn}>
                    <Text className={styles.startTime}>{schedule.startTime}</Text>
                    <Text className={styles.endTime}>- {schedule.endTime}</Text>
                  </View>
                  <View className={styles.scheduleContent}>
                    <Text className={styles.courseName}>{schedule.courseName}</Text>
                    <View className={styles.courseMeta}>
                      <View className={styles.metaItem}>
                        <Text>👨‍🏫</Text>
                        <Text>{schedule.coachName}</Text>
                      </View>
                      <View className={styles.metaItem}>
                        <Text>📍</Text>
                        <Text>{schedule.venue}</Text>
                      </View>
                    </View>
                    <View className={styles.scheduleFooter}>
                      <Text className={styles.studentCount}>
                        {schedule.currentStudents}/{schedule.maxStudents}人已报名
                      </Text>
                      <View className={classNames(styles.statusTag, getStatusClass(schedule.status))}>
                        <Text>{schedule.status}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View className={styles.emptyState}>
                <Text>📅</Text>
                <Text className={styles.emptyText}>今日暂无排课</Text>
              </View>
            )}
          </View>
        </>
      )}

      {activeTab === 'courses' && (
        <View className={styles.section}>
          <SectionHeader title="全部课程" subtitle={`共 ${courseList.length} 门课程`} />
          <View className={styles.courseList}>
            {courseList.map((course) => (
              <CourseCard key={course.id} data={course} />
            ))}
          </View>
        </View>
      )}

      {activeTab === 'coaches' && (
        <View className={styles.section}>
          <SectionHeader title="教练团队" subtitle={`共 ${coaches.length} 位教练`} />
          <View>
            {coaches.map((coach) => (
              <View
                key={coach.id}
                className={styles.scheduleCard}
                onClick={() => {
                  Taro.showToast({ title: '教练详情开发中', icon: 'none' }).catch(console.error);
                }}
              >
                <View className={styles.timeColumn} style={{ borderRight: 'none', padding: 0, width: '120rpx' }}>
                  <View
                    style={{
                      width: '100rpx',
                      height: '100rpx',
                      borderRadius: '50%',
                      background: coach.avatar,
                      overflow: 'hidden',
                    }}
                  >
                    <img src={coach.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </View>
                </View>
                <View className={styles.scheduleContent}>
                  <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx', marginBottom: '8rpx' }}>
                    <Text className={styles.courseName}>{coach.name}</Text>
                    <View
                      className={classNames(styles.statusTag, coach.status === '在职' ? styles.statusTagOngoing : styles.statusTagCompleted)}
                    >
                      <Text>{coach.status}</Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: '24rpx', color: '#5D4037', marginBottom: '16rpx' }}>{coach.title}</Text>
                  <View className={styles.courseMeta}>
                    <View className={styles.metaItem}>
                      <Text>⏱️</Text>
                      <Text>{coach.experience}年教龄</Text>
                    </View>
                    <View className={styles.metaItem}>
                      <Text>⭐</Text>
                      <Text>{coach.rating}分</Text>
                    </View>
                  </View>
                  <View style={{ display: 'flex', flexWrap: 'wrap', gap: '8rpx', marginTop: '16rpx' }}>
                    {coach.specialty.map((s, i) => (
                      <View key={i} style={{
                        padding: '4rpx 12rpx',
                        background: 'rgba(139, 69, 19, 0.1)',
                        borderRadius: '8rpx',
                        fontSize: '22rpx',
                        color: '#8B4513',
                      }}>
                        <Text>{s}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

export default CoursePage;
