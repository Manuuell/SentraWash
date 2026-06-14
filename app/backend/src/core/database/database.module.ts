import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from '../config/configuration';

/**
 * Conexión a PostgreSQL. El esquema se gestiona SOLO con migraciones
 * (synchronize=false en prod). autoLoadEntities registra las entidades
 * declaradas con TypeOrmModule.forFeature en cada módulo.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const db = configService.get<DatabaseConfig>('database')!;
        return {
          type: 'postgres',
          host: db.host,
          port: db.port,
          username: db.username,
          password: db.password,
          database: db.database,
          ssl: db.ssl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: db.synchronize,
          logging: db.logging,
          migrationsRun: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
