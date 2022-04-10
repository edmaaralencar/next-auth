import jwtDecode from 'jwt-decode'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import { destroyCookie, parseCookies } from 'nookies'
import { AuthTokenError } from '../services/errors/AuthTokenError'
import { validateUserPermissions } from './validateUserPermissions'

type WithSSRAuthOptions = {
  permissions?: string[]
  roles?: string[]
}

export function withSSRAuth(
  fn: GetServerSideProps,
  options?: WithSSRAuthOptions
) {
  return async (ctx: GetServerSidePropsContext) => {
    const cookies = parseCookies(ctx)
    const token = cookies['nextauth.token']

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if (options) {
      const user = await jwtDecode<{ permissions: string[]; roles: string[] }>(
        token
      )
      const { roles, permissions } = options

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      })

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }

    try {
      return await fn(ctx)
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, 'nextauth.token')
        destroyCookie(ctx, 'nextauth.refreshToken')

        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      }

      return {
        redirect: {
          destination: `/`,
          permanent: false
        }
      }
    }
  }
}
