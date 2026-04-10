<template>
  <div class="orders-view">
    <div class="header">
      <h1>Quản Lý Đơn Hàng (Báo Cơm)</h1>
      <div class="date-now">{{ new Date().toLocaleDateString('vi-VN') }}</div>
    </div>

    <div class="grid">
      <!-- Order Form -->
      <div class="card">
        <h3 class="card-title">Nhập Số Lượng Suất Ăn</h3>
        <form @submit.prevent="submitOrder">
          <div class="form-group">
            <label class="form-label">Chọn Khách Hàng</label>
            <select v-model="form.customer_id" class="form-input" required>
              <option v-for="c in customers" :key="c.id" :value="c.id">
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Ngày Giao</label>
            <input type="date" v-model="form.date" class="form-input" required />
          </div>

          <div class="grid" style="grid-template-columns: repeat(3, 1fr); gap: 10px;">
            <div class="form-group">
              <label class="form-label">Ca 1</label>
              <input type="number" v-model="form.shift1" class="form-input" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Ca 2</label>
              <input type="number" v-model="form.shift2" class="form-input" placeholder="0" />
            </div>
            <div class="form-group">
              <label class="form-label">Ca 3</label>
              <input type="number" v-model="form.shift3" class="form-input" placeholder="0" />
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">
            Lưu Thông Tin
          </button>
        </form>
      </div>

      <!-- Quick Summary -->
      <div class="card stat-card">
        <h3 class="card-title">Tổng Hợp Hôm Nay</h3>
        <div class="grid" style="grid-template-columns: 1fr 1fr;">
          <div>
            <div class="stat-value">{{ todayTotal }}</div>
            <div class="stat-label">Tổng suất ăn</div>
          </div>
          <div>
            <div class="stat-value" style="color: var(--secondary);">{{ pendingOrders }}</div>
            <div class="stat-label">Đang chờ xử lý</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="card" style="margin-top: 2rem;">
      <h3 class="card-title">Danh Sách Báo Cơm Gần Đây</h3>
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Khách Hàng</th>
              <th>Ngày</th>
              <th>Ca</th>
              <th>Số Lượng</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td>#{{ order.id }}</td>
              <td><strong>{{ order.customer_name }}</strong></td>
              <td>{{ order.date }}</td>
              <td>Ca {{ order.shift }}</td>
              <td>{{ order.quantity }}</td>
              <td>
                <span :class="['badge', order.status === 'Pending' ? 'badge-pending' : 'badge-completed']">
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

const customers = ref([]);
const orders = ref([]);
const form = ref({
  customer_id: '',
  date: new Date().toISOString().split('T')[0],
  shift1: 0,
  shift2: 0,
  shift3: 0
});

const fetchCustomers = async () => {
  try {
    const res = await axios.get(`${API_URL}/customers`);
    customers.value = res.data;
    if (customers.value.length > 0) form.value.customer_id = customers.value[0].id;
  } catch (err) {
    console.error(err);
  }
};

const fetchOrders = async () => {
  try {
    const res = await axios.get(`${API_URL}/orders`);
    orders.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const submitOrder = async () => {
  try {
    const shifts = [
      { shift: 1, qty: form.value.shift1 },
      { shift: 2, qty: form.value.shift2 },
      { shift: 3, qty: form.value.shift3 }
    ];

    for (const s of shifts) {
      if (s.qty > 0) {
        await axios.post(`${API_URL}/orders`, {
          customer_id: form.value.customer_id,
          date: form.value.date,
          shift: s.shift,
          quantity: s.qty
        });
      }
    }
    
    // Reset form
    form.value.shift1 = 0;
    form.value.shift2 = 0;
    form.value.shift3 = 0;
    
    fetchOrders();
    alert('Đã lưu thông tin báo cơm thành công!');
  } catch (err) {
    console.error(err);
    alert('Có lỗi xảy ra khi lưu thông tin.');
  }
};

const todayTotal = computed(() => {
  const today = new Date().toISOString().split('T')[0];
  return orders.value
    .filter(o => o.date === today)
    .reduce((sum, o) => sum + o.quantity, 0);
});

const pendingOrders = computed(() => {
  return orders.value.filter(o => o.status === 'Pending').length;
});

onMounted(() => {
  fetchCustomers();
  fetchOrders();
});
</script>
