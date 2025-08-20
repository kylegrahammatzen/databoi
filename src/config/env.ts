import * as dotenv from 'dotenv';

dotenv.config();

type EnvironmentVariables = {
  DISCORD_TOKEN: string;
  CLIENT_ID: string;
  GUILD_ID?: string;
};

function validateEnv(): EnvironmentVariables {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.CLIENT_ID;
  const guildId = process.env.GUILD_ID;

  if (!token) {
    throw new Error('Missing DISCORD_TOKEN in environment variables');
  }

  if (!clientId) {
    throw new Error('Missing CLIENT_ID in environment variables');
  }

  return {
    DISCORD_TOKEN: token,
    CLIENT_ID: clientId,
    GUILD_ID: guildId
  };
}

export const env = validateEnv();