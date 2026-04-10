<template>
  <div class="delivery-view">
    <div class="header">
      <h1>Quản Lý Giao Hàng</h1>
      <div class="date-now">{{ new Date().toLocaleDateString('vi-VN') }}</div>
    </div>

    <div class="card">
      <h3 class="card-title">Danh Sách Suất Ăn Chờ Giao (Theo Ca)</h3>
      <div v-if="pendingDeliveries.length === 0" class="text-muted">
        Không có suất ăn nào đang chờ giao.
      </div>
      <div v-else style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Khách Hàng</th>
              <th>Ca</th>
              <th>Số Lượng</th>
              <th>Giờ Xuất Bếp</th>
              <th>Người Nhận</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in pendingDeliveries" :key="order.id">
              <td><strong>{{ order.customer_name }}</strong></td>
              <td><span class="badge badge-pending">Ca {{ order.shift }}</span></td>
              <td>{{ order.quantity }}</td>
              <td>
                <input type="time" v-model="deliveryData[order.id].time" class="form-input" style="padding: 0.25rem;" />
              </td>
              <td>
                <input type="text" v-model="deliveryData[order.id].recipient" class="form-input" style="padding: 0.25rem;" placeholder="Tên người nhận" />
              </td>
              <td>
                <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" @click="markDelivered(order)">
                  Xác nhận giao
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Delivery History -->
    <div class="card" style="margin-top: 2rem;">
      <h3 class="card-title">Lịch Sử Giao Hàng Trong Ngày</h3>
      <table>
        <thead>
          <tr>
            <th>Thời Gian</th>
            <th>Khách Hàng</th>
            <th>Ca</th>
            <th>Số Lượng</th>
            <th>Người Nhận</th>
            <th>Trạng Thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in deliveryLogs" :key="log.id">
            <td>{{ log.delivery_time }}</td>
            <td>{{ log.customer_name }}</td>
            <td>Ca {{ log.shift }}</td>
            <td>{{ log.quantity }}</td>
            <td>{{ log.recipient_name }}</td>
            <td><span class="badge badge-completed">Thành công</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const orders = ref([]);
const deliveryData = ref({});
const deliveryLogs = ref([]);

const fetchOrders = async () => {
  try {
    const res = await axios.get(`${API_URL}/orders`);
    orders.value = res.data;
    
    // Initialize delivery data for each order
    orders.value.forEach(o => {
      if (!deliveryData.value[o.id]) {
        deliveryData.value[o.id] = {
          time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
          recipient: ''
        };
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const pendingDeliveries = ref([]); // We'll compute this or fetch from specialized endpoint

const markDelivered = async (order) => {
  const data = deliveryData.value[order.id];
  if (!data.recipient) {
    alert('Vui lòng nhập tên người nhận.');
    return;
  }

  try {
    await axios.post(`${API_URL}/delivery`, {
      order_id: order.id,
      delivery_time: data.time,
      recipient_name: data.recipient,
      status: 'Delivered'
    });
    
    // In a real app, you'd also update the order status
    alert('Đã ghi nhận giao hàng cho ' + order.customer_name);
    fetchOrders(); 
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  fetchOrders();
  // For demo purposes, we'll just show all orders as "pending delivery" if they are in the orders list
  // In a real app, you'd filter by status.
  pendingDeliveries.value = orders.value; 
});
</script>
