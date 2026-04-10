<template>
  <div class="market-view">
    <div class="header">
      <h1>Danh Sách Đi Chợ</h1>
      <div class="filters">
        <input type="date" v-model="filterDate" class="form-input" @change="fetchShoppingList" />
      </div>
    </div>

    <div class="card">
      <div class="header" style="margin-bottom: 1rem;">
        <h3 class="card-title" style="margin-bottom: 0;">Nguyên Liệu Cần Mua</h3>
        <button class="btn btn-primary" @click="printList">
          <span>🖨️</span> In Danh Sách
        </button>
      </div>

      <div v-if="loading" class="text-muted">Đang tính toán...</div>
      <div v-else-if="items.length === 0" class="text-muted">
        Không có đơn hàng nào cho ngày này để tính toán nguyên liệu.
      </div>
      
      <div v-else style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Tên Nguyên Liệu</th>
              <th>Số Lượng Tổng</th>
              <th>Đơn Vị</th>
              <th>Trạng Thái</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.item_name">
              <td><strong>{{ item.item_name }}</strong></td>
              <td style="font-size: 1.1rem; font-weight: 600; color: var(--primary);">
                {{ formatAmount(item.total_amount) }}
              </td>
              <td>{{ item.unit }}</td>
              <td>
                <input type="checkbox" /> Đã mua
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid" style="margin-top: 2rem;">
      <div class="card">
        <h3 class="card-title">Ghi Chú Đi Chợ</h3>
        <textarea class="form-input" rows="4" placeholder="Nhập ghi chú cho nhân viên đi chợ..."></textarea>
      </div>
      <div class="card">
        <h3 class="card-title">Dự Tính Chi Phí</h3>
        <div class="stat-value" style="color: var(--secondary);">~ 5,200,000đ</div>
        <div class="stat-label">Dựa trên giá thị trường ước tính</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const filterDate = ref(new Date().toISOString().split('T')[0]);
const items = ref([]);
const loading = ref(false);

const fetchShoppingList = async () => {
  loading.value = true;
  try {
    const res = await axios.get(`${API_URL}/shopping-list`, {
      params: { date: filterDate.value }
    });
    items.value = res.data;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const formatAmount = (val) => {
  if (val >= 1000) return (val / 1000).toFixed(2);
  return val.toFixed(0);
};

const printList = () => {
  window.print();
};

onMounted(() => {
  fetchShoppingList();
});
</script>

<style scoped>
.filters {
  display: flex;
  gap: 1rem;
}

@media print {
  .sidebar, .btn, .filters {
    display: none !important;
  }
  .main-content {
    margin: 0;
    padding: 0;
  }
}
</style>
