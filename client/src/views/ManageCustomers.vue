<template>
  <div class="manage-customers">
    <div class="header">
      <h1>Quản Lý Khách Hàng</h1>
      <button class="btn btn-primary" @click="showAddModal = true">
        + Thêm Khách Hàng
      </button>
    </div>

    <div class="card">
      <div style="overflow-x: auto;">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên Công Ty</th>
              <th>Liên Hệ</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in customers" :key="c.id">
              <td>#{{ c.id }}</td>
              <td><strong>{{ c.name }}</strong></td>
              <td>{{ c.contact }}</td>
              <td>
                <button class="btn" @click="editCustomer(c)">✏️</button>
                <button class="btn" @click="deleteCustomer(c.id)" style="color: #ef4444;">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" class="modal-overlay">
      <div class="modal">
        <h3>{{ editingId ? 'Cập Nhật' : 'Thêm' }} Khách Hàng</h3>
        <form @submit.prevent="saveCustomer">
          <div class="form-group">
            <label class="form-label">Tên Công Ty</label>
            <input type="text" v-model="form.name" class="form-input" required />
          </div>
          <div class="form-group">
            <label class="form-label">Số Điện Thoại / Liên Hệ</label>
            <input type="text" v-model="form.contact" class="form-input" required />
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn" @click="closeModal">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_URL = 'http://localhost:3001/api/customers';
const customers = ref([]);
const showAddModal = ref(false);
const editingId = ref(null);
const form = ref({ name: '', contact: '' });

const fetchCustomers = async () => {
  const res = await axios.get(API_URL);
  customers.value = res.data;
};

const editCustomer = (c) => {
  editingId.value = c.id;
  form.value = { ...c };
  showAddModal.value = true;
};

const deleteCustomer = async (id) => {
  if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
    await axios.delete(`${API_URL}/${id}`);
    fetchCustomers();
  }
};

const saveCustomer = async () => {
  if (editingId.value) {
    await axios.put(`${API_URL}/${editingId.value}`, form.value);
  } else {
    await axios.post(API_URL, form.value);
  }
  closeModal();
  fetchCustomers();
};

const closeModal = () => {
  showAddModal.value = false;
  editingId.value = null;
  form.value = { name: '', contact: '' };
};

onMounted(fetchCustomers);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
}
</style>
