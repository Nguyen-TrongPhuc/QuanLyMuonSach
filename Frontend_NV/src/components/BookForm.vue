<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authApiService } from '@/services/api.service';

const props = defineProps({
    bookId: {
        type: String,
        default: null
    }
});

const router = useRouter();
const isEditMode = computed(() => !!props.bookId);
const publishers = ref([]);
const isUploading = ref(false); // Biến để hiện loading khi đang upload ảnh
const book = ref({
    MaSach: '',
    TenSach: '',
    DonGia: 0,
    SoQuyen: 0,
    NamXuatBan: 2024,
    MaNXB: '',
    TacGia: '',
    HinhAnh: '',
    TheLoai: '',
    MoTa: ''
});
const loading = ref(false);
const error = ref(null);
async function fetchBookData() {
    if (!isEditMode.value) return;

    loading.value = true;
    try {
        const response = await authApiService.get(`/sachs/${props.bookId}`);
        book.value = response.data;
    } catch (error) {
        error.value = "Lỗi: Không thể tải dữ liệu sách.";
    } finally {
        loading.value = false;
    }
}

async function handleSubmit() {
    loading.value = true;
    error.value = null;
    try {
        if (isEditMode.value) {
            await authApiService.put(`/sachs/${props.bookId}`, book.value);
        } else {
            await authApiService.post('/sachs', book.value);
        }
        alert("Lưu sách thành công!");
        router.push('/admin/books');

    } catch (err) {
        error.value = err.response?.data?.message || "Lưu thất bại. Vui lòng kiểm tra lại Mã Sách (có thể bị trùng).";
    } finally {
        loading.value = false;
    }
}

async function fetchPublishers() {
    try {
        const response = await authApiService.get('/nhaxuatbans');
        publishers.value = response.data;
    } catch (err) {
        console.error("Lỗi: Không thể tải danh sách NXB.", err);
    }
}
async function handleFileUpload(event) {
    const file = event.target.files[0]; // Lấy file đầu tiên
    if (!file) return;

    // Chuẩn bị Form Data để gửi
    const formData = new FormData();
    formData.append('image', file); // Key 'image' phải khớp với backend

    isUploading.value = true;
    try {
        // Gọi API upload (Lưu ý: Content-Type sẽ tự động được set bởi axios khi gửi FormData)
        // Chúng ta dùng authApiService để đảm bảo bảo mật, hoặc apiService thường cũng được
        const response = await authApiService.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        // Thành công: Backend trả về { url: "..." }
        // Gán URL đó vào trường hinhAnh của sách
        book.value.HinhAnh = response.data.url;

    } catch (err) {
        alert("Lỗi upload ảnh: " + (err.response?.data?.message || err.message));
    } finally {
        isUploading.value = false;
    }
}

onMounted(() => {
    fetchBookData();
    fetchPublishers();
});
</script>

<template>
    <div>
        <div v-if="loading && isEditMode" class="text-center">
            <div class="spinner-border text-primary" role="status"></div>
            <p>Đang tải dữ liệu...</p>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="!loading || !isEditMode">
            <h2 class="mb-4 fw-bold text-primary">{{ isEditMode ? 'Chỉnh sửa Sách' : 'Thêm Sách Mới' }}</h2>

            <form @submit.prevent="handleSubmit">
                <div class="row g-4">
                    <!-- Cột trái: Thông tin chính -->
                    <div class="col-lg-8">
                        <div class="card shadow-sm h-100">
                            <div class="card-header">
                                <h5 class="mb-0">Thông tin cơ bản</h5>
                            </div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label for="tenSach" class="form-label">Tên Sách</label>
                                    <input type="text" class="form-control" id="tenSach" v-model="book.TenSach" required>
                                </div>
                                <div class="mb-3">
                                    <label for="tacGia" class="form-label">Tác Giả</label>
                                    <input type="text" class="form-control" id="tacGia" v-model="book.TacGia">
                                </div>
                                <div class="mb-3">
                                    <label for="maSach" class="form-label">Mã Sách</label>
                                    <input type="text" class="form-control" id="maSach" v-model="book.MaSach" required :disabled="isEditMode">
                                    <div v-if="isEditMode" class="form-text">Không thể thay đổi Mã Sách.</div>
                                </div>
                                <div class="mb-3">
                                    <label for="theLoai" class="form-label">Thể loại</label>
                                    <input type="text" class="form-control" id="theLoai" v-model="book.TheLoai" placeholder="Ví dụ: Văn học, Lập trình, Kinh tế...">
                                    <div class="form-text">Phục vụ cho việc lọc sách sau này.</div>
                                </div>
                                <div class="mb-0">
                                    <label for="moTa" class="form-label">Mô tả / Tóm tắt nội dung</label>
                                    <textarea class="form-control" id="moTa" v-model="book.MoTa" rows="4" placeholder="Nhập tóm tắt nội dung sách..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Cột phải: Ảnh bìa và chi tiết xuất bản -->
                    <div class="col-lg-4">
                        <div class="card shadow-sm mb-4">
                            <div class="card-header"><h5 class="mb-0">Hình ảnh Bìa sách</h5></div>
                            <div class="card-body">
                                <input type="file" class="form-control" accept="image/*" @change="handleFileUpload">
                                <div v-if="isUploading" class="text-primary mt-2">
                                    <div class="spinner-border spinner-border-sm me-2"></div>
                                    Đang tải ảnh lên...
                                </div>
                                <div v-if="book.HinhAnh" class="mt-3 text-center">
                                    <img :src="book.HinhAnh" alt="Preview" class="img-fluid shadow-sm rounded" style="max-height: 200px; object-fit: contain;">
                                    <button type="button" class="btn btn-sm btn-outline-danger mt-2" @click="book.HinhAnh = ''">
                                        Xóa ảnh
                                    </button>
                                </div>
                                <input type="hidden" v-model="book.HinhAnh">
                            </div>
                        </div>

                        <div class="card shadow-sm">
                            <div class="card-header"><h5 class="mb-0">Chi tiết & Xuất bản</h5></div>
                            <div class="card-body">
                                <div class="mb-3">
                                    <label for="donGia" class="form-label">Đơn Giá</label>
                                    <input type="number" class="form-control" id="donGia" v-model="book.DonGia">
                                </div>
                                <div class="mb-3">
                                    <label for="soQuyen" class="form-label">Tổng Số Quyển</label>
                                    <input type="number" class="form-control" id="soQuyen" v-model="book.SoQuyen" required>
                                </div>
                                <div class="mb-3">
                                    <label for="namXuatBan" class="form-label">Năm Xuất Bản</label>
                                    <input type="number" class="form-control" id="namXuatBan" v-model="book.NamXuatBan">
                                </div>
                                <div class="mb-0">
                                    <label for="maNXB" class="form-label">Nhà Xuất Bản</label>
                                    <select class="form-select" id="maNXB" v-model="book.MaNXB" required>
                                        <option value="" disabled>-- Vui lòng chọn --</option>
                                        <option v-for="pub in publishers" :key="pub._id" :value="pub.MaNXB">
                                            {{ pub.TenNXB }} ({{ pub.MaNXB }})
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Thanh hành động cố định -->
                <div class="form-actions">
                    <div class="d-flex justify-content-between">
                        <RouterLink to="/admin/books" class="btn btn-secondary">
                            <i class="fa-solid fa-arrow-left me-1"></i> Quay lại
                        </RouterLink>
                        <button type="submit" class="btn btn-primary" :disabled="loading">
                            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                            {{ isEditMode ? 'Cập nhật Sách' : 'Thêm Sách Mới' }}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.form-actions {
    position: sticky;
    bottom: 65px; /* Đặt vị trí ngay trên thanh điều hướng dưới cùng */
    background-color: rgba(255, 255, 255, 0.9);
    padding: 1rem;
    margin: 1.5rem -1rem -1rem -1rem; /* Mở rộng ra sát viền card */
    border-top: 1px solid #dee2e6;
    backdrop-filter: blur(5px);
    z-index: 10;
}
</style>