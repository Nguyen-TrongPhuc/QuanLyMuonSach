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
                    <div class="card shadow-lg border-0 rounded-lg mt-5">
                        <div class="card-header text-center bg-primary text-white border-0">
                            <h3 class="fw-light my-4">
                                <i class="fa-solid fa-book-open-reader me-2"></i>
                                Thư viện Admin
                            </h3>
                        </div>
                        <div class="card-body p-4">
                            <form @submit.prevent="handleLogin">
                                <div class="form-floating mb-3">
                                    <input 
                                        class="form-control" 
                                        id="msnv" 
                                        type="text" 
                                        placeholder="MSNV" 
                                        v-model="credentials.MSNV"
                                        required
                                    />
                                    <label for="msnv">Mã số nhân viên</label>
                                </div>
                                <div class="form-floating mb-3">
                                    <input 
                                        class="form-control" 
                                        id="password" 
                                        type="password" 
                                        placeholder="Mật khẩu" 
                                        v-model="credentials.Password"
                                        required
                                    />
                                    <label for="password">Mật khẩu</label>
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
    background-color: #000000;
    background-image: linear-gradient(to bottom, #9dd3f2, #ffffff);
}
</style>