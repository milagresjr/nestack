import 'dotenv/config'

export default function globalSetup() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL não definida. Verifique o seu .env')
  }
}
