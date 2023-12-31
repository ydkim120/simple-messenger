
import { supabase as sb } from '@/supabase'
import dayjs from 'dayjs'
import { useUserAuthStore } from '@/store/Auth.store'
import { userInfoType } from '@/@types'

const authStore = useUserAuthStore()

type reservedChatType = {
  channel_id: string | string[]
  content: string
  reserved_at_timestamp: string | number | Date
}

export default {
  // ===== 예약 메세지
  // 예약 메세지 조회
  async getReservedChatsByUserId(userId: string = authStore.userInfo?.id, { from = 1, to = 10 }) {
    const { data: chatList, error } = await sb
      .from('reserved_chats')
      // .select(`
      //     *,
      //     profiles (
      //       user_name,
      //       user_photo
      //     )
      // `)
      .select()
      .eq('user_id', userId)
      .range(from, to)
      .order('reserved_at', { ascending: true })
    if (error) throw error

    return chatList
  },
  // 예약 메세지 생성
  async createReservedChat (data: reservedChatType, userInfo: userInfoType = authStore?.userInfo) {
    const { content, channel_id, reserved_at_timestamp } = data
    const { id: userId, email, user_metadata } = userInfo

    const today = new Date(Date.now())
    const reservedDate = new Date(reserved_at_timestamp).toISOString()

    const payload = {
      user_id: userId,
      content,
      created_at: today,
      user_email: email,
      user_name: user_metadata?.user_name,
      channel_id: channel_id,
      reserved_at: reservedDate,
      reserved_date: dayjs(reservedDate).format('YYYY-MM-DD'),
    }
    const { error } = await sb
      .from('reserved_chats')
      .insert(payload)
    if (error) throw error
    return true
  },
  // 채널에 따른 예약 메세지 갯수 조회
  async getReservedChatsCountByChannelId(channelId: string | string[]) {
    const { data: chatList, error } = await sb
      .from('reserved_chats')
      .select()
      .eq('channel_id', channelId)
    if (error) throw error

    return chatList?.length || 0
  },
}