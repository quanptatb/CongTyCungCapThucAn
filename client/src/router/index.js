import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Orders from '../views/Orders.vue'
import Market from '../views/Market.vue'
import Delivery from '../views/Delivery.vue'
import ManageCustomers from '../views/ManageCustomers.vue'
import ManageMenu from '../views/ManageMenu.vue'
import Reports from '../views/Reports.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/orders', name: 'Orders', component: Orders },
  { path: '/market', name: 'Market', component: Market },
  { path: '/delivery', name: 'Delivery', component: Delivery },
  { path: '/manage-customers', name: 'ManageCustomers', component: ManageCustomers },
  { path: '/manage-menu', name: 'ManageMenu', component: ManageMenu },
  { path: '/reports', name: 'Reports', component: Reports },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
