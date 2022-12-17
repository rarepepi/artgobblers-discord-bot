import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): string {
    const statusDto = {
      status: AppService.running ? 'Running' : 'Not Running',
      walletAddress: process.env.WALLET_ADDRESS,
    };
    return JSON.stringify(statusDto);
  }

  @Get('/run')
  runTask(): Promise<string> {
    return this.appService.run();
  }
}
