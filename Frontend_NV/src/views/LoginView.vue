<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';

const authStore = useAuthStore();
const credentials = ref({
    MSNV: '',
    Password: ''
});
const loading = ref(false);
const error = ref('');

async function handleLogin() {
    loading.value = true;
    error.value = '';
    const success = await authStore.login(credentials.value);
    if (!success) {
        error.value = 'Mã số nhân viên hoặc mật khẩu không đúng. Vui lòng thử lại.';
    }
    loading.value = false;
}
</script>

<template>
    <div class="login-wrapper">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-md-6 col-lg-5">
                    <div class="card login-card shadow-lg border-0 rounded-lg mt-5">
                        <div class="card-header text-center bg-primary text-white border-0">
                            <h3 class="fw-light my-4">
                                <i class="fa-solid fa-book-open-reader me-2"></i>
                                Thư viện Admin
                            </h3>
                        </div>
                        <div class="card-body p-4">
                            <form @submit.prevent="handleLogin">
                                <div class="input-group mb-3">
                                    <span class="input-group-text"><i class="fa-solid fa-user"></i></span>
                                    <input 
                                        class="form-control" 
                                        id="msnv" 
                                        type="text" 
                                        placeholder="MSNV" 
                                        v-model="credentials.MSNV"
                                        aria-label="Mã số nhân viên"
                                        required
                                    />
                                </div>
                                <div class="input-group mb-3">
                                    <span class="input-group-text"><i class="fa-solid fa-lock"></i></span>
                                    <input 
                                        class="form-control" 
                                        id="password" 
                                        type="password" 
                                        placeholder="Mật khẩu" 
                                        v-model="credentials.Password"
                                        aria-label="Mật khẩu"
                                        required
                                    />
                                </div>

                                <div v-if="error" class="alert alert-danger py-2">{{ error }}</div>

                                <div class="d-grid mt-4">
                                    <button class="btn btn-primary btn-lg" type="submit" :disabled="loading">
                                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                                        Đăng nhập
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-wrapper {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #141E30;  /* fallback for old browsers */
    background: -webkit-linear-gradient(to right, #243B55, #141E30);  /* Chrome 10-25, Safari 5.1-6 */
    background: linear-gradient(to right, #243B55, #141E30); /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
}

.login-card {
    background-color: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.login-card .card-header {
    background-color: transparent !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
}

.input-group-text {
    background-color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #fff;
}

.btn-primary {
    transition: all 0.3s ease-in-out;
}
</style>