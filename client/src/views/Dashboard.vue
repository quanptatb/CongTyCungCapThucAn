<template>
  <div class="dashboard-view">
    <div class="header">
      <h1>Hệ Thống Quản Lý Suất Ăn</h1>
      <div class="date-now">{{ new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
    </div>

    <!-- Quick Stats -->
    <div class="grid" style="grid-template-columns: repeat(4, 1fr);">
      <div class="card stat-card">
        <div class="stat-label">Tổng Suất Ăn Hôm Nay</div>
        <div class="stat-value">{{ stats.todayTotal }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Ca 1 (Sáng)</div>
        <div class="stat-value" style="color: var(--secondary);">{{ stats.shift1 }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Ca 2 (Chiều)</div>
        <div class="stat-value" style="color: var(--accent);">{{ stats.shift2 }}</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Ca 3 (Đêm)</div>
        <div class="stat-value" style="color: #6366f1;">{{ stats.shift3 }}</div>
      </div>
    </div>

    <div class="grid" style="grid-template-columns: 2fr 1fr; margin-top: 1rem;">
      <!-- Chart Area (Placeholder for real chart) -->
      <div class="card">
        <h3 class="card-title">Biểu Đồ Xu Hướng (Tháng {{ new Date().getMonth() + 1 }})</h3>
        <div class="chart-placeholder">
          <div v-for="n in 7" :key="n" class="bar" :style="{ height: Math.random() * 100 + 50 + 'px' }"></div>
        </div>
        <div class="chart-labels">
          <span>Thứ 2</span><span>Thứ 3</span><span>Thứ 4</span><span>Thứ 5</span><span>Thứ 6</span><span>Thứ 7</span><span>CN</span>
        </div>
      </div>

      <!-- Recent Customers -->
      <div class="card">
        <h3 class="card-title">Khách Hàng Hoạt Động</h3>
        <ul class="customer-list">
          <li v-for="c in customers" :key="c.id" class="customer-item">
            <div class="customer-avatar">{{ c.name.charAt(0) }}</div>
            <div class="customer-info">
              <div class="customer-name">{{ c.name }}</div>
              <div class="customer-sub">{{ c.contact }}</div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Production Status -->
    <div class="card" style="margin-top: 1rem;">
      <h3 class="card-title">Trạng Thái Thực Hiện (Bếp)</h3>
      <div class="grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="production-step">
          <div class="step-num">01</div>
          <div class="step-title">Đi Chợ & Chuẩn Bị</div>
          <div class="badge badge-completed">Hoàn tất</div>
        </div>
        <div class="production-step active">
          <div class="step-num">02</div>
          <div class="step-title">Chế Biến & Đóng Gói</div>
          <div class="badge badge-pending">Đang thực hiện</div>
        </div>
        <div class="production-step">
          <div class="step-num">03</div>
          <div class="step-title">Vận Chuyển & Giao</div>
          <div class="badge">Chờ...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const customers = ref([]);
const stats = ref({
  todayTotal: 0,
  shift1: 0,
  shift2: 0,
  shift3: 0
});

const fetchData = async () => {
  try {
    const [custRes, orderRes] = await Promise.all([
      axios.get(`${API_URL}/customers`),
      axios.get(`${API_URL}/orders`)
    ]);
    
    customers.value = custRes.data;
    
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = orderRes.data.filter(o => o.date === today);
    
    stats.value.todayTotal = todayOrders.reduce((s, o) => s + o.quantity, 0);
    stats.value.shift1 = todayOrders.filter(o => o.shift === 1).reduce((s, o) => s + o.quantity, 0);
    stats.value.shift2 = todayOrders.filter(o => o.shift === 2).reduce((s, o) => s + o.quantity, 0);
    stats.value.shift3 = todayOrders.filter(o => o.shift === 3).reduce((s, o) => s + o.quantity, 0);
    
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  padding-top: 2rem;
  border-bottom: 2px solid var(--bg-main);
}

.bar {
  width: 30px;
  background: linear-gradient(to top, var(--primary), #34d399);
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  transition: height 0.3s;
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.customer-list {
  list-style: none;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--bg-main);
}

.customer-avatar {
  width: 40px;
  height: 40px;
  background: var(--bg-main);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 700;
}

.customer-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.customer-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.production-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 12px;
  background: var(--bg-main);
}

.production-step.active {
  background: #ecfdf5;
  border: 1px solid var(--primary);
}

.step-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.1);
}

.step-title {
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
