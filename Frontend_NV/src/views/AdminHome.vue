<script setup>
import { ref, onMounted, watch } from 'vue';
import { authApiService } from '@/services/api.service';
// Biến lưu số liệu thống kê
const stats = ref({
    totalBooks: 0,
    totalReaders: 0,
    borrowing: 0,
    overdue: 0
});
const loading = ref(true);

// Hàm tạo hiệu ứng số đếm
function animateValue(obj, key, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj[key] = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// Tạo các ref riêng cho hiệu ứng đếm số
const animatedStats = ref({
    totalBooks: 0,
    totalReaders: 0,
    borrowing: 0,
    overdue: 0
});

// Hàm tải và tính toán số liệu gốc
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

// Theo dõi khi loading = false, bắt đầu hiệu ứng đếm số
watch(loading, (newVal) => {
    if (newVal === false) {
        const duration = 1500; // 1.5 giây
        animateValue(animatedStats.value, 'totalBooks', 0, stats.value.totalBooks, duration);
        animateValue(animatedStats.value, 'totalReaders', 0, stats.value.totalReaders, duration);
        animateValue(animatedStats.value, 'borrowing', 0, stats.value.borrowing, duration);
        animateValue(animatedStats.value, 'overdue', 0, stats.value.overdue, duration);
    }
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
                <div class="stat-card stat-card-primary">
                    <div class="stat-card-icon">
                        <i class="fa-solid fa-book"></i>
                    </div>
                    <div class="stat-card-content">
                        <p class="stat-card-title">Tổng Đầu Sách</p>
                        <h2 class="stat-card-value">{{ animatedStats.totalBooks }}</h2>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="stat-card stat-card-success">
                    <div class="stat-card-icon">
                        <i class="fa-solid fa-users"></i>
                    </div>
                    <div class="stat-card-content">
                        <p class="stat-card-title">Tổng Độc Giả</p>
                        <h2 class="stat-card-value">{{ animatedStats.totalReaders }}</h2>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="stat-card stat-card-warning">
                    <div class="stat-card-icon">
                        <i class="fa-solid fa-hand-holding-hand"></i>
                    </div>
                    <div class="stat-card-content">
                        <p class="stat-card-title">Đang Mượn</p>
                        <h2 class="stat-card-value">{{ animatedStats.borrowing }}</h2>
                    </div>
                </div>
            </div>

            <div class="col-md-6">
                <div class="stat-card stat-card-danger">
                    <div class="stat-card-icon">
                        <i class="fa-solid fa-bell"></i>
                    </div>
                    <div class="stat-card-content">
                        <p class="stat-card-title">Phiếu Quá Hạn</p>
                        <h2 class="stat-card-value">{{ animatedStats.overdue }}</h2>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-5">
            <h4 class="mb-3 text-secondary fw-normal">
                <i class="fa-solid fa-bolt me-2"></i>Truy cập nhanh
            </h4>
            <div class="d-flex gap-3 flex-wrap">
                <RouterLink to="/admin/borrows/new" class="btn btn-quick-access btn-quick-access-primary">
                    <i class="fa-solid fa-plus me-2"></i>Tạo Phiếu Mượn
                </RouterLink>
                <RouterLink to="/admin/books/new" class="btn btn-quick-access btn-quick-access-success">
                    <i class="fa-solid fa-book-medical me-2"></i>Nhập Sách Mới
                </RouterLink>
                <RouterLink to="/admin/users/new" class="btn btn-quick-access btn-quick-access-info">
                    <i class="fa-solid fa-user-plus me-2"></i>Thêm Độc Giả
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style scoped>
.admin-home {
    background-color: #f8f9fc;
    padding: 2rem;
    border-radius: 1rem;
}

.stat-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    border-radius: 0.75rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    color: white;
    border: none;
    overflow: hidden;
    position: relative;
}
.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 1rem 2rem rgba(0, 0, 0, 0.15);
}

.stat-card-icon {
    font-size: 3rem;
    opacity: 0.2;
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%) rotate(-15deg);
    transition: transform 0.3s ease;
}

.stat-card:hover .stat-card-icon {
    transform: translateY(-50%) rotate(0deg) scale(1.1);
}

.stat-card-content {
    position: relative;
    z-index: 1;
}

.stat-card-title {
    font-size: 0.9rem;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 0.25rem;
    opacity: 0.9;
}

.stat-card-value {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0;
    line-height: 1;
}

/* Màu nền gradient cho từng thẻ */
.stat-card-primary { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card-success { background: linear-gradient(135deg, #2af598 0%, #009efd 100%); }
.stat-card-warning { background: linear-gradient(135deg, #ffc371 0%, #ff5f6d 100%); }
.stat-card-danger  { background: linear-gradient(135deg, #ff8177 0%, #ff867a 0%, #ff8c7f 21%, #f99185 52%, #cf556c 78%, #b12a5b 100%); }

.btn-quick-access {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    border-radius: 0.5rem;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.btn-quick-access:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}

.btn-quick-access-primary {
    background-color: #eef2ff;
    color: #4338ca;
    border-color: #e0e7ff;
}
.btn-quick-access-primary:hover {
    background-color: #4338ca;
    color: white;
}

.btn-quick-access-success {
    background-color: #f0fdf4;
    color: #16a34a;
    border-color: #dcfce7;
}
.btn-quick-access-success:hover {
    background-color: #16a34a;
    color: white;
}

.btn-quick-access-info {
    background-color: #ecfeff;
    color: #0891b2;
    border-color: #cffafe;
}
.btn-quick-access-info:hover {
    background-color: #0891b2;
    color: white;
}
</style>