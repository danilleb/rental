import { defineStore } from 'pinia'
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const useUserStore = defineStore('userStore', () => {
    const { $api } = useNuxtApp()

    const profile = ref(null)
    const getProfile = async () => {
        profile.value = await $api.getProfile()
    }
    const login = async (params) => {
        const result = await $api.login(params)
        if (result) {
            localStorage.setItem('Bearer', result.token)
            await delay(1000)
            await getProfile()
            return true
        } else {
            localStorage.removeItem('Bearer')
            return false
        }
    }

    const register = async (params) => {
        const result = await $api.register(params)
        if (result) {
            await login(params)
            return true
        } else {
            localStorage.removeItem('Bearer')
            return false
        }
    }
    return {
        profile,
        login,
        getProfile,
        register
    }
})
