<script setup>
import { useRoute } from 'vue-router';
import UserForm from '@/components/UserForm.vue';
const route = useRoute();
</script>
<template>
    <div>
        <UserForm :userId="route.params.id" />
    </div>
</template>