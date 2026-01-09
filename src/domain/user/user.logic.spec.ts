import { validateLogin } from './user.logic'

describe('UserContext login logic', () => {

  it('allows login with correct credentials', () => {
    const dbUser = {
      id: '1',
      email: 'user@test.com',
      password: '123456',
      name: 'João',
      preferred_language: 'pt',
    }

    const result = validateLogin(dbUser, '123456')

    expect(result.error).toBeNull()
    expect(result.user).toEqual({
      id: '1',
      email: 'user@test.com',
      username: 'João',
      preferred_language: 'pt',
    })
  })

  it('returns error if password is incorrect', () => {
    const dbUser = {
      id: '2',
      email: 'maria@test.com',
      password: 'abcdef',
      name: 'Maria',
      preferred_language: 'en',
    }

    const result = validateLogin(dbUser, 'wrongpassword')

    expect(result.error).toBe('Incorrect password.')
    expect(result.user).toBeNull()
  })

  it('returns error if user does not exist', () => {
    const dbUser = null 

    const result = validateLogin(dbUser, 'anyPassword')

    expect(result.error).toBe('User not found.')
    expect(result.user).toBeNull()
  })
})
