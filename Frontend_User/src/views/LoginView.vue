<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const maDocGia = ref('');
const password = ref('');
const loginError = ref(false);
const loading = ref(false);

async function handleLogin() {
    loginError.value = false;
    loading.value = true;
    const credentials = {
        MaDocGia: maDocGia.value,
        Password: password.value,
    };

    const success = await authStore.login(credentials);
    if (!success) loginError.value = true;
    loading.value = false;
}
</script>

<template>
    <div class="login-wrapper">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card shadow-lg border-0 rounded-4">
                        <div class="card-body p-5">
                            <div class="text-center mb-4">
                                <h1 class="h4 text-gray-900 mb-2 fw-bold">Chào Mừng Trở Lại!</h1>
                                <p class="text-muted small">Đăng nhập để tiếp tục khám phá thư viện.</p>
                            </div>
                            
                            <form @submit.prevent="handleLogin">
                                <div class="form-floating mb-3">
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        id="maDocGia" 
                                        placeholder="Mã Độc Giả" 
                                        v-model="maDocGia" 
                                        required 
                                    />
                                    <label for="maDocGia"><i class="fa-solid fa-id-card me-2"></i>Mã Độc Giả</label>
                                </div>

                                <div class="form-floating mb-3">
                                    <input 
                                        type="password" 
                                        class="form-control" 
                                        id="password" 
                                        placeholder="Mật khẩu" 
                                        v-model="password" 
                                        required 
                                    />
                                    <label for="password"><i class="fa-solid fa-lock me-2"></i>Mật khẩu</label>
                                </div>

                                <div v-if="loginError" class="text-danger text-center mb-3">
                                    <i class="fa-solid fa-circle-exclamation me-1"></i>
                                    <span>Sai Mã Độc Giả hoặc Mật khẩu.</span>
                                </div>
                                
                                <div class="d-grid mt-4">
                                    <button type="submit" class="btn btn-success btn-lg rounded-pill btn-login" :disabled="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                        {{ loading ? 'Đang xử lý...' : 'Đăng nhập' }}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div> h
        </div>
    </div>
</template>

<style scoped>
.login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: linear-gradient(to bottom, #a7f3d0, #ffffff);
}

.btn-login {
    transition: all 0.2s ease-in-out;
}
.btn-login:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}
</style>