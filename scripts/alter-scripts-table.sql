-- Allow user_id to be nullable in scripts table
ALTER TABLE scripts ALTER COLUMN user_id DROP NOT NULL;
