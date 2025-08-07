import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/router';
import { fetchPaymentsByUser, addPayment, deletePayment } from '../utils/paymentApi';

interface Category {
  _id: string;
  categoryName: string;
}

export default function Profile() {
  const { user, accessToken, loading} = useAuth();
  const router = useRouter();

  const [payments, setPayments] = useState<any[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const [paymentLimitInput, setPaymentLimitInput] = useState<string>('');
  const [limitUpdateMessage, setLimitUpdateMessage] = useState<string | null>(null);
  const [limitUpdating, setLimitUpdating] = useState(false);
  const [limitExceededWarning, setLimitExceededWarning] = useState<string | null>(null);

  const calculateTotalPayments = (payments: any[]) => {
    return payments.reduce((sum, payment) => sum + Number(payment.paymentAmount), 0);
  };

  // Düzenlenen harcama bilgileri
  const [editingPayment, setEditingPayment] = useState<null | {
    _id: string;
    categoryID: string;
    paymentDate: string;
    description: string;
    paymentAmount: string;
  }>(null);

  // Yeni harcama formu
  const [newPayment, setNewPayment] = useState({
    categoryID: '',
    paymentDate: '',
    description: '',
    paymentAmount: '',
  });

  // Filtreler
  const [filterCategoryID, setFilterCategoryID] = useState<string>('');
  const [filterTime, setFilterTime] = useState<string>(''); // '', 'today', 'thisWeek', 'thisMonth'

  useEffect(() => {
    if (!loading && !accessToken) {
      router.replace('/login');
    }
  }, [loading, accessToken, router]);

  useEffect(() => {
    if (user) {
      loadPayments();
      loadCategories();
      setPaymentLimitInput(user.paymentLimit?.toString() || '');
    }
  }, [user]);
  
  const handleUpdatePaymentLimit = async () => {
    setLimitUpdateMessage(null);
    const limitNumber = Number(paymentLimitInput);
    if (isNaN(limitNumber) || limitNumber < 0) {
      setLimitUpdateMessage('Lütfen geçerli bir sayı girin.');
      return;
    }

    setLimitUpdating(true);
    try {
      const res = await fetch(`http://localhost:3000/api/users/${user!._id}/paymentLimit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ paymentLimit: limitNumber }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Limit güncellenirken hata oluştu.');
      }

      const data = await res.json();
      setLimitUpdateMessage('Harcama limiti başarıyla güncellendi.');
      setPaymentLimitInput(limitNumber.toString());

    } catch (error: any) {
      setLimitUpdateMessage(error.message || 'Limit güncellenirken hata oluştu.');
    } finally {
      setLimitUpdating(false);
    }
  };

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
      console.error(error);
      setMessage('Kategoriler yüklenirken hata oluştu.');
    }
  };

  // Form input değişimi
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (editingPayment) {
      setEditingPayment({ ...editingPayment, [name]: value });
    } else {
      setNewPayment({ ...newPayment, [name]: value });
    }
  };

  // Yeni ödeme ekleme
  const handleAddPayment = async () => {
    if (!newPayment.categoryID || !newPayment.paymentDate || !newPayment.paymentAmount) {
      setMessage('Lütfen gerekli alanları doldurun.');
      return;
    }
    setMessage(null);
    setLimitExceededWarning(null);
    try {
      await addPayment({
        userID: user!._id,
        categoryID: newPayment.categoryID,
        paymentDate: newPayment.paymentDate,
        description: newPayment.description,
        paymentAmount: parseFloat(newPayment.paymentAmount),
      });
      setNewPayment({ categoryID: '', paymentDate: '', description: '', paymentAmount: '' });
      setMessage('Harcama başarıyla eklendi.');
      
      const updatedPayments = await fetchPaymentsByUser(user!._id);
      setPayments(updatedPayments);
      const total = calculateTotalPayments(updatedPayments);
      const limit = Number(paymentLimitInput);
      console.log('limit: ' , limit)
      console.log("total: " , total)
      if (limit > 0 && total > limit) {
        setLimitExceededWarning('Harcama limiti aşıldı!');
      }

      loadPayments();
    } catch (error) {
      setMessage('Ödeme eklenirken hata oluştu.');
    }
  };

  // Ödeme silme
  const handleDeletePayment = async (id: string) => {
    if (!confirm('Ödemeyi silmek istediğinize emin misiniz?')) return;
    try {
      await deletePayment(id);
      setMessage('Harcama başarıyla silindi.');
      loadPayments();
    } catch (error) {
      setMessage('Ödeme silinirken hata oluştu.');
    }
  };

  // Düzenleme başlatma
  const handleEditClick = (payment: any) => {
    setEditingPayment({
      _id: payment._id,
      categoryID: payment.categoryID,
      paymentDate: payment.paymentDate.slice(0, 10),
      description: payment.description || '',
      paymentAmount: payment.paymentAmount.toString(),
    });
    setMessage(null);
  };

  // Düzenleme iptal
  const handleCancelEdit = () => {
    setEditingPayment(null);
    setMessage(null);
  };

  // Güncelleme
  const handleUpdatePayment = async () => {
    if (!editingPayment) return;

    if (!editingPayment.categoryID || !editingPayment.paymentDate || !editingPayment.paymentAmount) {
      setMessage('Lütfen gerekli alanları doldurun.');
      return;
    }
    setMessage(null);
    try {
      const res = await fetch(`http://localhost:3000/api/payments/${editingPayment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userID: user!._id,
          categoryID: editingPayment.categoryID,
          paymentDate: editingPayment.paymentDate,
          description: editingPayment.description,
          paymentAmount: parseFloat(editingPayment.paymentAmount),
        }),
      });

      if (!res.ok) {
        throw new Error('Güncelleme başarısız');
      }

      setMessage('Harcama başarıyla güncellendi.');
      setEditingPayment(null);
      loadPayments();
    } catch (error) {
      setMessage('Harcama güncellenirken hata oluştu.');
      console.error(error);
    }
  };

  // Tarih filtre yardımcıları
  const isDateInToday = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isDateInThisWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();

    const firstDayOfWeek = new Date(today);
    firstDayOfWeek.setDate(today.getDate() - (today.getDay() || 7) + 1);
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const lastDayOfWeek = new Date(firstDayOfWeek);
    lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
    lastDayOfWeek.setHours(23, 59, 59, 999);

    return date >= firstDayOfWeek && date <= lastDayOfWeek;
  };

  const isDateInThisMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Filtrelenmiş ödemeler
  const filteredPayments = payments.filter(payment => {
    if (filterCategoryID && payment.categoryID !== filterCategoryID) return false;

    if (filterTime) {
      if (filterTime === 'today' && !isDateInToday(payment.paymentDate)) return false;
      if (filterTime === 'thisWeek' && !isDateInThisWeek(payment.paymentDate)) return false;
      if (filterTime === 'thisMonth' && !isDateInThisMonth(payment.paymentDate)) return false;
    }

    return true;
  });

  const exportToCSV = () => {
    if (filteredPayments.length === 0) {
      alert("Dışarı aktarılacak harcama yok.");
      return;
    }

    // Başlık satırı
    const headers = ['Kategori', 'Tarih', 'Açıklama', 'Tutar'];

    // Satırlar
    const rows = filteredPayments.map(payment => {
      const categoryName = categories.find(cat => cat._id === payment.categoryID)?.categoryName || payment.categoryID;
      const dateStr = new Date(payment.paymentDate).toLocaleDateString();
      const description = payment.description?.replace(/"/g, '""') || ''; // çift tırnak kaçış
      const amount = payment.paymentAmount;

      return `"${categoryName}","${dateStr}","${description}","${amount}"`;
    });

    // CSV içeriği
    const csvContent = [headers.join(','), ...rows].join('\n');

    // Blob oluştur ve indir
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `harcamalar_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-300 p-4">
        <p className="text-gray-600">Kullanıcı bilgileri yükleniyor...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-300 py-12 px-4 flex justify-center relative mt-20">

      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <div className="mb-6">
          <p className="mb-2 text-gray-700 font-medium">Aylık Harcama limiti:</p>
          <input
            type="number"
            min={0}
            value={paymentLimitInput}
            onChange={(e) => setPaymentLimitInput(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 mb-2"
            placeholder="Harcama limitini girin"
          />
          <button
            onClick={handleUpdatePaymentLimit}
            disabled={limitUpdating}
            className={`w-full py-3 rounded text-white font-semibold ${
              limitUpdating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            } transition-colors`}
          >
            {limitUpdating ? 'Güncelleniyor...' : 'Limiti Güncelle'}
          </button>
          {limitUpdateMessage && (
            <p
              className={`mt-2 text-center ${
                limitUpdateMessage.toLowerCase().includes('başar')
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {limitUpdateMessage}
            </p>
          )}
        </div>
        {editingPayment ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Harcamayı Güncelle</h2>
            <div className="flex flex-col gap-4 mb-6">
              <select
                name="categoryID"
                value={editingPayment.categoryID}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              >
                <option value="">Kategori seçin</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="paymentDate"
                value={editingPayment.paymentDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
              <input
                name="description"
                placeholder="Açıklama"
                value={editingPayment.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />
              <input
                type="number"
                step="0.01"
                name="paymentAmount"
                placeholder="Tutar"
                value={editingPayment.paymentAmount}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-700"
              />

              <div className="flex gap-4">
                <button
                  onClick={handleUpdatePayment}
                  className="flex-1 py-3 rounded text-white font-semibold bg-green-600 hover:bg-green-700 transition-colors"
                >
                  Güncelle
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 py-3 rounded text-white font-semibold bg-gray-500 hover:bg-gray-600 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Yeni Harcama Ekle</h2>
            <div className="flex flex-col gap-4 mb-6">
              <select
                name="categoryID"
                value={newPayment.categoryID}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              >
                <option value="">Kategori seçin</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>

              <input
                type="date"
                name="paymentDate"
                value={newPayment.paymentDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <input
                name="description"
                placeholder="Açıklama"
                value={newPayment.description}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
              <input
                type="number"
                step="0.01"
                name="paymentAmount"
                placeholder="Tutar"
                value={newPayment.paymentAmount}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />

              <button
                onClick={handleAddPayment}
                className="w-full py-3 rounded text-white font-semibold bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Ekle
              </button>
              {limitExceededWarning && (
                <p className="mb-6 text-center text-red-600 font-semibold">
                  {limitExceededWarning}
                </p>
              )}
            </div>
          </>
        )}

        {message && (
          <p
            className={`mb-6 text-center ${
              message.toLowerCase().includes('başar')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}

        {/* Filtre alanları */}
        <div className="mb-6 flex gap-4">
          <select
            value={filterCategoryID}
            onChange={(e) => setFilterCategoryID(e.target.value)}
            className="p-2 border border-gray-300 rounded text-gray-700"
          >
            <option value="">Tüm Kategoriler</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.categoryName}
              </option>
            ))}
          </select>

          <select
            value={filterTime}
            onChange={(e) => setFilterTime(e.target.value)}
            className="p-2 border border-gray-300 rounded text-gray-700"
          >
            <option value="">Tüm Zamanlar</option>
            <option value="today">Bugün</option>
            <option value="thisWeek">Bu Hafta</option>
            <option value="thisMonth">Bu Ay</option>
          </select>
        </div>

        <h2 className="text-xl font-semibold mb-4 text-gray-700">Harcama Listesi</h2>
        <button
          onClick={exportToCSV}
          className="mb-6 w-full py-3 rounded bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
        >
          Harcamaları CSV olarak dışa aktar
        </button>

        {loadingPayments ? (
          <p className="text-gray-700">Yükleniyor...</p>
        ) : filteredPayments.length === 0 ? (
          <p className="text-gray-700">Filtrelere uygun harcamanız yok.</p>
        ) : (
          <ul className="space-y-4">
            {filteredPayments.map((payment) => (
              <li
                key={payment._id}
                className="p-4 border border-gray-300 rounded bg-gray-50 flex justify-between items-center"
              >
                <div>
                  <p className="text-gray-700">
                    <span className="font-semibold">Kategori:</span>{' '}
                    {categories.find(cat => cat._id === payment.categoryID)?.categoryName || payment.categoryID}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Tarih:</span>{' '}
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Açıklama:</span> {payment.description || '-'}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-semibold">Tutar:</span> {payment.paymentAmount} ₺
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(payment)}
                    className="px-4 py-2 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDeletePayment(payment._id)}
                    className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition-colors"
                  >
                    Sil
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
