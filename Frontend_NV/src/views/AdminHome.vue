<script setup>
import { ref, onMounted } from 'vue';
import { authApiService } from '@/services/api.service';
// Biến lưu số liệu thống kê
const stats = ref({
    totalBooks: 0,
    totalReaders: 0,
    borrowing: 0,
    overdue: 0
});
const loading = ref(true);
// Hàm tải và tính toán số liệu
async function fetchStats() {
    loading.value = true;
    try {
        // Gọi 3 API song song
        const [booksRes, readersRes, borrowsRes] = await Promise.all([
            authApiService.get('/sachs'),
            authApiService.get('/docgias'),
            authApiService.get('/muonsachs')
        ]);

        const books = booksRes.data;
        const readers = readersRes.data;
        const borrows = borrowsRes.data;

        // Tổng số sách
        stats.value.totalBooks = books.length;

        // Tổng số độc giả
        stats.value.totalReaders = readers.length;

        // Đang mượn (những phiếu chưa có NgayTra)
        const activeBorrows = borrows.filter(item => !item.NgayTra);
        stats.value.borrowing = activeBorrows.length;

        // Quá hạn (Đang mượn và Ngày hiện tại > Hạn trả)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset giờ để so sánh ngày chính xác

        stats.value.overdue = activeBorrows.filter(item => {
            if (!item.HanTra) return false;
            const dueDate = new Date(item.HanTra);
            dueDate.setHours(0, 0, 0, 0);
            return today > dueDate;
        }).length;

    } catch (err) {
        console.error("Lỗi tải thống kê:", err);
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    fetchStats();
});
</script>

<template>
    <div class="admin-home">
        <h2 class="mb-4 text-secondary fw-bold">
            <i class="fa-solid fa-chart-line me-2"></i>Tổng quan Thư viện
        </h2>

        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-secondary" role="status"></div>
            <p class="mt-2 text-muted">Đang tổng hợp số liệu...</p>
        </div>

        <div v-else class="row g-4">
            <div class="col-md-6">
                <div class="stat-card stat-card-primary h-100">
                    <div class="card-body text-center">
                        <i class="fa-solid fa-book fa-3x mb-3"></i>
                        <h2 class="fw-bold mb-1">{{ stats.totalBooks }}</h2>
                        <p class="text-uppercase small mb-0">Tổng Đầu Sách</p>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="stat-card stat-card-success h-100">
                    <div class="card-body text-center">
                        <i class="fa-solid fa-users fa-3x mb-3"></i>
                        <h2 class="fw-bold mb-1">{{ stats.totalReaders }}</h2>
                        <p class="text-uppercase small mb-0">Tổng Độc Giả</p>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="stat-card stat-card-warning h-100">
                    <div class="card-body text-center">
                        <i class="fa-solid fa-hand-holding-hand fa-3x mb-3"></i>
                        <h2 class="fw-bold mb-1">{{ stats.borrowing }}</h2>
                        <p class="text-uppercase small mb-0">Đang Mượn</p>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="stat-card stat-card-danger h-100">
                    <div class="card-body text-center">
                        <i class="fa-solid fa-bell fa-3x mb-3"></i>
                        <h2 class="fw-bold mb-1">{{ stats.overdue }}</h2>
                        <p class="text-uppercase small mb-0">Phiếu Quá Hạn</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-5">
            <h4 class="mb-3 text-secondary fw-normal">Truy cập nhanh</h4>
            <div class="d-flex gap-3 flex-wrap">
                <RouterLink to="/admin/borrows/new" class="btn btn-lg btn-quick-access">
                    <i class="fa-solid fa-plus me-2"></i>Tạo Phiếu Mượn
                </RouterLink>
                <RouterLink to="/admin/books/new" class="btn btn-lg btn-quick-access">
                    <i class="fa-solid fa-book-medical me-2"></i>Nhập Sách Mới
                </RouterLink>
                <RouterLink to="/admin/users/new" class="btn btn-lg btn-quick-access">
                    <i class="fa-solid fa-user-plus me-2"></i>Thêm Độc Giả
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.stat-card {
    border-radius: 0.75rem;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    color: white;
    border: none;
}
.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1);
}
.stat-card .fa-3x {
    opacity: 0.7;
}

/* Màu nền gradient cho từng thẻ */
.stat-card-primary { background-image: linear-gradient(45deg, #4e73df, #224abe); }
.stat-card-success { background-image: linear-gradient(45deg, #1cc88a, #13855c); }
.stat-card-warning { background-image: linear-gradient(45deg, #f6c23e, #dda20a); }
.stat-card-danger  { background-image: linear-gradient(45deg, #e74a3b, #be2617); }

.btn-quick-access {
    background-color: #f8f9fa;
    border: 1px solid #dee2e6;
    color: #495057;
}
.btn-quick-access:hover {
    background-color: #e2e6ea;
    border-color: #dae0e5;
    color: #212529;
}
</style>