import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next'
import { parseCookies } from 'nookies'

export function withSSRGuest(fn: GetServerSideProps) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<any>> => {
    const cookies = parseCookies(ctx)

    if (cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    }

    return await fn(ctx)
  }
}
