import { Injectable } from '@nestjs/common'
import { compare, hash } from 'bcryptjs'
import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator'

@Injectable()
export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8

  hash(plain: string) { return hash(plain, this.HASH_SALT_LENGTH) }
  compare(plain: string, hashed: string) { return compare(plain, hashed) }
}
