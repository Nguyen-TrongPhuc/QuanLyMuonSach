<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { apiService } from '@/services/api.service';
import AppHeader from '@/components/AppHeader.vue';

const authStore = useAuthStore();
const borrows = ref([]);
const books = ref([]);
const loading = ref(true);
const activeTab = ref('current');
async function fetchData() {
    loading.value = true;
    try {
        const maDocGia = authStore.user.MaDocGia;
        // Gọi song song
        const [borrowsRes, booksRes] = await Promise.all([
            apiService.get(`/muonsachs?maDocGia=${maDocGia}`),
            apiService.get('/sachs')
        ]);

        borrows.value = borrowsRes.data;
        books.value = booksRes.data;
    } catch (err) {
        console.error("Lỗi:", err);
    } finally {
        loading.value = false;
    }
}

// Hàm lấy tên sách từ mã
function getBookName(maSach) {
    return getBookDetails(maSach)?.TenSach || maSach;
}

// Hàm lấy toàn bộ thông tin sách, bao gồm ảnh
function getBookDetails(maSach) {
    return books.value.find(b => b.MaSach === maSach);
}

// Hàm tính toán tiến trình mượn sách
function getBorrowProgress(item) {
    const startDate = new Date(item.NgayMuon);
    const dueDate = new Date(item.HanTra);
    const today = new Date();

    const totalDuration = dueDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();

    if (totalDuration <= 0 || isOverdue(item)) return { percent: 100, variant: 'danger', daysLeft: 0 };

    const percent = Math.min(100, Math.max(0, (elapsedDuration / totalDuration) * 100));

    let variant = 'success';
    if (percent > 80) variant = 'danger';
    else if (percent > 60) variant = 'warning';

    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    return { percent, variant, daysLeft };
}


// Hàm kiểm tra quá hạn
function isOverdue(item) {
    if (item.NgayTra) return false;
    if (!item.HanTra) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(item.HanTra);
    dueDate.setHours(0, 0, 0, 0);
    return today > dueDate;
}

// Lọc danh sách đang mượn
const currentBorrows = computed(() => {
    return borrows.value.filter(item => !item.NgayTra);
});

// Lọc danh sách lịch sử
const historyBorrows = computed(() => {
    return borrows.value.filter(item => item.NgayTra);
});
function formatCurrency(amount) {
    if (!amount) return '0 đ';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

onMounted(() => {
    fetchData();
});
</script>

<template>
    <div class="my-books-page">
        <AppHeader />
        <div class="container py-5">
            <div class="card shadow-lg border-0 rounded-4">
                <div class="card-header bg-transparent border-bottom-0 pt-4 pb-0 px-4">
                    <ul class="nav nav-tabs card-header-tabs">
                        <li class="nav-item">
                            <a class="nav-link fw-bold" :class="{ active: activeTab === 'current' }" href="#"
                                @click.prevent="activeTab = 'current'">
                                Đang mượn <span class="badge bg-success ms-1">{{ currentBorrows.length }}</span>
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link fw-bold" :class="{ active: activeTab === 'history' }" href="#"
                                @click.prevent="activeTab = 'history'">
                                Lịch sử trả <span class="badge bg-secondary ms-1">{{ historyBorrows.length }}</span>
                            </a>
                        </li>
                    </ul>
                </div>

                <div class="card-body p-4">
                    <div v-if="loading" class="text-center py-5">
                        <div class="spinner-border text-success"></div>
                    </div>

                    <div v-else>
                        <!-- Tab Đang Mượn -->
                        <div v-if="activeTab === 'current'">
                            <div v-if="currentBorrows.length === 0" class="text-center text-muted py-5">
                                <i class="fa-solid fa-book-open fa-3x mb-3 opacity-25"></i>
                                <p>Bạn chưa mượn quyển sách nào.</p>
                                <RouterLink to="/" class="btn btn-outline-success">Khám phá thư viện ngay</RouterLink>
                            </div>
                            <TransitionGroup v-else name="list" tag="div" class="row g-4">
                                <div class="col-12" v-for="(item, index) in currentBorrows" :key="item._id" :style="{'transition-delay': index * 100 + 'ms'}">
                                    <div class="borrow-card card card-body">
                                        <div class="row g-3 align-items-center">
                                            <div class="col-md-2 text-center">
                                                <img :src="getBookDetails(item.MaSach)?.HinhAnh || 'https://placehold.co/120x180?text=Book'" class="img-fluid rounded shadow-sm" style="max-height: 150px;">
                                            </div>
                                            <div class="col-md-5">
                                                <h5 class="fw-bold mb-1">{{ getBookName(item.MaSach) }}</h5>
                                                <p class="text-muted small mb-2">Ngày mượn: {{ item.NgayMuon }}</p>
                                                <span v-if="item.TrangThai === 0" class="badge bg-warning text-dark"><i class="fa-solid fa-clock me-1"></i> Chờ duyệt</span>
                                                <span v-else class="badge bg-success"><i class="fa-solid fa-check-circle me-1"></i> Đang mượn</span>
                                            </div>
                                            <div class="col-md-5">
                                                <div v-if="item.TrangThai === 1">
                                                    <div class="d-flex justify-content-between small mb-1">
                                                        <span>Thời gian mượn</span>
                                                        <span class="fw-bold" :class="`text-${getBorrowProgress(item).variant}`">
                                                            {{ isOverdue(item) ? 'Đã quá hạn!' : `Còn ${getBorrowProgress(item).daysLeft} ngày` }}
                                                        </span>
                                                    </div>
                                                    <div class="progress" style="height: 8px;">
                                                        <div :class="`progress-bar bg-${getBorrowProgress(item).variant}`" role="progressbar" :style="{ width: getBorrowProgress(item).percent + '%' }"></div>
                                                    </div>
                                                    <p class="small text-muted mt-1">Hạn trả: {{ item.HanTra }}</p>
                                                </div>
                                                <div v-else class="text-muted text-center p-3 bg-light rounded">
                                                    <i class="fa-solid fa-hourglass-half me-1"></i> Chờ thủ thư duyệt...
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TransitionGroup>
                        </div>

                        <!-- Tab Lịch sử -->
                        <div v-if="activeTab === 'history'">
                             <div v-if="historyBorrows.length === 0" class="text-center text-muted py-5">
                                <i class="fa-solid fa-clock-rotate-left fa-3x mb-3 opacity-25"></i>
                                <p>Chưa có lịch sử mượn trả.</p>
                            </div>
                            <TransitionGroup v-else name="list" tag="ul" class="timeline">
                                <li v-for="(item, index) in historyBorrows" :key="item._id" :style="{'transition-delay': index * 100 + 'ms'}">
                                    <div class="timeline-badge"><i class="fa-solid fa-check"></i></div>
                                    <div class="timeline-panel">
                                        <div class="timeline-heading">
                                            <h5 class="timeline-title">{{ getBookName(item.MaSach) }}</h5>
                                            <p><small class="text-muted"><i class="fa-solid fa-calendar-days me-1"></i> Trả ngày: {{ item.NgayTra }}</small></p>
                                        </div>
                                        <div class="timeline-body">
                                            <p class="small">
                                                Mượn từ {{ item.NgayMuon }}.
                                                <span v-if="item.TienPhat > 0" class="text-danger fw-bold ms-2">Phạt: {{ formatCurrency(item.TienPhat) }}</span>
                                                <span v-else class="text-success ms-2">Trả đúng hạn.</span>
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            </TransitionGroup>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.my-books-page {
    min-height: 100vh;
    background-image: linear-gradient(to bottom, #a7f3d0, #ffffff);
}

.card-header-tabs {
    margin-bottom: -1px;
}

.nav-tabs {
    border-bottom: 0;
}

.nav-tabs .nav-link {
    border: 0;
    color: #6c757d;
    border-radius: 50rem;
    margin-right: 0.5rem;
    transition: all 0.3s ease;
}

.nav-tabs .nav-link.active {
    color: #198754;
    background-color: #d1e7dd;
    border-color: transparent;
}
</style>

<style>
/* Timeline CSS - không dùng scoped để áp dụng cho các thẻ con */
.timeline {
    list-style: none;
    padding: 20px 0 20px;
    position: relative;
}
.timeline:before {
    top: 0;
    bottom: 0;
    position: absolute;
    content: " ";
    width: 3px;
    background-color: #eeeeee;
    left: 25px;
    margin-right: -1.5px;
}
.timeline > li {
    margin-bottom: 20px;
    position: relative;
}
.timeline > li:before, .timeline > li:after {
    content: " ";
    display: table;
}
.timeline > li:after {
    clear: both;
}
.timeline > li > .timeline-panel {
    width: calc( 100% - 75px );
    float: right;
    border: 1px solid #d4d4d4;
    border-radius: 0.5rem;
    padding: 20px;
    position: relative;
    box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
}
.timeline > li > .timeline-badge {
    color: #fff;
    width: 50px;
    height: 50px;
    line-height: 50px;
    font-size: 1.4em;
    text-align: center;
    position: absolute;
    top: 16px;
    left: 0px;
    margin-right: -25px;
    background-color: #198754;
    z-index: 100;
    border-radius: 50%;
}
.timeline-title {
    margin-top: 0;
    color: inherit;
}
.timeline-body > p, .timeline-body > ul {
    margin-bottom: 0;
}
.timeline-body > p + p {
    margin-top: 5px;
}
.borrow-card {
    border: 1px solid #e9ecef;
    border-radius: 0.75rem;
    transition: all 0.3s ease-in-out;
}
.borrow-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1)!important;
    z-index: 2;
}

/* Staggered List Animation */
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

</style>