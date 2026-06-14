import { randomUUID } from 'node:crypto';
import dataSource from './data-source';

/**
 * Seed de desarrollo: crea un plan, un lavadero (tenant) demo, su configuración
 * y un par de servicios. Muestra el patrón de onboarding del primer tenant:
 * se genera su `id` en la app y se fija en `app.current_tenant` ANTES del insert,
 * de modo que la política RLS WITH CHECK (id = current_tenant) lo permita.
 *
 * Ejecutar tras las migraciones: npm run seed
 */
async function seed(): Promise<void> {
  await dataSource.initialize();

  // 1) Plan (tabla global, sin RLS).
  await dataSource.query(
    `INSERT INTO subscription_plans (nombre, precio_mensual, limite_usuarios, limite_ordenes_mes)
     VALUES ('Demo', 0, 10, 1000)
     ON CONFLICT (nombre) DO NOTHING`,
  );
  const [plan] = await dataSource.query(
    `SELECT id FROM subscription_plans WHERE nombre = 'Demo'`,
  );

  // 2) Tenant + datos dependientes, dentro de una transacción con el GUC fijado.
  const tenantId = randomUUID();
  const qr = dataSource.createQueryRunner();
  await qr.connect();
  await qr.startTransaction();
  try {
    await qr.query(`SELECT set_config('app.current_tenant', $1, true)`, [tenantId]);
    await qr.query(
      `INSERT INTO tenants (id, nombre, ciudad, telefono, plan_id, estado)
       VALUES ($1, 'Lavadero Demo', 'Cartagena', '+573000000000', $2, 'activo')`,
      [tenantId, plan.id],
    );
    await qr.query(`INSERT INTO tenant_settings (tenant_id) VALUES ($1)`, [tenantId]);
    await qr.query(
      `INSERT INTO services (tenant_id, nombre, precio, duracion_min)
       VALUES ($1, 'Lavado básico', 20000, 30), ($1, 'Lavado completo', 35000, 60)`,
      [tenantId],
    );
    await qr.commitTransaction();
  } catch (error) {
    await qr.rollbackTransaction();
    throw error;
  } finally {
    await qr.release();
  }

  // eslint-disable-next-line no-console
  console.log('\n✅ Seed completado.');
  // eslint-disable-next-line no-console
  console.log(`   Tenant demo creado. Usa este header en tus requests:\n   x-tenant-id: ${tenantId}\n`);

  await dataSource.destroy();
}

seed().catch((error) => {
  // eslint-disable-next-line no-console
  console.error('❌ Error en el seed:', error);
  process.exit(1);
});
