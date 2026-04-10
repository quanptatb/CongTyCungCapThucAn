<template>
  <div v-if="isOpen" class="modal-overlay">
    <div class="modal excel-modal">
      <div class="header">
        <h3>Import Đơn Hàng Từ Excel</h3>
        <button class="btn btn-close" @click="$emit('close')">✕</button>
      </div>

      <div class="modal-body">
        <div v-if="!previewData.length" class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
          <input type="file" id="fileInput" hidden accept=".xlsx, .xls" @change="handleFile" />
          <label for="fileInput" class="upload-label">
            <span class="icon">📁</span>
            <p>Kéo thả hoặc click để chọn file Excel (.xlsx)</p>
          </label>
        </div>

        <div v-else class="preview-area">
          <div class="alert alert-info">
            Đã nhận diện: <strong>{{ matchedCount }}</strong> / {{ previewData.length }} dòng dữ liệu.
          </div>
          
          <div class="scroll-table">
            <table>
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Khách Hàng</th>
                  <th>Món Ăn</th>
                  <th>Ca 1</th>
                  <th>Ca 2</th>
                  <th>Ca 3</th>
                  <th>Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, idx) in previewData" :key="idx" :class="{ 'row-error': !row.isValid }">
                  <td>{{ row.date }}</td>
                  <td>{{ row.customerName }}</td>
                  <td>{{ row.dishName }}</td>
                  <td>{{ row.shift1 }}</td>
                  <td>{{ row.shift2 }}</td>
                  <td>{{ row.shift3 }}</td>
                  <td>
                    <span v-if="row.isValid" class="badge badge-completed">Hợp lệ</span>
                    <span v-else class="badge badge-error" :title="row.error">{{ row.error }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button class="btn" @click="reset">Làm lại</button>
        <button class="btn btn-primary" :disabled="!isReady" @click="submitImport">
          Import {{ matchedCount }} dòng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import axios from 'axios';

const props = defineProps(['isOpen', 'customers', 'menu']);
const emit = defineEmits(['close', 'success']);

const previewData = ref([]);
const isReady = computed(() => previewData.value.some(r => r.isValid));
const matchedCount = computed(() => previewData.value.filter(r => r.isValid).length);

const reset = () => {
  previewData.value = [];
};

const handleFile = (e) => {
  const file = e.target.files[0];
  if (file) parseExcel(file);
};

const handleDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file) parseExcel(file);
};

const parseExcel = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    processJson(json);
  };
  reader.readAsArrayBuffer(file);
};

const processJson = (rows) => {
  if (rows.length < 2) return;
  const headers = rows[0].map(h => h?.toString().toUpperCase().trim());
  
  // Dynamic header mapping
  const findCol = (keys) => headers.findIndex(h => keys.some(k => h?.includes(k)));
  const colMap = {
    date: findCol(['NGÀY', 'DATE', 'NGAY']),
    customer: findCol(['KHÁCH HÀNG', 'KH', 'CUSTOMER']),
    dish: findCol(['MÓN', 'DISH', 'MON']),
    s1: findCol(['CA 1', 'SHIFT 1']),
    s2: findCol(['CA 2', 'SHIFT 2']),
    s3: findCol(['CA 3', 'SHIFT 3'])
  };

  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length === 0) continue;

    const rawCust = row[colMap.customer]?.toString().trim();
    const rawDish = row[colMap.dish]?.toString().trim();
    
    const customer = props.customers.find(c => c.name.toLowerCase() === rawCust?.toLowerCase());
    const dish = props.menu.find(m => m.name.toLowerCase() === rawDish?.toLowerCase());

    const item = {
      date: row[colMap.date] ? formatDate(row[colMap.date]) : '',
      customerName: rawCust,
      dishName: rawDish,
      shift1: parseInt(row[colMap.s1]) || 0,
      shift2: parseInt(row[colMap.s2]) || 0,
      shift3: parseInt(row[colMap.s3]) || 0,
      customer_id: customer?.id,
      menu_id: dish?.id,
      isValid: false,
      error: ''
    };

    if (!customer) item.error = 'Sai tên khách hàng';
    else if (!dish) item.error = 'Sai tên món ăn';
    else if (!item.date) item.error = 'Thiếu ngày';
    else item.isValid = true;

    results.push(item);
  }
  previewData.value = results;
};

const formatDate = (val) => {
  if (typeof val === 'number') {
    // Excel date
    const date = new Date((val - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0];
  }
  return val; // Assume ISO string already
};

const submitImport = async () => {
  const validOrders = [];
  previewData.value.filter(r => r.isValid).forEach(r => {
    if (r.shift1 > 0) validOrders.push({ ...r, shift: 1, quantity: r.shift1 });
    if (r.shift2 > 0) validOrders.push({ ...r, shift: 2, quantity: r.shift2 });
    if (r.shift3 > 0) validOrders.push({ ...r, shift: 3, quantity: r.shift3 });
  });

  try {
    await axios.post('http://localhost:3001/api/orders/bulk', validOrders);
    emit('success');
    emit('close');
  } catch (err) {
    alert('Lỗi khi import dữ liệu.');
  }
};
</script>

<style scoped>
.excel-modal { max-width: 900px; width: 95%; }
.upload-area {
  border: 2px dashed var(--border);
  border-radius: 12px;
  padding: 3rem;
  text-align: center;
  cursor: pointer;
}
.upload-area:hover { border-color: var(--primary); background: #f0fdf4; }
.scroll-table { max-height: 400px; overflow-y: auto; margin-top: 1rem; }
.row-error { background: #fff1f2; }
.badge-error { background: #fee2e2; color: #991b1b; }
.alert-info { background: #eff6ff; color: #1e40af; padding: 1rem; border-radius: 8px; }
</style>
