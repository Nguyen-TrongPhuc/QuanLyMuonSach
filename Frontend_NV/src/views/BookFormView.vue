<script setup>
import { useRoute } from 'vue-router';
import BookForm from '@/components/BookForm.vue'; 

const route = useRoute();

const bookId = route.params.id;
</script>

<template>
    <div>
        <BookForm :bookId="bookId" />
    </div>
</template>