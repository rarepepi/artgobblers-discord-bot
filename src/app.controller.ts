import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(): string {
    const statusDto = {
      status: AppService.running ? 'Running' : 'Not Running',
      lastBlockProcessed: AppService.lastBlockProcessed,
      gobblesProcessed: Array.from(AppService.gobblesAlreadySent),
      glamsProcessed: Array.from(AppService.glamAlreadySent),
    };
    return JSON.stringify(statusDto);
  }

  @Get('/run')
  runTask(): Promise<string> {
    return this.appService.run();
  }
}
