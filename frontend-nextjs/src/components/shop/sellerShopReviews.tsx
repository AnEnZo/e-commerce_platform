import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import '../css/sellerShopReviews.css';
import Sidebar from '@/components/shop/Sidebar';

Chart.register(...registerables);

interface Review {
  id: string;
  customerName: string;
  rating: number;
  content: string;
  product: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  hasImages: boolean;
  isReplied: boolean;
  response?: string;
}



interface TemplateOption {
  type: string;
  title: string;
  preview: string;
  content: string;
}

const ShopReviews: React.FC = () => {
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [reviews] = useState<Review[]>([
    {
      id: 'review-1',
      customerName: 'Nguyễn Văn A',
      rating: 1,
      content: 'Sản phẩm không giống mô tả, chất lượng kém. Giao hàng chậm và đóng gói không cẩn thận. Rất thất vọng với shop này!',
      product: 'iPhone 15 Pro Max 256GB',
      timestamp: '2 giờ trước',
      sentiment: 'negative',
      priority: 'high',
      hasImages: true,
      isReplied: false
    },
    {
      id: 'review-2',
      customerName: 'Trần Thị B',
      rating: 3,
      content: 'Sản phẩm ổn, nhưng giao hàng hơi chậm. Hy vọng shop cải thiện thời gian vận chuyển.',
      product: 'MacBook Pro M3 14 inch',
      timestamp: '5 giờ trước',
      sentiment: 'neutral',
      priority: 'medium',
      hasImages: false,
      isReplied: false
    },
    {
      id: 'review-3',
      customerName: 'Lê Văn C',
      rating: 5,
      content: 'Sản phẩm chất lượng tuyệt vời! Giao hàng nhanh, đóng gói cẩn thận. Shop phục vụ rất tốt, sẽ ủng hộ tiếp!',
      product: 'AirPods Pro Gen 2',
      timestamp: '1 ngày trước',
      sentiment: 'positive',
      priority: 'low',
      hasImages: true,
      isReplied: true,
      response: 'Cảm ơn bạn đã tin tưởng và ủng hộ shop! Chúng tôi luôn cố gắng mang đến trải nghiệm mua sắm tốt nhất. 🙏'
    }
  ]);


  const templates: TemplateOption[] = [
    {
      type: 'thank',
      title: 'Cảm ơn đánh giá tích cực',
      preview: 'Cảm ơn bạn đã tin tưởng và ủng hộ shop...',
      content: 'Cảm ơn bạn đã tin tưởng và ủng hộ shop! Chúng tôi luôn cố gắng mang đến trải nghiệm mua sắm tốt nhất cho khách hàng. Hy vọng bạn sẽ tiếp tục ủng hộ shop trong những lần mua sắm tiếp theo. 🙏❤️'
    },
    {
      type: 'apologize',
      title: 'Xin lỗi và giải quyết',
      preview: 'Chúng tôi rất xin lỗi về trải nghiệm không tốt...',
      content: 'Chúng tôi rất xin lỗi về trải nghiệm không tốt này. Shop đã ghi nhận phản hồi của bạn và sẽ liên hệ trực tiếp để giải quyết vấn đề một cách thỏa đáng. Cảm ơn bạn đã góp ý để shop cải thiện dịch vụ tốt hơn.'
    },
    {
      type: 'improve',
      title: 'Cam kết cải thiện',
      preview: 'Cảm ơn góp ý, chúng tôi sẽ cải thiện...',
      content: 'Cảm ơn bạn đã góp ý chân thành. Chúng tôi sẽ cải thiện những điểm bạn đề cập để mang đến trải nghiệm tốt hơn trong lần mua sắm tiếp theo. Shop luôn lắng nghe và trân trọng mọi phản hồi từ khách hàng.'
    }
  ];

  const ratingTrendChartRef = useRef<HTMLCanvasElement>(null);
  const sentimentChartRef = useRef<HTMLCanvasElement>(null);
  const ratingTrendChart = useRef<Chart | null>(null);
  const sentimentChart = useRef<Chart | null>(null);

  useEffect(() => {
    initializeCharts();
    return () => {
      if (ratingTrendChart.current) {
        ratingTrendChart.current.destroy();
      }
      if (sentimentChart.current) {
        sentimentChart.current.destroy();
      }
    };
  }, []);

  const initializeCharts = () => {
    // Rating Trend Chart
    if (ratingTrendChartRef.current) {
      const ctx = ratingTrendChartRef.current.getContext('2d');
      if (ctx) {
        ratingTrendChart.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
            datasets: [{
              label: 'Điểm trung bình',
              data: [4.5, 4.6, 4.4, 4.7, 4.6, 4.8, 4.6],
              borderColor: '#ee4d2d',
              backgroundColor: 'rgba(238, 77, 45, 0.1)',
              tension: 0.4,
              fill: true
            }, {
              label: 'Số lượng đánh giá',
              data: [23, 31, 18, 42, 38, 29, 15],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              yAxisID: 'y1'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: 'index',
              intersect: false,
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                min: 0,
                max: 5,
                title: {
                  display: true,
                  text: 'Điểm trung bình'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Số lượng'
                },
                grid: {
                  drawOnChartArea: false,
                }
              }
            }
          }
        });
      }
    }

    // Sentiment Chart
    if (sentimentChartRef.current) {
      const ctx = sentimentChartRef.current.getContext('2d');
      if (ctx) {
        sentimentChart.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: ['Tích cực', 'Trung tính', 'Tiêu cực'],
            datasets: [{
              data: [75, 20, 5],
              backgroundColor: [
                '#10b981',
                '#6b7280',
                '#ef4444'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }
        });
      }
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={`star ${index >= rating ? 'empty' : ''}`}>
        ★
      </span>
    ));
  };

  const openReplyModal = () => {
    setShowReplyModal(true);
  };

  const closeReplyModal = () => {
    setShowReplyModal(false);
    setReplyContent('');
  };

  const useTemplate = (template: TemplateOption) => {
    setReplyContent(template.content);
  };

  const sendReply = () => {
    if (replyContent.trim()) {
      alert('Gửi trả lời thành công!');
      closeReplyModal();
    } else {
      alert('Vui lòng nhập nội dung trả lời');
    }
  };

  const quickReply = (sentiment: string) => {
    openReplyModal();
    const template = templates.find(t =>
      (sentiment === 'positive' && t.type === 'thank') ||
      (sentiment === 'negative' && t.type === 'apologize') ||
      (sentiment === 'neutral' && t.type === 'improve')
    );
    if (template) {
      setReplyContent(template.content);
    }
  };

  const changeRatingChart = (period: string) => {
    setSelectedPeriod(period);
    console.log(`Changing rating chart to ${period} view`);
  };

  const exportReviews = () => {
    alert('Xuất báo cáo đánh giá thành file Excel');
  };

  const openBulkReply = () => {
    alert('Mở công cụ trả lời hàng loạt cho nhiều đánh giá');
  };

  const openReviewSettings = () => {
    alert('Mở cài đặt quản lý đánh giá và thông báo');
  };

  return (
    <div className="shopee-bg min-h-screen">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar activeKey="shopreviews" />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đánh giá Shop</h1>
              <p className="text-gray-600">Quản lý đánh giá khách hàng và cải thiện uy tín shop</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportReviews}
                className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Xuất báo cáo</span>
              </button>
              <button
                onClick={openBulkReply}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>💬</span>
                <span>Trả lời hàng loạt</span>
              </button>
              <button
                onClick={openReviewSettings}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span>Cài đặt</span>
              </button>
            </div>
          </div>

          {/* Rating Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Overall Rating */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">4.6</div>
                <div className="star-rating justify-center mb-2">
                  {renderStars(5)}
                </div>
                <div className="text-sm text-gray-600 mb-4">Dựa trên 2,847 đánh giá</div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="trend-up text-sm font-medium">↗ +0.2</span>
                  <span className="text-sm text-gray-500">so với tháng trước</span>
                </div>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố đánh giá</h3>
              <div className="space-y-3">
                {[
                  { stars: 5, width: 68, count: 1936 },
                  { stars: 4, width: 22, count: 626 },
                  { stars: 3, width: 7, count: 199 },
                  { stars: 2, width: 2, count: 57 },
                  { stars: 1, width: 1, count: 29 }
                ].map((item) => (
                  <div key={item.stars} className="flex items-center space-x-3">
                    <span className="text-sm font-medium w-8">{item.stars}★</span>
                    <div className="flex-1 rating-bar">
                      <div className="rating-fill" style={{ width: `${item.width}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">{item.count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
              <div className="space-y-4">
                {[
                  { label: 'Đánh giá mới (7 ngày)', value: '127', color: 'text-gray-900' },
                  { label: 'Chưa trả lời', value: '8', color: 'text-orange-600' },
                  { label: 'Tỷ lệ trả lời', value: '94.2%', color: 'text-green-600' },
                  { label: 'Thời gian trả lời TB', value: '2.3h', color: 'text-blue-600' },
                  { label: 'Đánh giá có hình ảnh', value: '45%', color: 'text-purple-600' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stat.label}</span>
                    <span className={`font-medium ${stat.color}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Rating Trends Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Xu hướng đánh giá</h3>
                <div className="flex items-center space-x-2">
                  {['weekly', 'monthly', 'quarterly'].map((period) => (
                    <button
                      key={period}
                      onClick={() => changeRatingChart(period)}
                      className={`filter-btn ${selectedPeriod === period ? 'active' : ''}`}
                    >
                      {period === 'weekly' ? '7 ngày' : period === 'monthly' ? '30 ngày' : '3 tháng'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-container">
                <canvas ref={ratingTrendChartRef}></canvas>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Sentiment Analysis</h3>
                <button
                  onClick={() => alert('Xem phân tích sentiment chi tiết và trends')}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Chi tiết
                </button>
              </div>
              <div className="chart-container">
                <canvas ref={sentimentChartRef}></canvas>
              </div>
            </div>
          </div>

          {/* Improvement Suggestions */}
          <div className="improvement-card mb-8">
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">💡 Gợi ý cải thiện</h3>
                  <p className="text-sm opacity-90">Dựa trên phân tích AI từ đánh giá khách hàng</p>
                </div>
                <button
                  onClick={() => alert('Xem tất cả gợi ý cải thiện từ AI')}
                  className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-30"
                >
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: '🚚', title: 'Cải thiện vận chuyển', desc: '15% khách hàng phàn nàn về thời gian giao hàng' },
                  { icon: '📦', title: 'Đóng gói sản phẩm', desc: '8% đánh giá đề cập đến vấn đề đóng gói' },
                  { icon: '💬', title: 'Tăng tương tác', desc: 'Trả lời nhanh hơn để tăng satisfaction' }
                ].map((suggestion, index) => (
                  <div key={index} className="bg-white bg-opacity-10 p-4 rounded-lg">
                    <div className="text-2xl mb-2">{suggestion.icon}</div>
                    <h4 className="font-medium mb-1">{suggestion.title}</h4>
                    <p className="text-sm opacity-90">{suggestion.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Review Management */}
          <div className="bg-white rounded-lg card-shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý đánh giá</h3>
                <div className="flex items-center space-x-3">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Tất cả đánh giá</option>
                    <option>5 sao</option>
                    <option>4 sao</option>
                    <option>3 sao</option>
                    <option>2 sao</option>
                    <option>1 sao</option>
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    <option>Tất cả trạng thái</option>
                    <option>Chưa trả lời</option>
                    <option>Đã trả lời</option>
                    <option>Cần chú ý</option>
                  </select>
                  <button
                    onClick={() => alert('Lọc đánh giá theo từ khóa cụ thể')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Lọc theo từ khóa
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Priority Reviews */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">🚨 Đánh giá cần ưu tiên</h4>
                <div className="space-y-4">
                  {reviews.filter(r => r.priority === 'high' || r.priority === 'medium').map((review) => (
                    <div key={review.id} className={`review-card priority-${review.priority} p-4 rounded-lg`}>
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">👤</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-900">{review.customerName}</span>
                              <div className="star-rating">
                                {renderStars(review.rating)}
                              </div>
                              <span className={`sentiment-${review.sentiment} px-2 py-1 text-xs font-medium rounded-full`}>
                                {review.sentiment === 'positive' ? 'Tích cực' :
                                 review.sentiment === 'negative' ? 'Tiêu cực' : 'Trung tính'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">{review.timestamp}</span>
                          </div>
                          <p className="text-gray-700 mb-3">{review.content}</p>
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-sm text-gray-600">{review.product}</span>
                            {review.hasImages && (
                              <div className="flex space-x-2">
                                <div className="review-image">📱</div>
                                <div className="review-image">📦</div>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => quickReply(review.sentiment)}
                              className="quick-reply-btn"
                            >
                              Trả lời nhanh
                            </button>
                            {review.priority === 'high' && (
                              <>
                                <button
                                  onClick={() => alert(`Báo cáo đánh giá ${review.id} lên cấp cao để xử lý`)}
                                  className="quick-reply-btn"
                                >
                                  Báo cáo
                                </button>
                                <button
                                  onClick={() => alert(`Mở chat riêng với khách hàng`)}
                                  className="quick-reply-btn"
                                >
                                  Liên hệ riêng
                                </button>
                              </>
                            )}
                            {review.priority === 'medium' && (
                              <button
                                onClick={() => alert(`Gửi đề xuất bồi thường cho khách hàng`)}
                                className="quick-reply-btn"
                              >
                                Đề xuất bồi thường
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">📝 Đánh giá gần đây</h4>
                <div className="space-y-4">
                  {reviews.filter(r => r.priority === 'low').map((review) => (
                    <div key={review.id} className="review-card bg-white p-4 rounded-lg">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">👤</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-900">{review.customerName}</span>
                              <div className="star-rating">
                                {renderStars(review.rating)}
                              </div>
                              <span className={`sentiment-${review.sentiment} px-2 py-1 text-xs font-medium rounded-full`}>
                                {review.sentiment === 'positive' ? 'Tích cực' :
                                 review.sentiment === 'negative' ? 'Tiêu cực' : 'Trung tính'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500">{review.timestamp}</span>
                          </div>
                          <p className="text-gray-700 mb-3">{review.content}</p>
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="text-sm text-gray-600">{review.product}</span>
                            {review.hasImages && (
                              <div className="flex space-x-2">
                                <div className="review-image">🎧</div>
                                <div className="review-image">⭐</div>
                                <div className="review-image">👍</div>
                              </div>
                            )}
                          </div>
                          {review.isReplied && review.response ? (
                            <div className="response-box">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="text-sm font-medium text-blue-700">TechStore Official</span>
                                <span className="text-xs text-gray-500">Đã trả lời</span>
                              </div>
                              <p className="text-sm text-gray-700">{review.response}</p>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={openReplyModal}
                                className="quick-reply-btn"
                              >
                                Trả lời
                              </button>
                              <button
                                onClick={() => quickReply('positive')}
                                className="quick-reply-btn"
                              >
                                Cảm ơn
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center mt-6">
                <button
                  onClick={() => alert('Tải thêm đánh giá...')}
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200"
                >
                  Xem thêm đánh giá
                </button>
              </div>
            </div>
          </div>

          {/* Keyword Analysis & Competitor Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Keyword Analysis */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích từ khóa trong đánh giá</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-green-700 mb-2">Từ khóa tích cực</h4>
                  <div className="flex flex-wrap gap-2">
                    {['chất lượng tốt', 'giao hàng nhanh', 'đóng gói cẩn thận', 'giá cả hợp lý', 'tư vấn nhiệt tình', 'sản phẩm đẹp'].map((keyword, index) => (
                      <span key={index} className="keyword-tag keyword-positive">{keyword}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-red-700 mb-2">Từ khóa tiêu cực</h4>
                  <div className="flex flex-wrap gap-2">
                    {['giao hàng chậm', 'đóng gói kém', 'không giống mô tả', 'chất lượng kém'].map((keyword, index) => (
                      <span key={index} className="keyword-tag keyword-negative">{keyword}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">💡 Insights</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• 68% khách hàng hài lòng về chất lượng sản phẩm</li>
                    <li>• 15% phàn nàn về thời gian giao hàng</li>
                    <li>• 8% đề cập đến vấn đề đóng gói</li>
                    <li>• 92% đánh giá cao dịch vụ tư vấn</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Competitor Comparison */}
            <div className="bg-white p-6 rounded-lg card-shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">So sánh với đối thủ</h3>
              <div className="space-y-4">
                {[
                  { name: 'TechWorld Store', rating: 4.3, reviews: 1892, responseRate: 87, color: 'blue', letter: 'T' },
                  { name: 'MobileHub', rating: 4.1, reviews: 3156, responseRate: 91, color: 'green', letter: 'M' }
                ].map((competitor, index) => (
                  <div key={index} className="competitor-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-${competitor.color}-100 rounded-full flex items-center justify-center`}>
                          <span className={`text-${competitor.color}-600 font-bold`}>{competitor.letter}</span>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{competitor.name}</h4>
                          <p className="text-sm text-gray-500">
                            {index === 0 ? 'Đối thủ chính' : 'Cùng ngành'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{competitor.rating}</div>
                        <div className="star-rating">
                          {renderStars(Math.floor(competitor.rating))}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Tổng đánh giá:</span>
                        <span className="font-medium ml-1">{competitor.reviews.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Tỷ lệ trả lời:</span>
                        <span className="font-medium ml-1">{competitor.responseRate}%</span>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">🎯 Vị trí của bạn</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-700">Xếp hạng trong ngành:</span>
                    <span className="font-bold text-blue-900">#2/15</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-blue-700">Điểm mạnh:</span>
                    <span className="font-medium text-blue-900">Tỷ lệ trả lời cao</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Trả lời đánh giá</h2>
                <button
                  onClick={closeReplyModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900 mb-2">Mẫu trả lời nhanh</h3>
                <div className="grid grid-cols-1 gap-2">
                  {templates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => useTemplate(template)}
                      className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="font-medium text-sm">{template.title}</div>
                      <div className="text-xs text-gray-600">{template.preview}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung trả lời</label>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={4}
                  placeholder="Nhập nội dung trả lời..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={closeReplyModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={sendReply}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Gửi trả lời
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ShopReviews;