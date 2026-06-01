import {
  ClipboardList,
  Factory,
  LayoutDashboard,
  MessagesSquare,
  Package,
  Settings,
  ShoppingCart,
  TrendingUp,
  UserCircle2,
  Users,
  Wallet,
} from 'lucide-react';

export const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'CS Dashboard', href: '/cs-dashboard', icon: ClipboardList },
  { title: 'Konsumen', href: '/konsumen', icon: Users },
  { title: 'Penjualan', href: '/penjualan', icon: ShoppingCart },
  { title: 'Production Control', href: '/production-control', icon: Factory },
  { title: 'Forum Diskusi', href: '/forum-diskusi', icon: MessagesSquare },
  { title: 'Belanja Bahan', href: '/belanja-bahan', icon: Package },
  { title: 'Affiliate Sales', href: '/affiliate-sales', icon: TrendingUp },
  { title: 'Keuangan', href: '/keuangan', icon: Wallet },
  { title: 'Pengaturan', href: '/pengaturan', icon: Settings },
  { title: 'Profil', href: '/profil', icon: UserCircle2 },
] as const;

