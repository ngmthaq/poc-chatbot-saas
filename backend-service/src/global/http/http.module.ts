import { HttpModule as AxiosHttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    AxiosHttpModule.registerAsync({
      useFactory: () => ({
        timeout: 10_000,
        maxRedirects: 5,
      }),
    }),
  ],
  exports: [AxiosHttpModule],
})
export class HttpModule {}
