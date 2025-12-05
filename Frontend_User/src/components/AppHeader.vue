<script setup>
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();

function handleLogout() {
    if(confirm("Đăng xuất?")) {
        authStore.logout();
    }
}
</script>

<template>
    <nav class="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top">
        <div class="container">
            <RouterLink to="/" class="navbar-brand fw-bold">
                <i class="fa-solid fa-swatchbook me-2"></i> Thư Viện Sách
            </RouterLink>
            
            <!-- Menu người dùng -->
            <div class="dropdown">
                <a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fa-solid fa-user-circle fa-lg me-2"></i>
                    <span class="d-none d-md-inline"><strong>{{ authStore.user?.Ten }}</strong></span>
                </a>
                <ul class="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="dropdownUser">
                    <li>
                        <RouterLink to="/my-books" class="dropdown-item">
                            <i class="fa-solid fa-bookmark fa-fw me-2 text-muted"></i>Sách của tôi
                        </RouterLink>
                    </li>
                    <li>
                        <RouterLink to="/profile" class="dropdown-item">
                            <i class="fa-solid fa-address-card fa-fw me-2 text-muted"></i>Thông tin cá nhân
                        </RouterLink>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item text-danger" href="#" @click.prevent="handleLogout">
                            <i class="fa-solid fa-right-from-bracket fa-fw me-2"></i>Đăng xuất
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>