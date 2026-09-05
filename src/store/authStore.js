import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  schoolId: null,
  schoolName: null,
  schoolLogo: null,
  loading: true,

  setUser: (user) => set({ user }),
  setRole: (role) => set({ role }),
  setSchoolId: (schoolId) => set({ schoolId }),
  setLoading: (loading) => set({ loading }),

  initialize: async () => {
    set({ loading: true })
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role, school_id')
        .eq('auth_user_id', session.user.id)
        .single()
      
        // Fetch school details
        let schoolName = null
        let schoolLogo = null
        if (roleData?.school_id) {
          const { data: schoolData } = await supabase
            .from('schools')
            .select('name, logo_url')
            .eq('id', roleData.school_id)
            .single()
          schoolName = schoolData?.name || null
          schoolLogo = schoolData?.logo_url || null
        }

        set({
          user: session.user,
          role: roleData?.role || null,
          schoolId: roleData?.school_id || null,
          schoolName,
          schoolLogo,
        })
    }
    set({ loading: false })
  },

  login: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role, school_id')
      .eq('auth_user_id', data.user.id)
      .single()
    //
    let schoolName = null
    let schoolLogo = null
    if (roleData?.school_id) {
      const { data: schoolData } = await supabase
        .from('schools')
        .select('name, logo_url')
        .eq('id', roleData.school_id)
        .single()
      schoolName = schoolData?.name || null
      schoolLogo = schoolData?.logo_url || null
    }

    set({
      user: data.user,
      role: roleData?.role || null,
      schoolId: roleData?.school_id || null,
      schoolName,
      schoolLogo,
    })
    return roleData?.role
  },

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, role: null, schoolId: null })
  },
}))