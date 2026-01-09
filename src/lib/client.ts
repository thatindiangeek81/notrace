import { treaty } from '@elysiajs/eden'
import type { App } from '../app/api/[[...slugs]]/route'

const baseURL = typeof window !== 'undefined' 
  ? window.location.origin 
  : 'http://localhost:3000'

export const client = treaty<App>(baseURL).api