import React from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import classNames from 'classnames';
import type { QuickEntryItem } from '@/types';

interface QuickEntryProps {
  data: QuickEntryItem[];
  columns?: number;
}

const QuickEntry: React.FC<QuickEntryProps> = ({ data, columns = 4 }) => {
  const handleItemClick = (item: QuickEntryItem) => {
    console.log('[QuickEntry] 点击:', item.name);
    if (item.path) {
      Taro.navigateTo({ url: item.path }).catch((err) => {
        console.error('[QuickEntry] 跳转失败:', err);
      });
    }
  };

  return (
    <View className={styles.quickGrid} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {data.map((item) => (
        <View
          key={item.id}
          className={styles.quickItem}
          onClick={() => handleItemClick(item)}
        >
          <View
            className={classNames(styles.quickIcon, styles[`icon${item.id}`])}
            style={{ backgroundColor: item.color + '20', color: item.color }}
          >
            <Text>{item.icon}</Text>
          </View>
          <Text className={styles.quickName}>{item.name}</Text>
        </View>
      ))}
    </View>
  );
};

export default QuickEntry;
