<template>
  <div class="manage-menu">
    <div class="header">
      <h1>Quản Lý Thực Đơn & Công Thức</h1>
      <button class="btn btn-primary" @click="showAddMenuModal = true">
        + Thêm Món Ăn
      </button>
    </div>

    <div class="grid" style="grid-template-columns: 1fr 2fr;">
      <!-- Menu List -->
      <div class="card">
        <h3 class="card-title">Danh Sách Món Ăn</h3>
        <ul class="menu-list">
          <li v-for="m in menu" :key="m.id" 
              :class="['menu-item', { active: selectedMenu?.id === m.id }]"
              @click="selectMenu(m)">
            <div class="menu-info">
              <div class="menu-name">{{ m.name }}</div>
              <div class="menu-cat">{{ m.category }}</div>
            </div>
            <button class="btn-icon" @click.stop="deleteMenu(m.id)">🗑️</button>
          </li>
        </ul>
      </div>

      <!-- Ingredient Management -->
      <div v-if="selectedMenu" class="card">
        <div class="header" style="margin-bottom: 1rem;">
          <h3 class="card-title" style="margin-bottom: 0;">Định Mức Nguyên Liệu: {{ selectedMenu.name }}</h3>
          <button class="btn btn-primary" style="padding: 0.5rem 1rem;" @click="showAddIngModal = true">
            + Thêm Nguyên Liệu
          </button>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tên Nguyên Liệu</th>
              <th>Định Mức (mỗi suất)</th>
              <th>Đơn Vị</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="ing in ingredients" :key="ing.id">
              <td><strong>{{ ing.item_name }}</strong></td>
              <td>{{ ing.amount_per_portion }}</td>
              <td>{{ ing.unit }}</td>
              <td>
                <button class="btn" @click="deleteIngredient(ing.id)" style="color: #ef4444;">🗑️</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="card" style="display: flex; align-items: center; justify-content: center; color: var(--text-muted);">
        Chọn một món ăn bên trái để xem công thức.
      </div>
    </div>

    <!-- Add Menu Modal -->
    <div v-if="showAddMenuModal" class="modal-overlay">
      <div class="modal">
        <h3>Thêm Món Ăn Mới</h3>
        <form @submit.prevent="saveMenu">
          <div class="form-group">
            <label class="form-label">Tên Món</label>
            <input type="text" v-model="menuForm.name" class="form-input" required placeholder="VD: Cơm Cá Kho" />
          </div>
          <div class="form-group">
            <label class="form-label">Phân Loại</label>
            <select v-model="menuForm.category" class="form-input">
              <option value="Main">Món Chính</option>
              <option value="Side">Món Phụ</option>
              <option value="Soup">Canh</option>
            </select>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn" @click="showAddMenuModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Ingredient Modal -->
    <div v-if="showAddIngModal" class="modal-overlay">
      <div class="modal">
        <h3>Thêm Nguyên Liệu (Định Mức)</h3>
        <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 1rem;">
          Định mức là số lượng dành cho 1 suất ăn.
        </p>
        <form @submit.prevent="saveIngredient">
          <div class="form-group">
            <label class="form-label">Tên Nguyên Liệu</label>
            <input type="text" v-model="ingForm.item_name" class="form-input" required placeholder="VD: Cá nục" />
          </div>
          <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 10px;">
            <div class="form-group">
              <label class="form-label">Định mức</label>
              <input type="number" v-model="ingForm.amount_per_portion" class="form-input" required step="0.01" />
            </div>
            <div class="form-group">
              <label class="form-label">Đơn vị</label>
              <input type="text" v-model="ingForm.unit" class="form-input" required placeholder="g, ml, cái..." />
            </div>
          </div>
          <div style="display: flex; gap: 10px; justify-content: flex-end;">
            <button type="button" class="btn" @click="showAddIngModal = false">Hủy</button>
            <button type="submit" class="btn btn-primary">Thêm</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const menu = ref([]);
const selectedMenu = ref(null);
const ingredients = ref([]);

const showAddMenuModal = ref(false);
const showAddIngModal = ref(false);

const menuForm = ref({ name: '', category: 'Main' });
const ingForm = ref({ item_name: '', amount_per_portion: 0, unit: 'g' });

const fetchMenu = async () => {
  const res = await axios.get(`${API_BASE}/menu`);
  menu.value = res.data;
  if (menu.value.length > 0 && !selectedMenu.value) {
    selectMenu(menu.value[0]);
  }
};

const selectMenu = async (m) => {
  selectedMenu.value = m;
  const res = await axios.get(`${API_BASE}/menu/${m.id}/ingredients`);
  ingredients.value = res.data;
};

const saveMenu = async () => {
  await axios.post(`${API_BASE}/menu`, menuForm.value);
  showAddMenuModal.value = false;
  menuForm.value = { name: '', category: 'Main' };
  fetchMenu();
};

const deleteMenu = async (id) => {
  if (confirm('Xóa món ăn sẽ không thể hoàn tác. Tiếp tục?')) {
    await axios.delete(`${API_BASE}/menu/${id}`);
    if (selectedMenu.value?.id === id) selectedMenu.value = null;
    fetchMenu();
  }
};

const saveIngredient = async () => {
  if (!selectedMenu.value) return;
  await axios.post(`${API_BASE}/menu/${selectedMenu.value.id}/ingredients`, ingForm.value);
  showAddIngModal.value = false;
  ingForm.value = { item_name: '', amount_per_portion: 0, unit: 'g' };
  selectMenu(selectedMenu.value);
};

const deleteIngredient = async (id) => {
  await axios.delete(`${API_BASE}/ingredients/${id}`);
  selectMenu(selectedMenu.value);
};

onMounted(fetchMenu);
</script>

<style scoped>
.menu-list {
  list-style: none;
}
.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.5rem;
  transition: background 0.2s;
}
.menu-item:hover {
  background: var(--bg-main);
}
.menu-item.active {
  background: #ecfdf5;
  border: 1px solid var(--primary);
}
.menu-name {
  font-weight: 600;
}
.menu-cat {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.3;
}
.btn-icon:hover {
  opacity: 1;
}
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
  max-width: 450px;
}
</style>
