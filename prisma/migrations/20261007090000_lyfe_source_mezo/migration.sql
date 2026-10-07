-- Mezo is producing organic dermatology demand that Lyfe has no way of
-- claiming credit for. Without its own value these arrive as OTHER, and a
-- channel you cannot count is a channel you cannot argue for.
ALTER TYPE "LyfeSource" ADD VALUE IF NOT EXISTS 'MEZO';
