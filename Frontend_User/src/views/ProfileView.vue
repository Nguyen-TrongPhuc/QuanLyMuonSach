<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import AppHeader from '@/components/AppHeader.vue';
import { authApiService } from '@/services/api.service';// Dùng apiService thường, nhưng cần auth (chúng ta đã cấu hình interceptor rồi)

const authStore = useAuthStore();
const activeTab = ref('info'); // 'info' hoặc 'password'
const loading = ref(false);

// Dữ liệu form thông tin
const userInfo = ref({
    HoLot: '', Ten: '', NgaySinh: '', Phai: 'Nam', DiaChi: '', DienThoai: ''
});

// Dữ liệu form đổi mật khẩu
const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
});

// Lấy thông tin user mới nhất từ Server
async function fetchProfile() {
    // Vì ta chưa có API get /profile, ta có thể dùng lại thông tin trong authStore
    // Hoặc gọi API get user by ID. Ở đây tạm dùng authStore cho nhanh
    const user = authStore.user;
    userInfo.value = { ...user };
}

// Cập nhật thông tin
async function handleUpdateProfile() {
    loading.value = true;
    try {
        const response = await authApiService.put('/docgias/profile', userInfo.value);
        alert("Cập nhật thành công!");
        // Cập nhật lại kho Pinia và LocalStorage
        authStore.user = { ...authStore.user, ...response.data.user };
        localStorage.setItem("user", JSON.stringify(authStore.user));
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
        loading.value = false;
    }
}

// Đổi mật khẩu
async function handleChangePassword() {
    if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
        alert("Mật khẩu xác nhận không khớp!");
        return;
    }
    
    loading.value = true;
    try {
        await authApiService.post('/docgias/change-password', {
            oldPassword: passwordForm.value.oldPassword,
            newPassword: passwordForm.value.newPassword
        });
        alert("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
        authStore.logout();
    } catch (err) {
        alert("Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchProfile();
});
</script>

<template>
    <div class="profile-page">
        <AppHeader />
        <div class="container py-5">
            <div class="row justify-content-center">
                <div class="col-lg-8">
                    <div class="card shadow-lg border-0 rounded-4 profile-card">
                        <!-- Profile Header -->
                        <div class="card-body text-center profile-header">
                            <i class="fa-solid fa-user-circle fa-5x text-success mb-3"></i>
                            <h3 class="fw-bold mb-0">{{ userInfo.HoLot }} {{ userInfo.Ten }}</h3>
                            <p class="text-muted mb-0">{{ authStore.user?.MaDocGia }}</p>
                        </div>
                        <div class="card-header bg-light border-top border-bottom-0 pt-3 pb-0 px-4">
                            <ul class="nav nav-tabs card-header-tabs">
                                <li class="nav-item">
                                    <a class="nav-link fw-bold" :class="{ active: activeTab === 'info' }" href="#" @click.prevent="activeTab = 'info'">
                                        <i class="fa-solid fa-user-edit me-2"></i> Cập nhật thông tin
                                    </a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link fw-bold" :class="{ active: activeTab === 'password' }" href="#" @click.prevent="activeTab = 'password'">
                                        <i class="fa-solid fa-key me-2"></i> Đổi mật khẩu
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div class="card-body p-4">
                            <Transition name="fade" mode="out-in">
                                <!-- Form cập nhật thông tin -->
                                <form v-if="activeTab === 'info'" @submit.prevent="handleUpdateProfile" key="info-form">
                                    <div class="row">
                                        <div class="col-md-6 mb-3">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="hoLot" placeholder="Họ Lót" v-model="userInfo.HoLot" required>
                                                <label for="hoLot">Họ Lót</label>
                                            </div>
                                        </div>
                                        <div class="col-md-6 mb-3">
                                            <div class="form-floating">
                                                <input type="text" class="form-control" id="ten" placeholder="Tên" v-model="userInfo.Ten" required>
                                                <label for="ten">Tên</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-floating mb-3">
                                        <input type="date" class="form-control" id="ngaySinh" placeholder="Ngày sinh" v-model="userInfo.NgaySinh">
                                        <label for="ngaySinh">Ngày sinh</label>
                                    </div>
                                    <div class="form-floating mb-3">
                                        <input type="tel" class="form-control" id="dienThoai" placeholder="Điện thoại" v-model="userInfo.DienThoai">
                                        <label for="dienThoai">Điện thoại</label>
                                    </div>
                                    <div class="form-floating mb-3">
                                        <input type="text" class="form-control" id="diaChi" placeholder="Địa chỉ" v-model="userInfo.DiaChi">
                                        <label for="diaChi">Địa chỉ</label>
                                    </div>
                                    <div class="text-center">
                                        <button type="submit" class="btn btn-success btn-action" :disabled="loading">
                                            <i class="fa-solid fa-save me-1"></i> Lưu thay đổi
                                        </button>
                                    </div>
                                </form>

                                <!-- Form đổi mật khẩu -->
                                <form v-else-if="activeTab === 'password'" @submit.prevent="handleChangePassword" key="password-form">
                                    <div class="form-floating mb-3">
                                        <input type="password" class="form-control" id="oldPassword" placeholder="Mật khẩu cũ" v-model="passwordForm.oldPassword" required>
                                        <label for="oldPassword">Mật khẩu cũ</label>
                                    </div>
                                    <div class="form-floating mb-3">
                                        <input type="password" class="form-control" id="newPassword" placeholder="Mật khẩu mới" v-model="passwordForm.newPassword" required>
                                        <label for="newPassword">Mật khẩu mới</label>
                                    </div>
                                    <div class="form-floating mb-3">
                                        <input type="password" class="form-control" id="confirmPassword" placeholder="Xác nhận mật khẩu mới" v-model="passwordForm.confirmPassword" required>
                                        <label for="confirmPassword">Xác nhận mật khẩu mới</label>
                                    </div>
                                    <div class="text-center">
                                        <button type="submit" class="btn btn-danger btn-action" :disabled="loading">
                                            <i class="fa-solid fa-check me-1"></i> Xác nhận đổi mật khẩu
                                        </button>
                                    </div>
                                </form>
                            </Transition>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.profile-page {
    min-height: 100vh;
    background-image: linear-gradient(to bottom, #a7f3d0, #ffffff);
}

.profile-card {
    animation: slideUpFadeIn 0.6s ease-out forwards;
}

.profile-header {
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
}

.nav-tabs {
    border-bottom: 0;
}

.nav-tabs .nav-link {
    border: 0;
    color: #6c757d;
}

.nav-tabs .nav-link.active {
    color: #198754;
    border-bottom: 2px solid #198754;
    background-color: transparent;
}

.btn-action {
    transition: all 0.3s ease;
}
.btn-action:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0,0,0,0.15);
}

/* Animation cho card */
@keyframes slideUpFadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Animation cho chuyển tab */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

</style>