import { Controller, Get, Req } from '@nestjs/common';

@Controller()
export class AppController {
  getHello(): any {
    throw new Error('Method not implemented.');
  }
  @Get()
  someProtectedRoute(@Req() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    return { message: 'Accessed Resource', userId: req.userId };
  }
}
