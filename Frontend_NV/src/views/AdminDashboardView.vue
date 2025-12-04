<script setup>
import { RouterLink, RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
const authStore = useAuthStore();
function handleLogout() {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
        authStore.logout();
    }
}
</script>

<template>
    <div class="admin-layout">
        <main class="main-content p-4">
            <nav class="navbar navbar-light bg-white rounded mb-4 p-3 shadow-sm">
                <div class="ms-auto">
                    <span class="navbar-text">
                        <i class="fa-solid fa-user-tie me-2"></i>
                        Chào, <strong>{{ authStore.user?.HoTenNV }}</strong>
                    </span>
                </div>
            </nav>

            <div class="bg-white p-4 rounded shadow-sm">
                <RouterView />
            </div>
        </main>

        <footer class="bottom-nav bg-dark text-white p-2 shadow-lg">
            <ul class="nav nav-pills justify-content-center">
                <li class="nav-item">
                    <RouterLink to="/admin" class="nav-link text-white" exact-active-class="active">
                        <i class="fa-solid fa-chart-line d-block mx-auto"></i>
                        <span class="nav-text">Tổng quan</span>
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink to="/admin/books" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-book d-block mx-auto"></i>
                        <span class="nav-text">Sách</span>
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink to="/admin/users" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-users d-block mx-auto"></i>
                        <span class="nav-text">Độc Giả</span>
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink to="/admin/borrows" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-right-left d-block mx-auto"></i>
                        <span class="nav-text">Mượn/Trả</span>
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <RouterLink to="/admin/publishers" class="nav-link text-white" active-class="active">
                        <i class="fa-solid fa-building d-block mx-auto"></i>
                        <span class="nav-text">NXB</span>
                    </RouterLink>
                </li>
                <li class="nav-item">
                    <a href="#" class="nav-link text-white" @click.prevent="handleLogout">
                        <i class="fa-solid fa-right-from-bracket d-block mx-auto"></i>
                        <span class="nav-text">Đăng xuất</span>
                    </a>
                </li>
            </ul>
        </footer>
    </div>
</template>

<style scoped>
.admin-layout {
    min-height: 100vh;
    background-color: #000000; /* Màu nền vàng nhạt dự phòng */
    background-image: linear-gradient(to bottom, #9dd3f2, #ffffff); /* Gradient màu vàng nhạt */
}

.main-content {
    padding-bottom: 160px; /* Tăng thêm khoảng trống để không che các nút ở form dài */
}

.bottom-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1030;
}

.nav-pills .nav-link {
    text-align: center;
    padding: 0.5rem 1rem;
}

.nav-pills .nav-link.active,
.nav-pills .show>.nav-link {
    background-color: #0d6efd;
}

.nav-text {
    font-size: 0.75rem;
}
</style>