<template>
  <div class="reports-view">
    <div class="header">
      <h1>Báo Cáo & Thống Kê</h1>
      <div class="filters">
        <label class="form-label">Chọn Năm:</label>
        <select v-model="selectedYear" class="form-input" @change="fetchReports" style="width: 120px;">
          <option v-for="y in [2024, 2025, 2026]" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div class="grid">
      <div class="card stat-card">
        <div class="stat-label">Tổng Doanh Thu ({{ selectedYear }})</div>
        <div class="stat-value" style="color: var(--primary);">{{ totalYearlyRevenue.toLocaleString() }}đ</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Tổng Suất Ăn ({{ selectedYear }})</div>
        <div class="stat-value" style="color: var(--secondary);">{{ totalYearlyQuantity.toLocaleString() }}</div>
      </div>
    </div>

    <div class="card" style="margin-top: 2rem;">
      <h3 class="card-title">Chi Tiết Theo Tháng</h3>
      <table>
        <thead>
          <tr>
            <th>Tháng</th>
            <th>Tổng Suất Ăn</th>
            <th>Doanh Thu Dự Kiến</th>
            <th>Tăng Trưởng</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in reports" :key="row.month">
            <td><strong>Tháng {{ row.month }}</strong></td>
            <td>{{ row.total_quantity.toLocaleString() }}</td>
            <td style="font-weight: 600; color: var(--primary);">{{ row.total_revenue.toLocaleString() }}đ</td>
            <td>
              <span v-if="row.total_quantity > 0" style="color: #10b981;">+5% 📈</span>
              <span v-else>--</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/reports/monthly';
const selectedYear = ref(new Date().getFullYear());
const reports = ref([]);

const fetchReports = async () => {
  try {
    const res = await axios.get(API_BASE, { params: { year: selectedYear.value } });
    // Fill in missing months if needed, but for now we just show what we have
    reports.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const totalYearlyRevenue = computed(() => {
  return reports.value.reduce((sum, row) => sum + row.total_revenue, 0);
});

const totalYearlyQuantity = computed(() => {
  return reports.value.reduce((sum, row) => sum + row.total_quantity, 0);
});

onMounted(fetchReports);
</script>
