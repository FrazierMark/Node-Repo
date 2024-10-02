import { createId as cuid } from '@paralleldrive/cuid2'
import { redirect } from '@remix-run/node'
import { GitHubStrategy } from 'remix-auth-github'
import { z } from 'zod'
import { cache, cachified } from '../cache.server.ts'
import { connectionSessionStorage } from '../connections.server.ts'
import { type Timings } from '../timing.server.ts'
import { MOCK_CODE_GITHUB_HEADER, MOCK_CODE_GITHUB } from './constants.ts'
import { type AuthProvider } from './provider.ts'
import { getAccessToken } from '../auth.server.ts'

const GitHubUserSchema = z.object({ login: z.string() })
const GitHubUserParseResult = z
	.object({
		success: z.literal(true),
		data: GitHubUserSchema,
	})
	.or(
		z.object({
			success: z.literal(false),
		}),
	)

const shouldMock =
	process.env.GITHUB_CLIENT_ID?.startsWith('MOCK_') ||
	process.env.NODE_ENV === 'test'

export class GitHubProvider implements AuthProvider {
	getAuthStrategy() {
		return new GitHubStrategy(
			{
				clientID: process.env.GITHUB_CLIENT_ID,
				clientSecret: process.env.GITHUB_CLIENT_SECRET,
				callbackURL: '/auth/github/callback',
			},
			async ({ accessToken, profile }) => {
				console.log('GitHub authentication successful. User ID:', profile.id);
				console.log('Access Token received:', accessToken ? 'Yes' : 'No');

				const email = profile.emails[0]?.value.trim().toLowerCase()
				if (!email) {
					throw new Error('Email not found')
				}
				const username = profile.displayName
				const imageUrl = profile.photos[0].value

				const userId = profile.id;
				console.log('Caching token for user ID:', userId);
				await cacheAccessToken(userId, accessToken)

				return {
					email,
					id: profile.id,
					username,
					name: profile.name.givenName,
					imageUrl,
					accessToken,
				}
			},
		)
	}

	async resolveConnectionData(
		providerId: string,
		{ timings }: { timings?: Timings } = {},
	) {
		const result = await cachified({
			key: `connection-data:github:${providerId}`,
			cache,
			timings,
			ttl: 1000 * 60,
			swr: 1000 * 60 * 60 * 24 * 7,
			async getFreshValue(context) {
				const response = await fetch(
					`https://api.github.com/user/${providerId}`,
					{ headers: { Authorization: `token ${process.env.GITHUB_TOKEN}` } },
				)
				const rawJson = await response.json()
				const result = GitHubUserSchema.safeParse(rawJson)
				if (!result.success) {
					// if it was unsuccessful, then we should kick it out of the cache
					// asap and try again.
					context.metadata.ttl = 0
				}
				return result
			},
			checkValue: GitHubUserParseResult,
		})
		return {
			displayName: result.success ? result.data.login : 'Unknown',
			link: result.success ? `https://github.com/${result.data.login}` : null,
		} as const
	}

	async handleMockAction(request: Request) {
		if (!shouldMock) return

		const connectionSession = await connectionSessionStorage.getSession(
			request.headers.get('cookie'),
		)
		const state = cuid()
		connectionSession.set('oauth2:state', state)

		// allows us to inject a code when running e2e tests,
		// but falls back to a pre-defined 🐨 constant
		const code =
			request.headers.get(MOCK_CODE_GITHUB_HEADER) || MOCK_CODE_GITHUB
		const searchParams = new URLSearchParams({ code, state })
		throw redirect(`/auth/github/callback?${searchParams}`, {
			headers: {
				'set-cookie':
					await connectionSessionStorage.commitSession(connectionSession),
			},
		})
	}
}

export async function checkNodesInCache(repoTreeId: string, nodeIds: string[]): Promise<Record<string, boolean>> {
	const results: Record<string, boolean> = {}

	await Promise.all(
		nodeIds.map(async (nodeId) => {
			const cacheKey = `repo:${repoTreeId}:node:${nodeId}`
			
			try {
				const result = await cachified({
					key: cacheKey,
					ttl: 1000 * 60 * 60, // 1 hour, adjust as needed
					cache,
					async getFreshValue(context) {
						// Instead of returning null, we'll throw an error
						// if the value is not in the cache
						throw new Error('Not in cache')
					},
					checkValue(value) {
						// Any non-null value is considered valid
						return value != null
					},
				})

				// If we reach here, the value was in the cache
				results[nodeId] = true
			} catch (error) {
				// If we catch an error, it means the value was not in the cache
				results[nodeId] = false
			}
		})
	)

	return results
}

export async function saveNodeToCache(repoTreeId: string, nodeId: string, nodeCodeData: any): Promise<void> {
	const cacheKey = `repo:${repoTreeId}:node:${nodeId}`

	await cachified({
		key: cacheKey,
		ttl: 1000 * 60 * 60 * 3, // 3 hours
		cache,
		async getFreshValue(context) {
			return nodeCodeData
		},
		checkValue(value) {
			return value !== null
		},
	})
}

export async function getCachedAccessToken(userId: string): Promise<string | null> {
  console.log('Attempting to retrieve access token for user ID:', userId);
  try {
    const result = await cachified({
      key: `github:accessToken:${userId}`,
      cache,
      ttl: 1000 * 60 * 60 * 3, // 3 hours
      async getFreshValue() {
        console.log('Access token not found in cache for user ID:', userId);
        return null;
      },
      checkValue(value) {
        return typeof value === 'string';
      },
    });

    if (result) {
      console.log('Retrieved access token from cache for user ID:', userId);
      return result;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving access token from cache:', error);
    return null;
  }
}

export async function cacheAccessToken(userId: string, accessToken: string): Promise<void> {
  console.log('Caching access token for user ID:', userId);
  try {
    await cachified({
      key: `github:accessToken:${userId}`,
      cache,
      ttl: 1000 * 60 * 60 * 3, // 3 hours
      async getFreshValue() {
        return accessToken;
      },
    });
    console.log('Access token cached successfully for user ID:', userId);
  } catch (error) {
    console.error('Error caching access token:', error);
  }
}