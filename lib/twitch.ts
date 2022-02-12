import { ApiClient } from "@twurple/api"
import { ClientCredentialsAuthProvider } from "@twurple/auth"

const auth = new ClientCredentialsAuthProvider(process.env.TWITCH_CLIENT_ID as string, process.env.TWITCH_CLIENT_SECRET as string)

export const client = new ApiClient({ authProvider: auth })