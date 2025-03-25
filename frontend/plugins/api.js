export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const getToken = () => {
        return window ? localStorage.getItem('Bearer') || null : null
    }
    return {
        provide: {
            api: {
                inventorySearch: async (params, includeAvailability) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    const res = await $fetch(`${config.public.apiBase}/inventory/search${includeAvailability ? '?includeAvailability=true' : ''}`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    })
                    return res || []
                },
                getInventory: async (id) => {
                    const res = await $fetch(`${config.public.apiBase}/inventory/${id}`, {
                        method: 'GET',
                        credentials: 'include'
                    })
                    return res || []
                },
                getAllSizesInventory: async (id) => {
                    const res = await $fetch(`${config.public.apiBase}/inventory/allSizes`, {
                        method: 'GET',
                        credentials: 'include'
                    })
                    return res || []
                },
                getCategories: async (params) => {
                    const res = await $fetch(`${config.public.apiBase}/categories`, {
                        method: 'GET',
                        credentials: 'include'
                    })
                    return res || []
                },
                getRentalPoints: async (params) => {
                    const res = await $fetch(`${config.public.apiBase}/rentalPoints`, {
                        method: 'GET',
                        credentials: 'include'
                    })
                    return res || []
                },
                createRentalPoint: async (params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/rentalPoints`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                editRentalPoint: async (id, params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/rentalPoints/${id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                deleteRentalPoint: async (id) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/rentalPoints/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                createCategories: async (params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/categories`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                editCategories: async (id, params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/categories/${id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                deleteCategories: async (id) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/categories/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                login: async (params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    const res = await $fetch(`${config.public.apiBase}/users/login`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                register: async (params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    const res = await $fetch(`${config.public.apiBase}/users/register`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                addFile: async (file) => {
                    const formdata = new FormData();
                    formdata.append("file", file);
                    const headers = new Headers()
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/files`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: formdata
                    }).catch(() => { })
                    if (res) {
                        return `${res.fileName}`
                    } else {
                        return null
                    }
                },
                getProfile: async () => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/users/profile`, {
                        method: 'GET',
                        credentials: 'include',
                        headers
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                createInventory: async (params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/inventory`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                editInventory: async (id, params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/inventory/${id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                deleteInventory: async (id) => {
                    const headers = new Headers()
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/inventory/${id}`, {
                        method: 'DELETE',
                        credentials: 'include',
                        headers
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                availabilityInventory: async (id) => {
                    const headers = new Headers()
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/inventory/availability/${id}`, {
                        method: 'GET',
                        credentials: 'include',
                        headers
                    }).catch(() => { })
                    if (res) {
                        return res
                    } else {
                        return null
                    }
                },
                getBookings: async () => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)

                    const res = await $fetch(`${config.public.apiBase}/bookings`, {
                        method: 'GET',
                        credentials: 'include',
                        headers
                    }).catch(() => { })

                    return res || null
                },
                createBooking: async (params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)

                    const res = await $fetch(`${config.public.apiBase}/bookings`, {
                        method: 'POST',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })

                    return res || null
                },
                editBooking: async (id, params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)

                    const res = await $fetch(`${config.public.apiBase}/bookings/${id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })

                    return res || null
                },
                getNotifications: async () => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/notifications`, {
                        method: 'GET',
                        credentials: 'include',
                        headers
                    }).catch(() => { })
                    return res || null
                },
                getUsers: async () => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)
                    const res = await $fetch(`${config.public.apiBase}/users`, {
                        method: 'GET',
                        credentials: 'include',
                        headers
                    }).catch(() => { })
                    return res || null
                },
                editUsers: async (id, params) => {
                    const headers = new Headers()
                    headers.append('Content-Type', 'application/json')
                    headers.append('Authorization', `Bearer ${getToken()}`)

                    const res = await $fetch(`${config.public.apiBase}/users/${id}`, {
                        method: 'PUT',
                        credentials: 'include',
                        headers,
                        body: JSON.stringify(params)
                    }).catch(() => { })

                    return res || null
                },
            }
        }
    }
})