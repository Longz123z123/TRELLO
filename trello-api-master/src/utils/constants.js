import { env } from '~/config/environment'

// ~ domain duoc phep truy cap toi goi tai nguyen cua server
export const WHITELIST_DOMAINS = [
  'http://localhost:5173', //
  'https://trello-web-sooty-seven.vercel.app'
]

export const BOARD_TYPE = {
  PUBLIC: 'public',
  PRIVATE: 'private'
}

export const WEBSITE_DOMAIN = env.BUILD_MODE === 'production' ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVLOPMENT

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12

export const BOARD_INVITATION_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}
export const INVITATION_TYPES = {
  BOARD_INVITATION: 'BOARD_INVITATION'
}
export const CARD_MEMBER_ACTIONS = {
  ADD: 'ADD',
  REMOVE: 'REMOVE'
}
