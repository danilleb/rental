import { defineStore } from 'pinia'

export const useDataStore = defineStore('dataStore', () => {
    const { $api } = useNuxtApp()

    const categories = ref([])
    const rentalPoints = ref([])
    const sizesInventory = ref([])

    async function getCategories() {
        try {
            categories.value = await $api.getCategories()
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error)
        }
    }

    async function getRentalPoints() {
        try {
            rentalPoints.value = await $api.getRentalPoints()
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error)
        }
    }

    async function getAllSizesInventory() {
        try {
            sizesInventory.value = await $api.getAllSizesInventory()
        } catch (error) {
            console.error('Ошибка при загрузке категорий:', error)
        }
    }

    return {
        categories,
        rentalPoints,
        sizesInventory,
        getCategories,
        getRentalPoints,
        getAllSizesInventory
    }
})
