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
  EquipmentRental,
  EventRegistrant,
} from '@/types';
import { horses as initialHorses } from '@/data/horses';
import {
  cleanRecords as initialCleanRecords,
  feedingRecords as initialFeedingRecords,
  equipmentList as initialEquipment,
} from '@/data/stables';
import { events as initialEvents, expenseRecords as initialExpenseRecords, members as initialMembers } from '@/data/members';
import { events } from '@/data/events';

const STORAGE_KEY = 'equestrian_club_store_v2';

export interface StoreState {
  horses: Horse[];
  cleanRecords: CleanRecord[];
  feedingRecords: FeedingRecord[];
  equipment: Equipment[];
  events: Event[];
  expenseRecords: ExpenseRecord[];
  members: Member[];
  rentals: EquipmentRental[];
}

export type StoreAction =
  | { type: 'HYDRATE'; payload: StoreState }
  | { type: 'ADD_HORSE'; payload: Horse }
  | { type: 'ADD_CLEAN_RECORD'; payload: CleanRecord }
  | { type: 'ADD_FEEDING_RECORD'; payload: FeedingRecord }
  | { type: 'UPDATE_EQUIPMENT'; payload: Equipment }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'ADD_EXPENSE_RECORD'; payload: ExpenseRecord }
  | { type: 'UPDATE_MEMBER'; payload: Member }
  | { type: 'ADD_RENTAL'; payload: EquipmentRental }
  | { type: 'UPDATE_RENTAL'; payload: EquipmentRental };

const initialRentals: EquipmentRental[] = [];

const initialState: StoreState = {
  horses: initialHorses,
  cleanRecords: initialCleanRecords,
  feedingRecords: initialFeedingRecords,
  equipment: initialEquipment,
  events: events.length ? events : initialEvents,
  expenseRecords: initialExpenseRecords,
  members: initialMembers,
  rentals: initialRentals,
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

    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map((m) =>
          m.id === action.payload.id ? action.payload : m
        ),
      };

    case 'ADD_RENTAL':
      return { ...state, rentals: [action.payload, ...state.rentals] };

    case 'UPDATE_RENTAL':
      return {
        ...state,
        rentals: state.rentals.map((r) =>
          r.id === action.payload.id ? action.payload : r
        ),
      };

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
  ) => { success: boolean; message: string; rentalId?: string };
  returnEquipment: (rentalId: string) => { success: boolean; message: string };
  registerForEvent: (
    eventId: string,
    memberId: string,
    memberName: string
  ) => { success: boolean; message: string };
  cancelRegistration: (
    eventId: string,
    memberId: string
  ) => { success: boolean; message: string };
  addHorse: (horse: Omit<Horse, 'id'>) => void;
  rechargeMember: (memberId: string, amount: number, paymentMethod: ExpenseRecord['paymentMethod']) => { success: boolean; message: string };
  deductMemberHours: (memberId: string, hours: number, description: string) => { success: boolean; message: string };
  getExpenseById: (id: string) => ExpenseRecord | undefined;
  getEventById: (id: string) => Event | undefined;
  getEquipmentById: (id: string) => Equipment | undefined;
  getMemberById: (id: string) => Member | undefined;
  getRentalById: (id: string) => EquipmentRental | undefined;
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
            rentals: parsed.rentals?.length ? parsed.rentals : initialRentals,
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
    return `${y}-${m}-${d} ${hh}:${mm}`;
  }, []);

  const addCleanRecord = useCallback((record: Omit<CleanRecord, 'id'>) => {
    const newRecord: CleanRecord = { ...record, id: generateId() };
    dispatch({ type: 'ADD_CLEAN_RECORD', payload: newRecord });
  }, [generateId]);

  const addFeedingRecord = useCallback((record: Omit<FeedingRecord, 'id'>) => {
    const newRecord: FeedingRecord = { ...record, id: generateId() };
    dispatch({ type: 'ADD_FEEDING_RECORD', payload: newRecord });
  }, [generateId]);

  const rentEquipment = useCallback(
    (
      equipmentId: string,
      memberId: string,
      memberName: string,
      hours: number,
      quantity: number
    ): { success: boolean; message: string; rentalId?: string } => {
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
      const now = formatDateTime();
      const expenseId = generateId();
      const rentalId = generateId();

      const updatedEquipment: Equipment = {
        ...equipment,
        availableQuantity: equipment.availableQuantity - quantity,
        status: equipment.availableQuantity - quantity === 0 ? '已租出' : equipment.status,
      };
      dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });

      const newExpense: ExpenseRecord = {
        id: expenseId,
        memberId,
        memberName,
        type: '装备租赁',
        amount: totalAmount,
        date: now,
        time: now.split(' ')[1],
        description: `${equipment.name}租赁 ${quantity}件 × ${hours}小时`,
        paymentMethod: '微信支付',
        status: '已支付',
        relatedId: equipment.id,
        item: equipment.name,
        hours,
        quantity,
      };
      dispatch({ type: 'ADD_EXPENSE_RECORD', payload: newExpense });

      const newRental: EquipmentRental = {
        id: rentalId,
        equipmentId: equipment.id,
        equipmentName: equipment.name,
        memberId,
        memberName,
        quantity,
        hours,
        totalAmount,
        rentTime: now,
        status: '租赁中',
        expenseId,
      };
      dispatch({ type: 'ADD_RENTAL', payload: newRental });

      return { success: true, message: `租赁成功！共 ${totalAmount} 元`, rentalId };
    },
    [state.equipment, generateId, formatDateTime]
  );

  const returnEquipment = useCallback(
    (rentalId: string): { success: boolean; message: string } => {
      const rental = state.rentals.find((r) => r.id === rentalId);
      if (!rental) {
        return { success: false, message: '租赁记录不存在' };
      }
      if (rental.status === '已归还') {
        return { success: false, message: '该装备已归还' };
      }

      const equipment = state.equipment.find((eq) => eq.id === rental.equipmentId);
      if (equipment) {
        const updatedEquipment: Equipment = {
          ...equipment,
          availableQuantity: equipment.availableQuantity + rental.quantity,
          status: equipment.availableQuantity + rental.quantity > 0 ? '可租赁' : equipment.status,
        };
        dispatch({ type: 'UPDATE_EQUIPMENT', payload: updatedEquipment });
      }

      const updatedRental: EquipmentRental = {
        ...rental,
        status: '已归还',
        returnTime: formatDateTime(),
      };
      dispatch({ type: 'UPDATE_RENTAL', payload: updatedRental });

      return { success: true, message: '归还成功，库存已恢复' };
    },
    [state.rentals, state.equipment, formatDateTime]
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

      const registrants: EventRegistrant[] = event.registrants ? [...event.registrants] : [];
      if (registrants.find((r) => r.memberId === memberId && !r.cancelled)) {
        return { success: false, message: '该会员已报名' };
      }

      const now = formatDateTime();
      let expenseId: string | undefined;

      if (event.price > 0) {
        expenseId = generateId();
        const newExpense: ExpenseRecord = {
          id: expenseId,
          memberId,
          memberName,
          type: '赛事报名',
          amount: event.price,
          date: now,
          time: now.split(' ')[1],
          description: `${event.name} 报名费`,
          paymentMethod: '微信支付',
          status: '已支付',
          relatedId: event.id,
          item: event.name,
        };
        dispatch({ type: 'ADD_EXPENSE_RECORD', payload: newExpense });
      }

      registrants.push({
        memberId,
        memberName,
        registerTime: now,
        expenseId,
      });

      const updatedEvent: Event = {
        ...event,
        currentParticipants: event.currentParticipants + 1,
        registrants,
      };
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });

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

  const cancelRegistration = useCallback(
    (eventId: string, memberId: string): { success: boolean; message: string } => {
      const event = state.events.find((ev) => ev.id === eventId);
      if (!event) {
        return { success: false, message: '活动不存在' };
      }

      const registrants = event.registrants ? [...event.registrants] : [];
      const targetIdx = registrants.findIndex((r) => r.memberId === memberId && !r.cancelled);
      if (targetIdx < 0) {
        return { success: false, message: '未找到该会员的报名记录' };
      }

      const now = formatDateTime();
      const target = registrants[targetIdx];
      registrants[targetIdx] = { ...target, cancelled: true, cancelTime: now };

      // 如果有报名费且已支付，生成退款记录
      if (target.expenseId && event.price > 0) {
        const refundExpense: ExpenseRecord = {
          id: generateId(),
          memberId: target.memberId,
          memberName: target.memberName,
          type: '赛事退款',
          amount: event.price,
          date: now,
          time: now.split(' ')[1],
          description: `${event.name} 报名费退款`,
          paymentMethod: '微信支付',
          status: '已退款',
          relatedId: event.id,
          item: event.name,
          remark: `原订单号: ${target.expenseId}`,
        };
        dispatch({ type: 'ADD_EXPENSE_RECORD', payload: refundExpense });
      }

      const updatedEvent: Event = {
        ...event,
        currentParticipants: Math.max(0, event.currentParticipants - 1),
        registrants,
      };
      dispatch({ type: 'UPDATE_EVENT', payload: updatedEvent });

      return { success: true, message: '报名已取消，名额已恢复' };
    },
    [state.events, generateId, formatDateTime]
  );

  const addHorse = useCallback((horse: Omit<Horse, 'id'>) => {
    const newHorse: Horse = { ...horse, id: generateId() };
    dispatch({ type: 'ADD_HORSE', payload: newHorse });
  }, [generateId]);

  const rechargeMember = useCallback(
    (memberId: string, amount: number, paymentMethod: ExpenseRecord['paymentMethod']): { success: boolean; message: string } => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) {
        return { success: false, message: '会员不存在' };
      }
      if (!amount || amount <= 0) {
        return { success: false, message: '充值金额必须大于0' };
      }

      const now = formatDateTime();
      const updatedMember: Member = {
        ...member,
        totalSpent: member.totalSpent + amount,
      };
      dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember });

      const expense: ExpenseRecord = {
        id: generateId(),
        memberId,
        memberName: member.name,
        type: '会员充值',
        amount,
        date: now,
        time: now.split(' ')[1],
        description: `会员充值 ¥${amount}`,
        paymentMethod,
        status: '已支付',
        relatedId: memberId,
      };
      dispatch({ type: 'ADD_EXPENSE_RECORD', payload: expense });

      return { success: true, message: `充值成功！充值金额 ¥${amount}` };
    },
    [state.members, generateId, formatDateTime]
  );

  const deductMemberHours = useCallback(
    (memberId: string, hours: number, description: string): { success: boolean; message: string } => {
      const member = state.members.find((m) => m.id === memberId);
      if (!member) {
        return { success: false, message: '会员不存在' };
      }
      if (!hours || hours <= 0) {
        return { success: false, message: '扣减课时必须大于0' };
      }
      if (member.remainingHours < hours) {
        return { success: false, message: `课时不足，剩余仅 ${member.remainingHours} 节` };
      }

      const now = formatDateTime();
      const updatedMember: Member = {
        ...member,
        remainingHours: member.remainingHours - hours,
      };
      dispatch({ type: 'UPDATE_MEMBER', payload: updatedMember });

      const expense: ExpenseRecord = {
        id: generateId(),
        memberId,
        memberName: member.name,
        type: '课时扣减',
        amount: 0,
        date: now,
        time: now.split(' ')[1],
        description: description || `课时扣减 ${hours} 节`,
        paymentMethod: '会员卡',
        status: '已支付',
        relatedId: memberId,
        hours,
      };
      dispatch({ type: 'ADD_EXPENSE_RECORD', payload: expense });

      return { success: true, message: `扣减成功！剩余课时 ${updatedMember.remainingHours} 节` };
    },
    [state.members, generateId, formatDateTime]
  );

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

  const getRentalById = useCallback(
    (id: string) => state.rentals.find((r) => r.id === id),
    [state.rentals]
  );

  const value: StoreContextValue = {
    state,
    dispatch,
    addCleanRecord,
    addFeedingRecord,
    rentEquipment,
    returnEquipment,
    registerForEvent,
    cancelRegistration,
    addHorse,
    rechargeMember,
    deductMemberHours,
    getExpenseById,
    getEventById,
    getEquipmentById,
    getMemberById,
    getRentalById,
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
