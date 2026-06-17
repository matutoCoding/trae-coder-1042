import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import './app.scss';
import { StoreProvider } from './store';

function App({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    console.log('[App] 小程序启动');
    Taro.getSystemInfoSync();
  }, []);

  return (
    <StoreProvider>
      {children}
    </StoreProvider>
  );
}

export default App;
