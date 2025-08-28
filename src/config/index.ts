import * as process from 'node:process';
import replacePlaceholders from '../helpers/replacePlaceholders';

const varIsNotSetInEnv = "Environment variable '{var}' is not set.";

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(replacePlaceholders(varIsNotSetInEnv, { var: name }));
  }
  return value;
}

export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: getEnvVar('DB_URL'),
  salt: parseInt(process.env.SALT || '0') || 0,
  refreshTokenSecret: getEnvVar('JWT_REFRESH_SECRET'),
  accessTokenSecret: getEnvVar('JWT_ACCESS_SECRET'),
  accessTokenExpiresIn: getEnvVar('JWT_ACCESS_TTL'),
  refreshTokenExpiresIn: getEnvVar('JWT_REFRESH_TTL'),
});
