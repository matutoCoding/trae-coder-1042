import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import type {
  Horse,
  CleanRecord,
  FeedingRecord,
  Equipment,
  Event,
  ExpenseRecord,
  Member,
} from '@/types';
import { horses as initialHorses } from '@/data/horses';
import {
  cleanRecords as initialCleanRecords,
  feedingRecords as initialFeedingRecords,
  equipmentList as initialEquipment,
} from '@/data/stables';
import { events as initialEvents, expenseRecords as initialExpenseRecords, members as initialMembers } from '@/data/members';
import { events } from '@/data/events';

const STORAGE_KEY = 'equestrian_club_store_v1';

export interface StoreState {
  horses: Horse[];
  cleanRecords: CleanRecord[];
  feedingRecords: FeedingRecord[];
  equipment: Equipment[];
  events: Event[];
  expenseRecords: ExpenseRecord[];
  members: Member[];
}

export type StoreAction =
  | { type: 'HYDRATE'; payload: StoreState }
  | { type: 'ADD_HORSE'; payload: Horse }
  | { type: 'ADD_CLEAN_RECORD'; payload: CleanRecord }
  | { type: 'ADD_FEEDING_RECORD'; payload: FeedingRecord }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'ADD_EXPENSE_RECORD'; payload: ExpenseRecord };

const initialState: StoreState = {
  horses: initialHorses,
  cleanRecords: initialCleanRecords,
  feedingRecords: initialFeedingRecords,
  equipment: initialEquipment,
  events: events.length ? events : initialEvents,
  expenseRecords: initialExpenseRecords,
  members: initialMembers,
};

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'HYDRATE':
      return { ...action.payload };

    case 'ADD_HORSE':
      return { ...state, horses: [action.payload, ...state.horses] };

    case 'ADD_CLEAN_RECORD':
      return { ...state, cleanRecords: [action.payload, ...state.cleanRecords] };

    case 'ADD_FEEDING_RECORD':
      return { ...state, feedingRecords: [action.payload, ...state.feedingRecords] };

    case 'UPDATE_EQUIPMENT':
      return {
        ...state,
        equipment: state.equipment.map((eq) =>
          eq.id === action.payload.id ? action.payload : eq
        ),
      };

    case 'UPDATE_EVENT':
      return {
        ...state,
        events: state.events.map((ev) =>
          ev.id === action.payload.id ? action.payload : ev
        ),
      };

    case 'ADD_EXPENSE_RECORD':
      return { ...state, expenseRecords: [action.payload, ...state.expenseRecords] };

    default:
      return state;
  }
}

interface StoreContextValue {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  addCleanRecord: (record: Omit<CleanRecord, 'id'>) => void;
  addFeedingRecord: (record: Omit<FeedingRecord, 'id'>) => void;
  rentEquipment: (
    equipmentId: string,
    memberId: string,
    memberName: string,
    hours: number,
    quantity: number
  ) => { success: boolean; message: string };
  registerForEvent: (
    eventId: string,
    memberId: string,
    memberName: string
  ) => { success: boolean; message: string };
  addHorse: (horse: Omit<Horse, 'id'>) => void;
  getExpenseById: (id: string) => ExpenseRecord | undefined;
  getEventById: (id: string) => Event | undefined;
  getEquipmentById: (id: string) => Equipment | undefined;
  getMemberById: (id: string) => Member | undefined;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);
  const [isHydrated, setIsHydrated] = React.useState(false);

  useEffect(() => {
    const hydrate = async () => {
      try {
        const saved = await Taro.getStorageSync(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as StoreState;
          const merged: StoreState = {
            horses: parsed.horses?.length ? parsed.horses : initialHorses,
            cleanRecords: parsed.cleanRecords?.length ? parsed.cleanRecords : initialCleanRecords,
            feedingRecords: parsed.feedingRecords?.length ? parsed.feedingRecords : initialFeedingRecords,
            equipment: parsed.equipment?.length ? parsed.equipment : initialEquipment,
            events: parsed.events?.length ? parsed.events : (events.length ? events : initialEvents),
            expenseRecords: parsed.expenseRecords?.length ? parsed.expenseRecords : initialExpenseRecords,
            members: parsed.members?.length ? parsed.members : initialMembers,
          };
          dispatch({ type: 'HYDRATE', payload: merged });
          console.log('[Store] 已从本地存储恢复数据');
        }
      } catch (err) {
        console.error('[Store] 恢复数据失败:', err);
      } finally {
        setIsHydrated(true);
      }
    };
    hydrate();
  }, []);

  useEffect(() => {
    if (isHydrated) {
      try {
        Taro.setStorageSync(STORAGE_KEY, JSON.stringify(state));
        console.log('[Store] 数据已持久化');
      } catch (err) {
        console.error('[Store] 持久化失败:', err);
      }
    }
  }, [state, isHydrated]);

  const generateId = useCallback(() => {
    return Date.now().toString() + Math.random().toString(36).slice(2, 7);
  }, []);

  const formatDate = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const formatDateTime = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }, []);

  const addCleanRecord = useCallback((record: Omit<CleanRecord, 'id'>) => {
    const newRecord: CleanRecord = { ...record, id: generateId() };
    dispatch({ type: 'ADD_CLEAN_RECORD', payload: newRecord });
    console.log('[Store] 新增清扫记录:', newRecord);
  }, [generateId]);

  const addFeedingRecord = useCallback((record: Omit<FeedingRecord, 'id'>) => {
    const newRecord: FeedingRecord = { ...record, id: generateId() };
    dispatch({ type: 'ADD_FEEDING_RECORD', payload: newRecord });
    console.log('[Store] 新增投喂记录:', newRecord);
  }, [generateId]);

  const rentEquipment = useCallback(
    (
      equipmentId: string,
      memberId: string,
      memberName: string,
      hours: number,
      quantity: number
    ): { success: boolean; message: string } => {
      const equipment = state.equipment.find((eq) => eq.id === equipmentId);
      if (!equipment) {
        return { success: false, message: '装备不存在' };
      }
      if (equipment.availableQuantity < quantity) {
        return { success: false, message: `库存不足，仅剩 ${equipment.availableQuantity} 件` };
      }
      if (quantity <= 0 || hours <= 0) {
        return { success: false, message: '数量和时长必须大于0' };
      }

      const totalAmount = equipment.pricePerHour * hours * quantity;

      const updatedEquipment: Equipment = {
        ...equipment,
        availableQuantity: equipment.availableQuantity - quantity,
        status: equipment.availableQuantity - quantity === 0 ? '已租出' : equipment.status,
      };
      dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });

      const newExpense: ExpenseRecord = {
        id: generateId(),
        memberId,
        memberName,
        type: '装备租赁',
        amount: totalAmount,
        date: formatDateTime(),
        description: `${equipment.name}租赁 ${quantity}件 × ${hours}小时`,
        paymentMethod: '微信支付',
        status: '已支付',
        relatedId: equipment.id,
      };
      dispatch({ type: 'ADD_EXPENSE_RECORD', payload: newExpense });

      console.log('[Store] 装备租赁成功:', { equipment, totalAmount, newExpense });
      return { success: true, message: `租赁成功！共 ${totalAmount} 元` };
    },
    [state.equipment, generateId, formatDateTime]
  );

  const registerForEvent = useCallback(
    (
      eventId: string,
      memberId: string,
      memberName: string
    ): { success: boolean; message: string } => {
      const event = state.events.find((ev) => ev.id === eventId);
      if (!event) {
        return { success: false, message: '活动不存在' };
      }
      const remaining = event.maxParticipants - event.currentParticipants;
      if (remaining <= 0) {
        return { success: false, message: '该活动已报满' };
      }
      if (event.status !== '报名中') {
        return { success: false, message: `当前状态：${event.status}，不可报名` };
      }

      const updatedEvent: Event = {
        ...event,
        currentParticipants: event.currentParticipants + 1,
      };
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });

      if (event.price > 0) {
        const newExpense: ExpenseRecord = {
          id: generateId(),
          memberId,
          memberName,
          type: '赛事报名',
          amount: event.price,
          date: formatDateTime(),
          description: `${event.name} 报名费`,
          paymentMethod: '微信支付',
          status: '已支付',
          relatedId: event.id,
        };
        dispatch({ type: 'ADD_EXPENSE_RECORD', payload: newExpense });
      }

      console.log('[Store] 活动报名成功:', { event, memberName });
      return {
        success: true,
        message:
          event.price > 0
            ? `报名成功！已支付 ${event.price} 元`
            : '报名成功！',
      };
    },
    [state.events, generateId, formatDateTime]
  );

  const addHorse = useCallback((horse: Omit<Horse, 'id'>) => {
    const newHorse: Horse = { ...horse, id: generateId() };
    dispatch({ type: 'ADD_HORSE', payload: newHorse });
    console.log('[Store] 新增马匹:', newHorse);
  }, [generateId]);

  const getExpenseById = useCallback(
    (id: string) => state.expenseRecords.find((r) => r.id === id),
    [state.expenseRecords]
  );

  const getEventById = useCallback(
    (id: string) => state.events.find((ev) => ev.id === id),
    [state.events]
  );

  const getEquipmentById = useCallback(
    (id: string) => state.equipment.find((eq) => eq.id === id),
    [state.equipment]
  );

  const getMemberById = useCallback(
    (id: string) => state.members.find((m) => m.id === id),
    [state.members]
  );

  const value: StoreContextValue = {
    state,
    dispatch,
    addCleanRecord,
    addFeedingRecord,
    rentEquipment,
    registerForEvent,
    addHorse,
    getExpenseById,
    getEventById,
    getEquipmentById,
    getMemberById,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
