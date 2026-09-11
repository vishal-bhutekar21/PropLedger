// PropLedger TypeScript type definitions

export interface User {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  roles: string[];
  lastLogin?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface Property {
  propertyId: number;
  ownerId: number;
  ownerName: string;
  propertyName: string;
  propertyType: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  status: string;
  totalUnits?: number;
  occupiedUnits?: number;
  vacantUnits?: number;
  occupancyRate?: number;
  yearBuilt?: number;
  totalAreaSqft?: number | string;
  description?: string;
  buildings?: any[];
  createdAt: string;
}

export interface Unit {
  unitId: number;
  buildingId: number;
  buildingName: string;
  propertyId: number;
  propertyName: string;
  unitNumber: string;
  unitType: string;
  floorNumber?: number;
  bedrooms: number;
  bathrooms: number;
  areaSqft?: number;
  monthlyRent: number;
  securityDeposit: number;
  status: string;
  createdAt: string;
}

export interface Tenant {
  tenantId: number;
  fullName: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  nationalId?: string;
  status: string;
  city?: string;
  state?: string;
  createdAt: string;
}

export interface Lease {
  leaseId: number;
  leaseNumber?: string;
  unitId: number;
  unitNumber: string;
  buildingName: string;
  propertyName: string;
  tenantId: number;
  tenantName: string;
  tenantEmail: string;
  monthlyRent: number;
  rentAmount?: number;
  securityDeposit: number;
  paymentDueDay: number;
  startDate: string;
  endDate: string;
  status: string;
  isRenewal: boolean;
  createdAt: string;
}

export interface Invoice {
  invoiceId: number;
  leaseId: number;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  status: string;
  items?: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  itemId: number;
  description: string;
  itemType: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Payment {
  paymentId: number;
  invoiceId: number;
  invoiceNumber: string;
  tenantName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  transactionReference?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  expenseId: number;
  propertyId: number;
  propertyName?: string;
  vendorId?: number;
  vendorName?: string;
  category: string;
  description: string;
  amount: number;
  expenseDate: string;
  referenceNumber?: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface Vendor {
  vendorId: number;
  companyName: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  serviceType: string;
  rating?: number;
  status: string;
  taxId?: string;
  address?: string;
  notes?: string;
  createdAt?: string;
}

export interface MaintenanceRequest {
  requestId: number;
  unitId: number;
  unitNumber: string;
  propertyName: string;
  tenantId?: number;
  tenantName?: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  estimatedCost?: number;
  actualCost?: number;
  resolvedAt?: string;
  resolutionNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface DashboardSummary {
  totalProperties: number;
  totalBuildings: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  monthlyRevenue: number;
  outstandingAmount: number;
  maintenanceCost: number;
  netOperatingIncome: number;
  openMaintenanceRequests: number;
  urgentMaintenanceRequests: number;
  activeTenants: number;
  activeLeases: number;
  leasesExpiringIn30Days: number;
  overdueInvoices: number;
}

export interface AuditLog {
  logId: number;
  userId?: number;
  username?: string;
  action: string;
  entityType: string;
  entityId: number;
  description?: string;
  ipAddress?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  createdAt: string;
}

// Filter/pagination types
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  dir?: 'asc' | 'desc';
  search?: string;
}
