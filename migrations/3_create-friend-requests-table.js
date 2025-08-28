exports.up = (pgm) => {
  pgm.createTable('friend_requests', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    sender_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    receiver_id: { type: 'uuid', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    status: { type: 'varchar(10)', notNull: true, check: "status IN ('pending', 'accepted', 'declined')" },
    created_at: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });

  pgm.createIndex('friend_requests', ['sender_id', 'receiver_id', 'status'], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('friend_requests');
};
