import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchPaymentsByUser } from '../utils/paymentApi';
import { useRouter } from 'next/router';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
  TimeScale,
} from 'chart.js';

import { Bar, Line } from 'react-chartjs-2';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TimeScale
);

interface Payment {
  _id: string;
  categoryID: string;
  paymentDate: string;
  paymentAmount: number;
  description?: string;
}

interface Category {
  _id: string;
  categoryName: string;
}

// Local tarih formatı: YYYY-MM-DD
function formatDateLocal(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = (date.getMonth() + 1).toString().padStart(2, '0');
  const dd = date.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

const Dashboard: React.FC = () => {
  const { user, accessToken, loading } = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  const [totalExpense, setTotalExpense] = useState(0);
  const [topCategory, setTopCategory] = useState<{ name: string; amount: number } | null>(null);

  // Grafik için state
  const [dailyLabels, setDailyLabels] = useState<string[]>([]);
  const [dailyAmounts, setDailyAmounts] = useState<number[]>([]);

  const [monthlyLabels, setMonthlyLabels] = useState<string[]>([]);
  const [monthlyAmounts, setMonthlyAmounts] = useState<number[]>([]);

  useEffect(() => {
    if (!loading && !accessToken) {
      router.replace('/login');
    }
  }, [loading, accessToken, router]);

  useEffect(() => {
    if (user) {
      loadPayments();
      loadCategories();
    }
  }, [user]);

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await fetchPaymentsByUser(user!._id);
      setPayments(data);
    } catch (error) {
      console.error('Ödemeler yüklenirken hata:', error);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/categories');
      if (!res.ok) throw new Error('Kategori yüklenemedi');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Kategori yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    if (payments.length === 0) {
      setTotalExpense(0);
      setTopCategory(null);
      setDailyLabels([]);
      setDailyAmounts([]);
      setMonthlyLabels([]);
      setMonthlyAmounts([]);
      return;
    }

    // Toplam harcama
    const total = payments.reduce((acc, p) => acc + p.paymentAmount, 0);
    setTotalExpense(total);

    // En çok harcanan kategori
    const categorySums: Record<string, number> = {};
    payments.forEach((p) => {
      categorySums[p.categoryID] = (categorySums[p.categoryID] || 0) + p.paymentAmount;
    });

    const topCatId = Object.entries(categorySums).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topCatName = categories.find(cat => cat._id === topCatId)?.categoryName || 'Bilinmiyor';
    setTopCategory({ name: topCatName, amount: categorySums[topCatId] || 0 });

    // Günlük veri (son 30 gün)
    const today = new Date();
    const dailyMap: Record<string, number> = {};
    for(let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = formatDateLocal(d);
      dailyMap[key] = 0;
    }
    payments.forEach(p => {
      const date = new Date(p.paymentDate);
      const dateKey = formatDateLocal(date);
      if (dateKey in dailyMap) {
        dailyMap[dateKey] += p.paymentAmount;
      }
    });
    setDailyLabels(Object.keys(dailyMap));
    setDailyAmounts(Object.values(dailyMap));

    // Aylık veri (son 12 ay)
    const monthlyMap: Record<string, number> = {};
    for(let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}`;
      monthlyMap[key] = 0;
    }
    payments.forEach(p => {
      const date = new Date(p.paymentDate);
      const key = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;
      if (key in monthlyMap) {
        monthlyMap[key] += p.paymentAmount;
      }
    });
    setMonthlyLabels(Object.keys(monthlyMap));
    setMonthlyAmounts(Object.values(monthlyMap));

  }, [payments, categories]);

  if (loading || loadingPayments) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-300 p-4">
        <p className="text-gray-700">Yükleniyor...</p>
      </div>
    );
  }

  if (!user) return null;

  // Bar chart için veri
  const dailyChartData = {
    labels: dailyLabels.map(label => label.slice(5)), // "YYYY-MM-DD" -> "MM-DD"
    datasets: [
      {
        label: 'Günlük Harcama (₺)',
        data: dailyAmounts,
        backgroundColor: 'rgba(59, 130, 246, 0.7)', // mavi
      },
    ],
  };

  const dailyChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Son 30 Günlük Harcama' },
    },
  };

  // Line chart için veri
  const monthlyChartData = {
    labels: monthlyLabels.map(label => label.slice(5)), // "YYYY-MM" -> "MM"
    datasets: [
      {
        label: 'Aylık Harcama (₺)',
        data: monthlyAmounts,
        borderColor: 'rgba(16, 185, 129, 1)', // yeşil
        backgroundColor: 'rgba(16, 185, 129, 0.3)',
        fill: true,
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: 'Son 12 Aylık Harcama' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-300 py-12 px-4 mt-20">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-700">Dashboard</h1>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">Toplam Harcama</h2>
          <p className="text-4xl font-bold text-blue-600">{totalExpense.toFixed(2)} ₺</p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700">En Çok Harcanan Kategori</h2>
          {topCategory ? (
            <p className="text-lg font-medium text-gray-800">
              {topCategory.name} — {topCategory.amount.toFixed(2)} ₺
            </p>
          ) : (
            <p className="text-gray-600">Henüz harcama yok.</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Bar options={dailyChartOptions} data={dailyChartData} />
          </div>

          <div>
            <Line options={monthlyChartOptions} data={monthlyChartData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
