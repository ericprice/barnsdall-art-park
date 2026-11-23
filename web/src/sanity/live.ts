import 'server-only'
import {defineLive} from 'next-sanity/live'
import {client} from './client'

// The public site reads published content. No privileged token reaches the browser.
export const {sanityFetch, SanityLive} = defineLive({
  client,
  serverToken: false,
  browserToken: false,
})
