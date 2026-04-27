package repo

import "database/sql"

func Migrate(db *sql.DB) error {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id UUID PRIMARY KEY,
		github_id TEXT UNIQUE,
		login TEXT,
		name TEXT NULL,
		surname TEXT NULL,
		avatar_url TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	CREATE TABLE IF NOT EXISTS rooms (
		id TEXT  PRIMARY KEY,
		owner_id TEXT,
		code TEXT,
		language TEXT,
		status TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);
	`
	_, err := db.Exec(query)
	return err
}
