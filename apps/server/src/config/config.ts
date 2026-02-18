import dotenv from 'dotenv';

dotenv.config();

interface IConfig {
  port: number;
  nodeEnv: String
}

const config: IConfig = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development'
}

export default config;