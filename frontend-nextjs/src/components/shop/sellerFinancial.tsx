'use client';

import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/shop/Sidebar';

// NOTE: global CSS (sellerFinancial.css) must be imported in app/layout.tsx, not here.

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

interface Transaction {
  id: string;
  date: string;
  description: string;
  subDescription: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface Account {
  type: 'main' | 'wallet' | 'cash';
  name: string;
  balance: number;
  details: string;
  icon: string;
}

type RevenuePeriod = 'week' | 'month' | 'year';
type TransactionFilter = 'all' | 'income' | 'expense';

interface TransactionFormData {
  type: '' | 'income' | 'expense';
  amount: string;
  description: string;
  category: string;
  date: string;
  notes: string;
}

const Financial: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7 ngày qua');
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('all');
  const [revenueChartPeriod, setRevenueChartPeriod] = useState<RevenuePeriod>('week');
  const [showTransactionModal, setShowTransactionModal] = useState<boolean>(false);
  const [transactionFormData, setTransactionFormData] = useState<TransactionFormData>({
    type: '',
    amount: '',
    description: '',
    category: '',
    date: '',
    notes: '',
  });

  const transactions: Transaction[] = [
    { id: 'T001', date: '15/12/2024', description: 'Doanh thu bán hàng', subDescription: 'Đơn hàng #DH001235', type: 'income', amount: 22990000, status: 'paid' },
    { id: 'T002', date: '15/12/2024', description: 'Phí vận chuyển', subDescription: 'Giao Hang Nhanh', type: 'expense', amount: 125000, status: 'paid' },
    { id: 'T003', date: '14/12/2024', description: 'Chi phí quảng cáo', subDescription: 'Facebook Ads', type: 'expense', amount: 2500000, status: 'pending' },
    { id: 'T004', date: '14/12/2024', description: 'Doanh thu bán hàng', subDescription: 'Đơn hàng #DH001236', type: 'income', amount: 11980000, status: 'paid' },
    { id: 'T005', date: '13/12/2024', description: 'Phí platform', subDescription: 'Shopee commission', type: 'expense', amount: 1299000, status: 'paid' },
  ];

  const accounts: Account[] = [
    { type: 'main', name: 'Tài khoản chính', balance: 125450000, details: 'Vietcombank - **** 1234', icon: '🏦' },
    { type: 'wallet', name: 'Ví điện tử', balance: 8750000, details: 'MoMo - 0987654321', icon: '💳' },
    { type: 'cash', name: 'Tiền mặt', balance: 2300000, details: 'Quỹ tiền mặt', icon: '💵' },
  ];

  // Chart data/types
  const revenueChartData: ChartData<'line', number[], unknown> = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        label: 'Doanh thu',
        data: [320, 450, 380, 520, 680, 750, 890],
        borderColor: '#ee4d2d',
        backgroundColor: 'rgba(238, 77, 45, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const expenseChartData: ChartData<'doughnut', number[], unknown> = {
    labels: ['Hàng hóa', 'Vận chuyển', 'Marketing', 'Phí platform', 'Khác'],
    datasets: [
      {
        data: [65, 15, 10, 7, 3],
        backgroundColor: ['#ee4d2d', '#4facfe', '#43e97b', '#f093fb', '#ffeaa7'],
      },
    ],
  };

  const revenueChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false, text: 'Doanh thu' },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: number | string) => {
            // value can be number or string depending on Chart.js usage
            return `₫${String(value)}K`;
          },
        },
      },
    },
  };

  const expenseChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: { enabled: true },
    },
  };

  const formatCurrency = (amount: number): string => {
    return '₫' + amount.toLocaleString('vi-VN');
  };

  const handleTransactionSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // In real app: validate & call API; here we show demo feedback
    window.alert('Đã thêm giao dịch thành công!');
    setShowTransactionModal(false);
    setTransactionFormData({ type: '', amount: '', description: '', category: '', date: '', notes: '' });
  };

  const getStatusClass = (status: Transaction['status']): string => {
    switch (status) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return '';
    }
  };

  const getStatusText = (status: Transaction['status']): string => {
    switch (status) {
      case 'paid': return 'Đã thanh toán';
      case 'pending': return 'Chờ thanh toán';
      case 'overdue': return 'Quá hạn';
      default: return '';
    }
  };

  const filteredTransactions = transactions.filter((transaction) =>
    transactionFilter === 'all' ? true : transaction.type === transactionFilter
  );

  return (
    <div className="financial-page">
      <Header />

      <div className="flex">
        <Sidebar activeKey="financial" />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tài chính</h1>
              <p className="text-gray-600">Theo dõi doanh thu, chi phí và lợi nhuận của shop</p>
            </div>
            <div className="flex items-center space-x-3">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm" value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
                <option>3 tháng qua</option>
                <option>6 tháng qua</option>
                <option>1 năm qua</option>
              </select>
              <button onClick={() => window.alert('Xuất báo cáo tài chính thành file Excel')} className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2">
                <span>📊</span><span>Xuất báo cáo</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="revenue-card text-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💰</div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Doanh thu</div>
                  <div className="text-2xl font-bold">₫2.450M</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Tháng này</span>
                <div className="flex items-center space-x-1 trend-up"><span className="text-sm">↗</span><span className="text-sm font-medium">+15.2%</span></div>
              </div>
            </div>

            <div className="profit-card text-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">📈</div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Lợi nhuận</div>
                  <div className="text-2xl font-bold">₫485K</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Tháng này</span>
                <div className="flex items-center space-x-1 trend-up"><span className="text-sm">↗</span><span className="text-sm font-medium">+8.7%</span></div>
              </div>
            </div>

            <div className="expense-card text-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">💸</div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Chi phí</div>
                  <div className="text-2xl font-bold">₫1.965M</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Tháng này</span>
                <div className="flex items-center space-x-1 trend-up"><span className="text-sm">↗</span><span className="text-sm font-medium">+12.3%</span></div>
              </div>
            </div>

            <div className="growth-card text-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="text-3xl">🎯</div>
                <div className="text-right">
                  <div className="text-sm opacity-90">Tỷ suất LN</div>
                  <div className="text-2xl font-bold">19.8%</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Tháng này</span>
                <div className="flex items-center space-x-1 trend-down"><span className="text-sm">↘</span><span className="text-sm font-medium">-2.1%</span></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg card-shadow mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => setShowTransactionModal(true)} className="quick-action-btn bg-green-50 hover:bg-green-100 text-green-700 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">💵</div><div className="font-medium">Thêm thu nhập</div>
              </button>
              <button onClick={() => setShowTransactionModal(true)} className="quick-action-btn bg-red-50 hover:bg-red-100 text-red-700 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">💸</div><div className="font-medium">Thêm chi phí</div>
              </button>
              <button onClick={() => window.alert('Mở báo cáo dòng tiền')} className="quick-action-btn bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">📊</div><div className="font-medium">Dòng tiền</div>
              </button>
              <button onClick={() => window.alert('Tạo báo cáo tài chính')} className="quick-action-btn bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">📋</div><div className="font-medium">Báo cáo</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Doanh thu theo thời gian</h3>
                <div className="flex items-center space-x-2">
                  {(['week', 'month', 'year'] as RevenuePeriod[]).map((period) => (
                    <button key={period} className={`filter-btn ${revenueChartPeriod === period ? 'active' : ''}`} onClick={() => setRevenueChartPeriod(period)}>
                      {period === 'week' ? 'Tuần' : period === 'month' ? 'Tháng' : 'Năm'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="chart-container" style={{ height: 280 }}>
                <Line data={revenueChartData} options={revenueChartOptions} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Phân bổ chi phí</h3>
                <button onClick={() => window.alert('Xem báo cáo chi tiết chi phí')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Xem chi tiết</button>
              </div>
              <div className="chart-container" style={{ height: 280 }}>
                <Doughnut data={expenseChartData} options={expenseChartOptions} />
              </div>
            </div>
          </div>

          <div className="financial-summary text-white p-6 rounded-lg card-shadow mb-8">
            <h3 className="text-lg font-semibold mb-6">Tóm tắt tài chính tháng 12/2024</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm opacity-90 mb-2">Tổng thu nhập</div>
                <div className="text-2xl font-bold mb-1">₫2.450.000.000</div>
                <div className="text-sm opacity-75">Từ 234 đơn hàng</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-2">Tổng chi phí</div>
                <div className="text-2xl font-bold mb-1">₫1.965.000.000</div>
                <div className="text-sm opacity-75">Bao gồm vận chuyển, marketing</div>
              </div>
              <div>
                <div className="text-sm opacity-90 mb-2">Lợi nhuận ròng</div>
                <div className="text-2xl font-bold mb-1">₫485.000.000</div>
                <div className="text-sm opacity-75">Tỷ suất lợi nhuận: 19.8%</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg card-shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Giao dịch gần đây</h3>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {(['all', 'income', 'expense'] as TransactionFilter[]).map((filter) => (
                      <button key={filter} className={`filter-btn ${transactionFilter === filter ? 'active' : ''}`} onClick={() => setTransactionFilter(filter)}>
                        {filter === 'all' ? 'Tất cả' : filter === 'income' ? 'Thu nhập' : 'Chi phí'}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => window.alert('Mở trang danh sách tất cả giao dịch')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Xem tất cả</button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loại</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="transaction-item">
                      <td className="px-6 py-4 text-sm text-gray-900">{transaction.date}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{transaction.description}</div>
                        <div className="text-sm text-gray-500">{transaction.subDescription}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {transaction.type === 'income' ? 'Thu nhập' : 'Chi phí'}
                        </span>
                      </td>
                      <td className="px-6 py-4"><span className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}</span></td>
                      <td className="px-6 py-4"><span className={`${getStatusClass(transaction.status)} px-2 py-1 text-xs font-medium rounded-full`}>{getStatusText(transaction.status)}</span></td>
                      <td className="px-6 py-4">
                        {transaction.status === 'pending' ? (
                          <button onClick={() => { if (confirm(`Xác nhận thanh toán cho giao dịch ${transaction.id}?`)) window.alert('Thanh toán thành công!'); }} className="text-green-600 hover:text-green-800 text-sm font-medium">Thanh toán</button>
                        ) : (
                          <button onClick={() => window.alert(`Xem chi tiết giao dịch ${transaction.id}`)} className="text-blue-600 hover:text-blue-800 text-sm">Chi tiết</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div key={account.type} className="bg-white p-6 rounded-lg card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{account.name}</h3>
                  <div className="text-2xl">{account.icon}</div>
                </div>
                <div className="text-2xl font-bold balance-positive mb-2">{formatCurrency(account.balance)}</div>
                <div className="text-sm text-gray-500">{account.details}</div>
                <button onClick={() => {
                  if (account.type === 'cash') {
                    const newBalance = window.prompt('Nhập số dư tiền mặt hiện tại:');
                    if (newBalance) window.alert(`Đã cập nhật số dư tiền mặt: ₫${newBalance}`);
                  } else {
                    window.alert(`Xem chi tiết tài khoản ${account.type}`);
                  }
                }} className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium">{account.type === 'cash' ? 'Cập nhật' : 'Xem chi tiết'}</button>
              </div>
            ))}
          </div>
        </main>
      </div>

      {showTransactionModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Thêm giao dịch</h2>
                <button onClick={() => setShowTransactionModal(false)} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <form onSubmit={handleTransactionSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Loại giao dịch</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={transactionFormData.type} onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value as TransactionFormData['type'] })} required>
                      <option value="">Chọn loại giao dịch</option>
                      <option value="income">Thu nhập</option>
                      <option value="expense">Chi phí</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền</label>
                    <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="0" value={transactionFormData.amount} onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })} required />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Nhập mô tả giao dịch" value={transactionFormData.description} onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2" value={transactionFormData.category} onChange={(e) => setTransactionFormData({ ...transactionFormData, category: e.target.value })} required>
                      <option value="">Chọn danh mục</option>
                      <option value="sales">Doanh thu bán hàng</option>
                      <option value="shipping">Phí vận chuyển</option>
                      <option value="marketing">Chi phí marketing</option>
                      <option value="platform">Phí platform</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ngày giao dịch</label>
                    <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={transactionFormData.date} onChange={(e) => setTransactionFormData({ ...transactionFormData, date: e.target.value })} required />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                  <textarea className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={3} placeholder="Ghi chú thêm (tùy chọn)" value={transactionFormData.notes} onChange={(e) => setTransactionFormData({ ...transactionFormData, notes: e.target.value })}></textarea>
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button type="button" onClick={() => setShowTransactionModal(false)} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-red-600">Thêm giao dịch</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default Financial;
 