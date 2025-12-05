<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiService } from '@/services/api.service';
import { useAuthStore } from '@/stores/auth.store';
import AppHeader from '@/components/AppHeader.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const book = ref(null);
const loading = ref(true);
const error = ref(null);
const publisherName = ref('');
// Tải chi tiết sách dựa vào ID trên URL
async function fetchBookDetail() {
    try {
        const id = route.params.id;
        
        // 2. GỌI SONG SONG 2 API: Lấy Sách VÀ Lấy DS Nhà Xuất Bản
        const [bookRes, pubRes] = await Promise.all([
            apiService.get(`/sachs/${id}`),
            apiService.get('/nhaxuatbans')
        ]);

        book.value = bookRes.data;
        
        // 3. TÌM TÊN NXB TƯƠNG ỨNG
        const publishers = pubRes.data;
        const foundPub = publishers.find(p => p.MaNXB === book.value.MaNXB);
        
        // Nếu tìm thấy thì lấy tên, không thì hiện lại cái Mã cũ
        publisherName.value = foundPub ? foundPub.TenNXB : book.value.MaNXB;

    } catch (err) {
        error.value = "Không tìm thấy thông tin sách.";
        console.error(err);
    } finally {
        loading.value = false;
    }
}

// Xử lý mượn sách (Logic giống trang chủ)
async function handleBorrow() {
    if (!authStore.token) {
        alert("Vui lòng đăng nhập để mượn sách!");
        router.push('/login');
        return;
    }
    
    if (book.value.soQuyenHienCo <= 0) {
        alert("Sách này tạm thời đã hết!");
        return;
    }

    if (confirm(`Đăng ký mượn sách: "${book.value.TenSach}"?`)) {
        try {
            const today = new Date().toISOString().split('T')[0];
            await apiService.post('/muonsachs', {
                MaDocGia: authStore.user.MaDocGia,
                MaSach: book.value.MaSach,
                NgayMuon: today
            });
            alert("Đăng ký thành công! Vui lòng chờ duyệt.");
            // Tải lại để cập nhật tồn kho
            fetchBookDetail(); 
        } catch (err) {
            alert("Lỗi: " + (err.response?.data?.message || err.message));
        }
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

onMounted(() => {
    fetchBookDetail();
});
</script>

<template>
    <div class="book-detail-page">
        <AppHeader />
        <div class="container py-5">
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-success"></div>
            </div>
            <div v-else-if="error" class="alert alert-danger text-center">
                {{ error }} <br>
                <RouterLink to="/" class="btn btn-outline-danger mt-3">Quay lại trang chủ</RouterLink>
            </div>

            <div v-else class="card shadow-lg border-0 rounded-4">
                <div class="card-body p-4 p-lg-5">
                    <div class="row g-5">
                        <div class="col-lg-4">
                            <div class="book-cover-wrapper sticky-top">
                                <img 
                                    :src="book.HinhAnh || 'https://placehold.co/400x600?text=No+Image'" 
                                    class="img-fluid w-100 rounded-4 shadow"
                                    alt="Book Cover"
                                >
                            </div>
                        </div>

                        <div class="col-lg-8 book-details">
                            <span class="badge bg-success bg-opacity-10 text-success mb-3 px-3 py-2 rounded-pill">
                                {{ book.TheLoai || 'Sách tham khảo' }}
                            </span>

                            <h1 class="fw-bold mb-3">{{ book.TenSach }}</h1>
                            
                            <div class="d-flex align-items-center mb-4 text-muted">
                                <span class="me-3"><i class="fa-solid fa-user-pen me-1"></i> Tác giả: <strong>{{ book.TacGia }}</strong></span>
                                <span class="me-3">|</span>
                                <span><i class="fa-solid fa-barcode me-1"></i> Mã: {{ book.MaSach }}</span>
                            </div>

                            <div class="p-4 bg-light rounded-4 mb-4">
                                <div class="row text-center">
                                    <div class="col-6 border-end">
                                        <div class="text-muted small mb-1">Đơn giá</div>
                                        <div class="h4 fw-bold text-success mb-0">{{ formatCurrency(book.DonGia) }}</div>
                                    </div>
                                    <div class="col-6">
                                        <div class="text-muted small mb-1">Tình trạng</div>
                                        <div class="h4 fw-bold mb-0" :class="book.soQuyenHienCo > 0 ? 'text-success' : 'text-danger'">
                                            {{ book.soQuyenHienCo > 0 ? `Còn ${book.soQuyenHienCo} quyển` : 'Hết hàng' }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="description-box mt-4 p-4 rounded-4">
                                <h5 class="fw-bold mb-3"><i class="fa-solid fa-align-left me-2"></i>Giới thiệu nội dung</h5>
                                <p class="text-secondary" style="line-height: 1.8;">
                                    {{ book.MoTa || 'Đang cập nhật nội dung cho cuốn sách này...' }}
                                </p>
                            </div>

                            <div class="specs-box mt-4">
                                <h5 class="fw-bold mb-3"><i class="fa-solid fa-list-check me-2"></i>Thông số</h5>
                                <ul class="list-group list-group-flush">
                                    <li class="list-group-item d-flex justify-content-between align-items-center"><span><i class="fa-solid fa-building fa-fw me-2 text-muted"></i>Nhà xuất bản</span> <strong>{{ publisherName }}</strong></li>
                                    <li class="list-group-item d-flex justify-content-between align-items-center"><span><i class="fa-solid fa-calendar-days fa-fw me-2 text-muted"></i>Năm xuất bản</span> <strong>{{ book.NamXuatBan }}</strong></li>
                                </ul>
                            </div>


                            <div class="d-flex gap-3">
                                <button 
                                    class="btn btn-success btn-lg px-5 rounded-pill btn-borrow" 
                                    :disabled="book.soQuyenHienCo <= 0"
                                    @click="handleBorrow"
                                >
                                    <i class="fa-solid fa-hand-holding-hand me-2"></i> 
                                    {{ book.soQuyenHienCo > 0 ? 'Đăng ký Mượn' : 'Tạm hết hàng' }}
                                </button>
                                
                                <RouterLink to="/" class="btn btn-outline-secondary btn-lg rounded-pill px-4">
                                    <i class="fa-solid fa-arrow-left me-1"></i> Quay lại
                                </RouterLink>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.book-detail-page {
    min-height: 100vh;
    background-image: linear-gradient(to bottom, #a7f3d0, #ffffff);
}

.book-cover-wrapper {
    top: 120px; /* Khoảng cách từ top để không bị header che */
}

.description-box {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
}

.btn-borrow {
    transition: all 0.2s ease-in-out;
}
.btn-borrow:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(25, 135, 84, 0.3);
}

/* Animation */
.book-details > * {
    animation: fadeIn 0.5s ease-out forwards;
    opacity: 0;
}

@keyframes fadeIn {
    to { opacity: 1; }
}
</style>