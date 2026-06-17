export interface Horse {
  id: string;
  name: string;
  breed: string;
  age: number;
  gender: '公' | '母';
  color: string;
  birthDate: string;
  origin: string;
  height: number;
  weight: number;
  stableNo: string;
  trainer: string;
  status: '健康' | '训练中' | '休息' | '治疗中';
  avatar: string;
  description?: string;
  purchaseDate: string;
  lastHealthCheck: string;
  nextHealthCheck: string;
}

export interface HealthRecord {
  id: string;
  horseId: string;
  horseName: string;
  type: '钉蹄' | '兽医诊疗' | '体检' | '驱虫' | '疫苗';
  date: string;
  veterinarian?: string;
  farrier?: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  cost: number;
  nextVisit?: string;
  status: '已完成' | '进行中' | '待处理';
  notes?: string;
}

export interface Coach {
  id: string;
  name: string;
  avatar: string;
  title: string;
  specialty: string[];
  experience: number;
  rating: number;
  phone: string;
  status: '在职' | '休假' | '离职';
}

export interface Course {
  id: string;
  name: string;
  coachId: string;
  coachName: string;
  type: '基础骑乘' | '进阶训练' | '场地障碍' | '盛装舞步' | '西部驭马';
  level: '初级' | '中级' | '高级';
  duration: number;
  price: number;
  maxStudents: number;
  currentStudents: number;
  schedule: string[];
  status: '可预约' | '已满员' | '已取消';
  description?: string;
}

export interface CourseSchedule {
  id: string;
  courseId: string;
  courseName: string;
  coachId: string;
  coachName: string;
  date: string;
  startTime: string;
  endTime: string;
  venue: string;
  maxStudents: number;
  currentStudents: number;
  status: '待上课' | '进行中' | '已完成' | '已取消';
}

export interface Member {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  memberLevel: '普通会员' | '银卡会员' | '金卡会员' | '钻石会员';
  joinDate: string;
  expiryDate: string;
  totalHours: number;
  remainingHours: number;
  totalSpent: number;
  status: '正常' | '冻结' | '过期';
  address?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
}

export interface MemberCard {
  id: string;
  memberId: string;
  memberName: string;
  type: '次卡' | '月卡' | '季卡' | '年卡';
  totalHours: number;
  remainingHours: number;
  purchaseDate: string;
  expiryDate: string;
  price: number;
  status: '有效' | '已用完' | '已过期';
}

export interface Stable {
  id: string;
  stableNo: string;
  horseId?: string;
  horseName?: string;
  size: string;
  lastCleanDate: string;
  nextCleanDate: string;
  beddingType: string;
  status: '已占用' | '空置' | '维修中';
  notes?: string;
}

export interface FeedingRecord {
  id: string;
  stableId?: string;
  stableNo?: string;
  horseId: string;
  horseName: string;
  date: string;
  time: string;
  feedType: string;
  quantity: number;
  operator: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: '马鞍' | '缰绳' | '头盔' | '护具' | '马靴' | '其他';
  brand: string;
  size: string;
  quantity: number;
  availableQuantity: number;
  pricePerHour: number;
  status: '可租赁' | '已租出' | '维修中';
  image?: string;
}

export interface Event {
  id: string;
  name: string;
  type: '马术考级' | '赛事活动' | '马场参观';
  date: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  price: number;
  registrationDeadline: string;
  status: '报名中' | '已截止' | '已结束';
  description: string;
  requirements?: string;
  registrants?: EventRegistrant[];
}

export interface EventRegistrant {
  memberId: string;
  memberName: string;
  registerTime: string;
  expenseId?: string;
  cancelled?: boolean;
  cancelTime?: string;
}

export interface EquipmentRental {
  id: string;
  equipmentId: string;
  equipmentName: string;
  memberId: string;
  memberName: string;
  quantity: number;
  hours: number;
  totalAmount: number;
  rentTime: string;
  status: '租赁中' | '已归还';
  returnTime?: string;
  expenseId?: string;
}

export interface ExpenseRecord {
  id: string;
  memberId: string;
  memberName: string;
  type: '课程消费' | '装备租赁' | '赛事报名' | '商品购买' | '其他' | '会员充值' | '课时扣减' | '赛事退款';
  amount: number;
  date: string;
  time?: string;
  description: string;
  paymentMethod: '微信支付' | '支付宝' | '银行卡' | '会员卡' | '现金';
  status: '已支付' | '待支付' | '已退款';
  relatedId?: string;
  hours?: number;
  quantity?: number;
  item?: string;
  remark?: string;
}

export interface CleanRecord {
  id: string;
  stableId: string;
  stableNo: string;
  horseId?: string;
  horseName?: string;
  date: string;
  time: string;
  operator: string;
  items: string[];
  status: '已完成' | '进行中';
  notes?: string;
}

export interface QuickEntryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  path: string;
}

export interface StatItem {
  label: string;
  value: string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
}
