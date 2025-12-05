<script setup>
defineProps({
    categories: { type: Array, default: () => [] }
});

// modelValue là searchText, category là selectedCategory
const searchText = defineModel('searchText');
const selectedCategory = defineModel('selectedCategory');
</script>

<template>
    <div class="hero-section text-center text-white py-5 mb-4">
        <div class="container">
            <h1 class="display-4 fw-bold mb-3">Bạn muốn đọc gì hôm nay?</h1>
            <p class="lead mb-4">Hàng ngàn đầu sách thuộc mọi lĩnh vực đang chờ bạn.</p>
            
            <div class="search-box bg-white p-3 rounded-4 shadow mx-auto">
                <div class="row g-3">
                    <div class="col-md-8">
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0">
                                <i class="fa-solid fa-search text-muted"></i>
                            </span>
                            <input 
                                type="text" 
                                class="form-control border-start-0" 
                                placeholder="Tìm kiếm theo tên sách, tác giả..." 
                                v-model="searchText"
                            >
                        </div>
                    </div>
                    <div class="col-md-4">
                        <select class="form-select" v-model="selectedCategory">
                            <option value="">Tất cả thể loại</option>
                            <option v-for="cat in categories" :key="cat" :value="cat">
                                {{ cat }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.hero-section {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1974&auto=format&fit=crop');
    background-size: cover;
    background-position: center;
    padding-bottom: 3rem !important;
    border-bottom-left-radius: 2rem;
    border-bottom-right-radius: 2rem;
}
.search-box {
    max-width: 800px;
    margin-top: 1rem;
}
</style>