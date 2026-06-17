import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  extraText?: string;
  showArrow?: boolean;
  onExtraClick?: () => void;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  extraText,
  showArrow = true,
  onExtraClick,
  className,
}) => {
  return (
    <View className={classNames(styles.sectionHeader, className)}>
      <View className={styles.headerLeft}>
        <Text className={styles.headerTitle}>{title}</Text>
        {subtitle && <Text className={styles.headerSubtitle}>{subtitle}</Text>}
      </View>
      {extraText && (
        <Button
          className={styles.headerExtra}
          onClick={onExtraClick}
          hoverClass={styles.hover}
        >
          <Text>{extraText}</Text>
          {showArrow && <Text className={styles.arrow}>›</Text>}
        </Button>
      )}
    </View>
  );
};

export default SectionHeader;
