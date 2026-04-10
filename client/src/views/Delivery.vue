<template>
  <div class="delivery-view">
    <div class="header">
      <h1>Quản Lý Giao Hàng</h1>
      <div class="date-now">{{ new Date().toLocaleDateString('vi-VN') }}</div>
    </div>

    <div class="card">
      <h3 class="card-title">Danh Sách Suất Ăn Chờ Giao</h3>
      <div v-if="orders.length === 0" class="text-muted">
        Không có suất ăn nào đang chờ giao.
      </div>
      <div v-else style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>Khách Hàng</th>
              <th>Món Ăn</th>
              <th>Ca</th>
              <th>Số Lượng</th>
              <th>Người Nhận</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.id">
              <td><strong>{{ order.customer_name }}</strong></td>
              <td>{{ order.dish_name }}</td>
              <td><span class="badge badge-pending">Ca {{ order.shift }}</span></td>
              <td>{{ order.quantity }}</td>
              <td>
                <input type="text" v-model="deliveryData[order.id].recipient" class="form-input" style="padding: 0.25rem;" placeholder="Tên người nhận" />
              </td>
              <td style="display: flex; gap: 5px;">
                <button class="btn btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" @click="markDelivered(order)">
                  Xác nhận
                </button>
                <button class="btn" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" @click="openPrintModal(order)">
                  🖨️ In Phiếu
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Print Modal -->
    <div v-if="showPrintModal" class="modal-overlay">
      <div class="modal print-modal">
        <div id="print-area" class="delivery-note">
          <div class="note-header">
            <div class="company-info">
              <h2>CATERING PRO SERVICES</h2>
              <p>Địa chỉ: Khu Công nghiệp, TP. HCM</p>
              <p>Điện thoại: 0123.456.789</p>
            </div>
            <div class="note-title">
              <h1>PHIẾU GIAO HÀNG</h1>
              <p>Số: #{{ currentOrder.id }}</p>
            </div>
          </div>

          <div class="note-body">
            <div class="info-grid">
              <div><strong>Khách hàng:</strong> {{ currentOrder.customer_name }}</div>
              <div><strong>Ngày giao:</strong> {{ currentOrder.date }}</div>
              <div><strong>Ca:</strong> {{ currentOrder.shift }}</div>
              <div><strong>Món ăn:</strong> {{ currentOrder.dish_name }}</div>
            </div>

            <table class="note-table">
              <thead>
                <tr>
                  <th>Nội dung</th>
                  <th>Số lượng</th>
                  <th>Đơn vị</th>
                  <th>Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ currentOrder.dish_name }}</td>
                  <td>{{ currentOrder.quantity }}</td>
                  <td>Suất</td>
                  <td>Đóng gói khay</td>
                </tr>
              </tbody>
            </table>

            <div class="signature-area">
              <div class="sig-box">
                <p><strong>Người giao hàng</strong></p>
                <p>(Ký, ghi rõ họ tên)</p>
              </div>
              <div class="sig-box">
                <p><strong>Người nhận hàng</strong></p>
                <p>(Ký, ghi rõ họ tên)</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="no-print" style="margin-top: 2rem; display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn" @click="showPrintModal = false">Đóng</button>
          <button class="btn btn-primary" @click="printNote">In ngay</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
const orders = ref([]);
const deliveryData = ref({});
const showPrintModal = ref(false);
const currentOrder = ref(null);

const fetchOrders = async () => {
  try {
    const res = await axios.get(`${API_URL}/orders`);
    orders.value = res.data.filter(o => o.status === 'Pending');
    
    orders.value.forEach(o => {
      if (!deliveryData.value[o.id]) {
        deliveryData.value[o.id] = { recipient: '' };
      }
    });
  } catch (err) {
    console.error(err);
  }
};

const markDelivered = async (order) => {
  const data = deliveryData.value[order.id];
  try {
    await axios.post(`${API_URL}/delivery`, {
      order_id: order.id,
      delivery_time: new Date().toLocaleTimeString(),
      recipient_name: data.recipient || 'N/A',
      status: 'Delivered'
    });
    alert('Đã xác nhận giao hàng.');
    fetchOrders(); 
  } catch (err) {
    console.error(err);
  }
};

const openPrintModal = (order) => {
  currentOrder.value = order;
  showPrintModal.value = true;
};

const printNote = () => {
  window.print();
};

onMounted(fetchOrders);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
}

.delivery-note {
  font-family: 'Times New Roman', Times, serif;
  color: black;
}

.note-header {
  display: flex;
  justify-content: space-between;
  border-bottom: 2px solid black;
  padding-bottom: 1rem;
  margin-bottom: 2rem;
}

.note-title { text-align: right; }
.note-title h1 { margin: 0; font-size: 1.5rem; }

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.note-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 3rem;
}
.note-table th, .note-table td {
  border: 1px solid black;
  padding: 10px;
  text-align: center;
}

.signature-area {
  display: flex;
  justify-content: space-around;
  margin-top: 3rem;
}
.sig-box { text-align: center; min-height: 100px; }

@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  }
  .no-print { display: none !important; }
}
</style>
