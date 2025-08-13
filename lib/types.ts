
import { Role, TaskStatus, TaskPriority, PaymentStatus, OrderStatus, TransactionType } from "@prisma/client";

export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: Role;
  country?: string | null;
  isActive: boolean;
  isWorking: boolean;
  totalHoursToday: number;
  weeklyTarget: number;
  salary?: number | null;
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  attachments: string[];
  assignedTo: User;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  productName: string;
  platform: string;
  accountData?: string | null;
  customerInfo?: string | null;
  price: number;
  cost?: number | null;
  profit?: number | null;
  status: OrderStatus;
  atClient?: User | null;
  createdAt: Date;
  updatedAt: Date;
  paymentConfirmation?: PaymentConfirmation | null;
}

export interface PaymentConfirmation {
  id: string;
  orderId: string;
  proofImage: string;
  amount: number;
  paymentMethod: string;
  status: PaymentStatus;
  notes?: string | null;
  uploadedBy: User;
  reviewedAt?: Date | null;
  reviewNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardStats {
  totalEmployees?: number;
  activeEmployees?: number;
  todayRevenue?: number;
  weeklyRevenue?: number;
  monthlyRevenue?: number;
  pendingTasks?: number;
  completedTasks?: number;
  pendingPayments?: number;
  totalOrders?: number;
}

export * from "@prisma/client";
