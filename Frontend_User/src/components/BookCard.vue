<script setup>
defineProps({
    book: {
        type: Object,
        required: true
    }
});

const PLACEHOLDER_IMG = 'https://placehold.co/400x600?text=No+Image';
</script>

<template>
    <div class="card h-100 book-card border-0 shadow-sm">
        <div class="position-relative book-cover-wrapper">
            <RouterLink :to="{ name: 'book-detail', params: { id: book._id } }">
                <img 
                    :src="book.HinhAnh || PLACEHOLDER_IMG" 
                    class="card-img-top book-cover" 
                    alt="Book Cover"
                    @error="$event.target.src = PLACEHOLDER_IMG" 
                >
                <div class="book-cover-overlay">
                    <i class="fa-solid fa-eye fa-2x"></i>
                </div>
            </RouterLink>
            
        </div>

        <div class="card-body d-flex flex-column">
            <div class="mb-2">
                <span class="badge bg-success bg-opacity-10 text-success">
                    {{ book.TheLoai || 'Tổng hợp' }}
                </span>
            </div>
            
            <h5 class="card-title fw-bold text-truncate">
                {{ book.TenSach }}
            </h5>

            <RouterLink :to="{ name: 'book-detail', params: { id: book._id } }" class="stretched-link book-title-link"></RouterLink>

            <p class="card-text text-muted small mt-auto">
                <i class="fa-solid fa-pen-nib me-1"></i> {{ book.TacGia }}
            </p>
            
            <div class="d-flex justify-content-between align-items-center pt-3">
                <span class="badge" :class="book.soQuyenHienCo > 0 ? 'text-bg-success' : 'text-bg-secondary'">
                    {{ book.soQuyenHienCo > 0 ? 'Còn hàng' : 'Hết hàng' }}
                </span>
                <button 
                    class="btn btn-sm btn-success rounded-circle btn-borrow" 
                    :disabled="book.soQuyenHienCo <= 0"
                    @click="$emit('borrow', book)" 
                    title="Đăng ký mượn"
                >
                    <i class="fa-solid fa-plus"></i> 
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.book-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    overflow: hidden;
}
.book-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
}
.book-cover-wrapper {
    height: 250px;
    overflow: hidden;
    background-color: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
}
.book-card:hover .book-cover {
    transform: scale(1.1);
}
.book-cover {
    height: 100%;
    width: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
}
.book-cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(25, 135, 84, 0.7);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}
.book-card:hover .book-cover-overlay {
    opacity: 1;
}
.btn-borrow {
    width: 32px;
    height: 32px;
    line-height: 1;
    z-index: 2; /* Đảm bảo nút nằm trên stretched-link */
}
.card-title {
    font-size: 1.1rem;
}

.book-title-link::after {
    content: "";
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
}
</style>