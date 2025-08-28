exports.up = (pgm) => {
  pgm.createTable('friends', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id_1: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    user_id_2: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('friends', ['user_id_1', 'user_id_2'], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('friends');
};
