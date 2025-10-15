import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/styles/UserNotification.module.css';

interface NotificationData {
  id: number;
  type: 'order' | 'payment' | 'promotion' | 'system' | 'shipping';
  title: string;
  description: string;
  time: string;
  isUnread: boolean;
  icon: string;
  actions: {
    primary?: {
      text: string;
      action: string;
    };
    secondary?: {
      text: string;
      action: string;
    };
  };
}

interface FilterType {
  key: string;
  label: string;
  count?: number;
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationData[]>([
    {
      id: 1,
      type: 'order',
      title: 'Đơn hàng đã được xác nhận',
      description: 'Đơn hàng #DH240001 (iPhone 15 Pro Max 256GB) đã được shop xác nhận và đang chuẩn bị hàng. Dự kiến giao hàng trong 2-3 ngày tới.',
      time: '10 phút trước',
      isUnread: true,
      icon: '📦',
      actions: {
        primary: { text: 'Xem đơn hàng', action: 'viewOrder' },
        secondary: { text: 'Đánh dấu đã đọc', action: 'markAsRead' }
      }
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Flash Sale 12.12 - Giảm đến 50%',
      description: 'Siêu sale cuối năm đã bắt đầu! Hàng ngàn sản phẩm công nghệ giảm giá sốc. Voucher 200K cho đơn từ 500K. Nhanh tay kẻo hết!',
      time: '1 giờ trước',
      isUnread: true,
      icon: '🎯',
      actions: {
        primary: { text: 'Xem ngay', action: 'viewPromotion' },
        secondary: { text: 'Đánh dấu đã đọc', action: 'markAsRead' }
      }
    },
    {
      id: 3,
      type: 'shipping',
      title: 'Đơn hàng đang được giao',
      description: 'Đơn hàng #DH239995 (MacBook Air M2) đang trên đường giao đến bạn. Shipper sẽ liên hệ trước khi giao hàng 30 phút.',
      time: '2 giờ trước',
      isUnread: true,
      icon: '🚚',
      actions: {
        primary: { text: 'Theo dõi', action: 'trackOrder' },
        secondary: { text: 'Đánh dấu đã đọc', action: 'markAsRead' }
      }
    },
    {
      id: 4,
      type: 'payment',
      title: 'Hoàn tiền thành công',
      description: 'Đơn hàng #DH239990 đã được hoàn tiền 1.299.000₫ về ví Shop247 của bạn. Bạn có thể sử dụng số tiền này để mua sắm ngay.',
      time: '1 ngày trước',
      isUnread: true,
      icon: '💰',
      actions: {
        primary: { text: 'Xem ví', action: 'viewWallet' },
        secondary: { text: 'Đánh dấu đã đọc', action: 'markAsRead' }
      }
    },
    {
      id: 5,
      type: 'order',
      title: 'Đánh giá sản phẩm',
      description: 'Bạn đã nhận được sản phẩm AirPods Pro 2. Hãy chia sẻ trải nghiệm của bạn để giúp người mua khác và nhận xu thưởng!',
      time: '2 ngày trước',
      isUnread: false,
      icon: '📦',
      actions: {
        primary: { text: 'Đánh giá', action: 'writeReview' }
      }
    },
    {
      id: 6,
      type: 'system',
      title: 'Cập nhật chính sách bảo mật',
      description: 'Shop247 đã cập nhật chính sách bảo mật để bảo vệ thông tin cá nhân của bạn tốt hơn. Vui lòng xem chi tiết các thay đổi.',
      time: '3 ngày trước',
      isUnread: false,
      icon: '⚙️',
      actions: {
        primary: { text: 'Xem chi tiết', action: 'viewPolicy' }
      }
    },
    {
      id: 7,
      type: 'promotion',
      title: 'Voucher sinh nhật đặc biệt',
      description: 'Chúc mừng sinh nhật! Shop247 tặng bạn voucher giảm 15% tối đa 300K cho tất cả sản phẩm. Voucher có hiệu lực đến hết tháng này.',
      time: '1 tuần trước',
      isUnread: true,
      icon: '🎁',
      actions: {
        primary: { text: 'Nhận voucher', action: 'claimVoucher' },
        secondary: { text: 'Đánh dấu đã đọc', action: 'markAsRead' }
      }
    },
    {
      id: 8,
      type: 'order',
      title: 'Giao hàng thành công',
      description: 'Đơn hàng #DH239988 (Samsung Galaxy S24 Ultra) đã được giao thành công. Cảm ơn bạn đã tin tưởng mua sắm tại Shop247!',
      time: '1 tuần trước',
      isUnread: true,
      icon: '✅',
      actions: {
        primary: { text: 'Xem đơn hàng', action: 'viewOrder' },
        secondary: { text: 'Đánh dấu đã đọc', action: 'markAsRead' }
      }
    }
  ]);

  const [activeFilter, setActiveFilter] = useState<string>('all');

  const filters: FilterType[] = [
    { key: 'all', label: 'Tất cả' },
    { key: 'unread', label: 'Chưa đọc', count: notifications.filter(n => n.isUnread).length },
    { key: 'order', label: 'Đơn hàng' },
    { key: 'promotion', label: 'Khuyến mãi' },
    { key: 'payment', label: 'Thanh toán' },
    { key: 'shipping', label: 'Vận chuyển' },
    { key: 'system', label: 'Hệ thống' }
  ];

  const getFilteredNotifications = (): NotificationData[] => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter(n => n.isUnread);
    return notifications.filter(n => n.type === activeFilter);
  };

  const getStats = () => {
    const unreadCount = notifications.filter(n => n.isUnread).length;
    const orderCount = notifications.filter(n => n.type === 'order').length;
    const promotionCount = notifications.filter(n => n.type === 'promotion').length;
    const systemCount = notifications.filter(n => n.type === 'system').length;

    return { unreadCount, orderCount, promotionCount, systemCount };
  };

  const markAsRead = (id: number): void => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, isUnread: false }
          : notification
      )
    );
    showToast('Đã đánh dấu thông báo là đã đọc', 'success');
  };

  const markAllAsRead = (): void => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isUnread: false }))
    );
    showToast('Đã đánh dấu tất cả thông báo là đã đọc', 'success');
  };

  const handleNotificationAction = (id: number, action: string): void => {
    switch (action) {
      case 'viewOrder':
        markAsRead(id);
        showToast('Đang chuyển đến trang đơn hàng...', 'info');
        break;
      case 'viewPromotion':
        markAsRead(id);
        showToast('Đang mở trang khuyến mãi...', 'info');
        break;
      case 'trackOrder':
        markAsRead(id);
        showToast('Đang mở trang theo dõi đơn hàng...', 'info');
        break;
      case 'viewWallet':
        markAsRead(id);
        showToast('Đang mở ví Shop247...', 'info');
        break;
      case 'writeReview':
        showToast('Đang mở trang đánh giá sản phẩm...', 'info');
        break;
      case 'viewPolicy':
        showToast('Đang mở chính sách bảo mật...', 'info');
        break;
      case 'claimVoucher':
        markAsRead(id);
        showToast('Voucher đã được lưu vào kho voucher của bạn!', 'success');
        break;
      case 'markAsRead':
        markAsRead(id);
        break;
      default:
        console.log(`Action ${action} not handled`);
    }
  };

  const showToast = (message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info'): void => {
    // In a real app, you would use a toast library like react-toastify
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const getTypeLabel = (type: string): string => {
    const labels = {
      order: 'Đơn hàng',
      payment: 'Thanh toán',
      promotion: 'Khuyến mãi',
      system: 'Hệ thống',
      shipping: 'Vận chuyển'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeColor = (type: string): string => {
    const colors = {
      order: 'text-blue-600',
      payment: 'text-green-600',
      promotion: 'text-pink-600',
      system: 'text-purple-600',
      shipping: 'text-yellow-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const stats = getStats();
  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="shopee-bg min-h-screen">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <main className="w-full">
          {/* Page Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Thông báo</h1>
                <p className="text-gray-600">Cập nhật mới nhất về đơn hàng, khuyến mãi và hoạt động tài khoản</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={markAllAsRead}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <span>✓</span>
                  <span>Đánh dấu đã đọc tất cả</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Chưa đọc</p>
                    <p className="text-2xl font-bold text-red-600">{stats.unreadCount}</p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600">🔔</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Đơn hàng</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.orderCount}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600">📦</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Khuyến mãi</p>
                    <p className="text-2xl font-bold text-green-600">{stats.promotionCount}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600">🎯</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600">Hệ thống</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.systemCount}</p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600">⚙️</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key)}
                  className={`notification-filter ${activeFilter === filter.key ? 'active' : ''}`}
                >
                  {filter.label}
                  {filter.count !== undefined && filter.count > 0 && ` (${filter.count})`}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div>
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification, index) => (
                  <div
                    key={notification.id}
                    className={`notification-item p-4 ${index !== filteredNotifications.length - 1 ? 'border-b border-gray-100' : ''} flex items-start space-x-4 ${notification.isUnread ? 'unread' : ''}`}
                    data-type={notification.type}
                  >
                    {notification.isUnread && <div className="notification-badge"></div>}
                    <div className={`notification-icon ${notification.type}`}>
                      {notification.icon}
                    </div>
                    <div className="notification-content">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="notification-title">{notification.title}</h3>
                          <p className="notification-description">{notification.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="notification-time">{notification.time}</span>
                            <span className={`text-xs ${getTypeColor(notification.type)}`}>
                              {getTypeLabel(notification.type)}
                            </span>
                          </div>
                        </div>
                        <div className="notification-actions flex items-center space-x-2">
                          {notification.actions.primary && (
                            <button
                              onClick={() => handleNotificationAction(notification.id, notification.actions.primary!.action)}
                              className={`${getTypeColor(notification.type)} hover:opacity-80 text-sm`}
                            >
                              {notification.actions.primary.text}
                            </button>
                          )}
                          {notification.actions.secondary && (
                            <button
                              onClick={() => handleNotificationAction(notification.id, notification.actions.secondary!.action)}
                              className="text-green-600 hover:text-green-800 text-sm"
                            >
                              {notification.actions.secondary.text}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <div className="text-6xl mb-4">🔔</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Không có thông báo</h3>
                  <p className="text-gray-500">Chưa có thông báo nào phù hợp với bộ lọc của bạn.</p>
                </div>
              )}
            </div>

            {/* Load More */}
            {filteredNotifications.length > 0 && (
              <div className="p-4 text-center border-t">
                <button className="text-shopee-orange hover:text-orange-700 font-medium">
                  Xem thêm thông báo
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Notifications;