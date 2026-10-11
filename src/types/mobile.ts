export type MobileTab = 'home' | 'profile' | 'leads' | 'shop' | 'more';

export interface MobileCartItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  image_url?: string;
  badge_text?: string;
  card_type?: string;
  custom_name?: string;
}

export interface MobileNotification {
  id: string | number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  type?: 'lead' | 'order' | 'system' | 'milestone';
}

export interface MobileAppointment {
  id: string | number;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  date: string;
  time: string;
  service: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
}
