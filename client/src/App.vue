<template>
  <div class="app-container">
    <aside class="sidebar">
      <div class="logo">
        <span class="icon">🍱</span>
        <span>CATERING PRO</span>
      </div>
      <nav class="nav-links">
        <router-link to="/" class="nav-item" active-class="active">
          Dashboard
        </router-link>
        <router-link to="/orders" class="nav-item" active-class="active">
          Báo Số Lượng (Orders)
        </router-link>
        <router-link to="/market" class="nav-item" active-class="active">
          Đi Chợ (Market)
        </router-link>
        <router-link to="/delivery" class="nav-item" active-class="active">
          Giao Hàng (Delivery)
        </router-link>
        <div style="margin-top: 1.5rem; padding: 0 1rem; font-size: 0.75rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.05em;">Quản Lý</div>
        <router-link to="/manage-customers" class="nav-item" active-class="active">
          Khách Hàng
        </router-link>
        <router-link to="/manage-menu" class="nav-item" active-class="active">
          Thực Đơn & Món
        </router-link>
      </nav>
    </aside>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
// No logic needed here for now
</script>

<style scoped>
.icon {
  font-size: 1.8rem;
}
</style>
