import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Discord users table
  await knex.schema.createTable('discord_users', (table) => {
    table.string('id').primary();
    table.string('username').notNullable();
    table.string('discriminator').notNullable();
    table.string('avatar').nullable();
    table.string('email').nullable();
    table.timestamp('last_login').defaultTo(knex.fn.now());
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Guilds table
  await knex.schema.createTable('guilds', (table) => {
    table.string('id').primary();
    table.string('name').notNullable();
    table.string('icon').nullable();
    table.string('owner_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Guild settings table
  await knex.schema.createTable('guild_settings', (table) => {
    table.increments('id').primary();
    table.string('guild_id').notNullable().references('id').inTable('guilds').onDelete('CASCADE');
    table.string('setting_key').notNullable();
    table.jsonb('setting_value').notNullable();
    table.string('updated_by').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.unique(['guild_id', 'setting_key']);
    table.index(['guild_id']);
  });

  // Sessions table
  await knex.schema.createTable('sessions', (table) => {
    table.string('sid').primary();
    table.jsonb('sess').notNullable();
    table.timestamp('expire').notNullable();
    table.index(['expire']);
  });

  // Audit logs table
  await knex.schema.createTable('audit_logs', (table) => {
    table.increments('id').primary();
    table.string('guild_id').notNullable().references('id').inTable('guilds').onDelete('CASCADE');
    table.string('user_id').notNullable();
    table.string('action').notNullable();
    table.jsonb('changes').nullable();
    table.string('ip_address').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.index(['guild_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('audit_logs');
  await knex.schema.dropTableIfExists('sessions');
  await knex.schema.dropTableIfExists('guild_settings');
  await knex.schema.dropTableIfExists('guilds');
  await knex.schema.dropTableIfExists('discord_users');
}
