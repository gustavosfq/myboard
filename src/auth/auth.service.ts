import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUserByGoogle(profile: any): Promise<User> {
    return this.usersService.findOrCreate(profile);
  }

  async login(user: User) {
    const payload = { 
      email: user.email, 
      sub: user['_id'].toString(),
      name: user.name,
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user['_id'],
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    };
  }

  async validateUser(userId: string): Promise<User> {
    return this.usersService.findById(userId);
  }
}
