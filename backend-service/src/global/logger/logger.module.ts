import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

import { REQUEST_ID_HEADER } from '../../shared/constants';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProd = config.get<string>('NODE_ENV') === 'production';
        const level = config.get<string>('LOG_LEVEL') ?? 'info';
        return {
          pinoHttp: {
            level,
            transport: isProd
              ? undefined
              : {
                  target: 'pino-pretty',
                  options: {
                    singleLine: true,
                    translateTime: 'SYS:standard',
                    colorize: true,
                  },
                },
            redact: {
              paths: [
                'req.headers.authorization',
                'req.headers.cookie',
                'req.body.password',
                'req.body.*.password',
                'res.headers["set-cookie"]',
                '*.token',
                '*.accessToken',
                '*.refreshToken',
              ],
              censor: '[REDACTED]',
            },
            customProps: (req) => ({
              requestId: (req.headers as Record<string, string>)[
                REQUEST_ID_HEADER
              ],
            }),
          },
          forRoutes: [{ path: '{*splat}', method: RequestMethod.ALL }],
        };
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
