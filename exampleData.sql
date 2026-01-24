-- ===============================
-- DELETE ALL DATA FROM TABLES
-- ===============================
DELETE FROM "SearchHistory";
DELETE FROM "RefreshToken";
DELETE FROM "Rating";
DELETE FROM "Book";
DELETE FROM "Category";
DELETE FROM "User";

-- Reset sequence IDs
ALTER SEQUENCE "User_id_seq" RESTART WITH 101;
ALTER SEQUENCE "Category_id_seq" RESTART WITH 101;
ALTER SEQUENCE "Book_id_seq" RESTART WITH 101;
ALTER SEQUENCE "Rating_id_seq" RESTART WITH 101;
ALTER SEQUENCE "RefreshToken_id_seq" RESTART WITH 1;
ALTER SEQUENCE "SearchHistory_id_seq" RESTART WITH 1;

-- ===============================
-- INSERT DATA FOR TABLE "User"
-- ===============================
INSERT INTO "User"
(id, email, "hashPassword", "fullName", "avatarUrl", "bio", "dateOfBirth", role, "isActive", "isVerified", "createdAt", "updatedAt")
VALUES
(101, 'huy@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'User One', 'https://example.com/avatar1.png', 'Bio of User One', '1990-01-01', 'USER', true, false, NOW(), NOW()),
(102, 'admin@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'User Two', 'https://example.com/avatar2.png', 'Bio of User Two', '1992-02-02', 'ADMIN', true, true, NOW(), NOW()),
(103, 'moderator@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'User Three', NULL, NULL, NULL, 'MODERATOR', true, false, NOW(), NOW()),
(104, 'lan@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'Lan Nguyen', NULL, 'Book lover', '1995-05-12', 'USER', true, true, NOW(), NOW()),
(105, 'minh@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'Minh Tran', NULL, NULL, '1998-09-21', 'USER', true, false, NOW(), NOW()),
(106, 'hoa@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'Hoa Le', NULL, 'Science enthusiast', '1993-03-03', 'USER', true, true, NOW(), NOW()),
(107, 'editor@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'Editor User', NULL, NULL, '1991-11-11', 'MODERATOR', true, true, NOW(), NOW());

-- ===============================
-- INSERT DATA FOR TABLE "Category"
-- ===============================
INSERT INTO "Category" (id, name, "createdAt", "updatedAt") VALUES
(101, 'Fiction', NOW(), NOW()),
(102, 'Non-Fiction', NOW(), NOW()),
(103, 'Science', NOW(), NOW()),
(104, 'History', NOW(), NOW()),
(105, 'Technology', NOW(), NOW()),
(106, 'Psychology', NOW(), NOW()),
(107, 'Philosophy', NOW(), NOW()),
(108, 'Self-Help', NOW(), NOW()),
(109, 'Fantasy', NOW(), NOW());

-- ===============================
-- INSERT DATA FOR TABLE "Book"
-- ===============================
INSERT INTO "Book"
(id, title, author, description, "categoryId", "createdAt", "updatedAt")
VALUES
(101, 'The Great Gatsby', 'F. Scott Fitzgerald', 'A classic American novel depicting the Jazz Age and exploring themes of wealth, love, and the American Dream.', 101, NOW(), NOW()),
(102, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 'An exploration of how Homo sapiens came to dominate the world, covering history from the Stone Age to modern times.', 102, NOW(), NOW()),
(103, 'A Brief History of Time', 'Stephen Hawking', 'A landmark volume in science writing that explains complex concepts of cosmology and quantum mechanics.', 103, NOW(), NOW()),
(104, 'The Diary of a Young Girl', 'Anne Frank', 'The powerful and poignant diary of Anne Frank, a Jewish girl who hid from the Nazis during the Holocaust.', 104, NOW(), NOW()),
(105, 'Clean Code', 'Robert C. Martin', 'A comprehensive guide to writing clean, readable, and maintainable code that every programmer should read.', 105, NOW(), NOW()),
(106, 'Thinking, Fast and Slow', 'Daniel Kahneman', 'Explores the two systems of thought and decision-making, revealing cognitive biases and heuristics.', 106, NOW(), NOW()),
(107, 'The Republic', 'Plato', 'A Socratic dialogue exploring justice, the ideal state, and the nature of human existence.', 107, NOW(), NOW()),
(108, 'Atomic Habits', 'James Clear', 'A practical guide to building good habits and breaking bad ones through small, incremental changes.', 108, NOW(), NOW()),
(109, 'Harry Potter and the Sorcerer''s Stone', 'J.K. Rowling', 'The first book in the Harry Potter series, following a young wizard''s journey into the magical world.', 109, NOW(), NOW()),
(110, 'The Pragmatic Programmer', 'Andrew Hunt', 'A guide to becoming a more effective and pragmatic programmer through practical tips and strategies.', 105, NOW(), NOW()),
(111, 'Man''s Search for Meaning', 'Viktor E. Frankl', 'A profound exploration of human meaning and resilience based on the author''s experiences in concentration camps.', 106, NOW(), NOW()),
(112, 'Meditations', 'Marcus Aurelius', 'A collection of personal writings from the Roman Emperor reflecting on Stoic philosophy and virtue.', 107, NOW(), NOW());

-- ===============================
-- INSERT DATA FOR TABLE "Rating"
-- ===============================
INSERT INTO "Rating"
(id, score, "userId", "bookId", "createdAt", "updatedAt")
VALUES
(101, 5, 101, 101, NOW(), NOW()),
(102, 4, 101, 102, NOW(), NOW()),
(103, 5, 102, 103, NOW(), NOW()),
(104, 3, 103, 104, NOW(), NOW()),
(105, 5, 104, 105, NOW(), NOW()),
(106, 4, 105, 106, NOW(), NOW()),
(107, 5, 106, 107, NOW(), NOW()),
(108, 5, 107, 108, NOW(), NOW()),
(109, 4, 101, 109, NOW(), NOW()),
(110, 5, 102, 110, NOW(), NOW()),
(111, 4, 103, 111, NOW(), NOW()),
(112, 5, 104, 112, NOW(), NOW()),
(113, 3, 105, 101, NOW(), NOW()),
(114, 4, 106, 102, NOW(), NOW());

-- ===============================
-- INSERT DATA FOR TABLE "RefreshToken"
-- ===============================
INSERT INTO "RefreshToken"
(id, "userId", token, "expiresAt", "createdAt")
VALUES
(1, 101, 'refresh_token_user_101', NOW() + INTERVAL '7 days', NOW()),
(2, 102, 'refresh_token_user_102', NOW() + INTERVAL '7 days', NOW()),
(3, 103, 'refresh_token_user_103', NOW() + INTERVAL '7 days', NOW()),
(4, 104, 'refresh_token_user_104', NOW() + INTERVAL '7 days', NOW()),
(5, 105, 'refresh_token_user_105', NOW() + INTERVAL '7 days', NOW());

-- ===============================
-- INSERT DATA FOR TABLE "SearchHistory"
-- ===============================
INSERT INTO "SearchHistory"
(id, "userId", query, results, "createdAt")
VALUES
(1, 101, 'programming', 5, NOW()),
(2, 101, 'fiction', 3, NOW()),
(3, 102, 'science', 8, NOW()),
(4, 103, 'history', 4, NOW()),
(5, 104, 'psychology', 6, NOW()),
(6, 104, 'self-help', 4, NOW()),
(7, 105, 'technology', 7, NOW()),
(8, 106, 'philosophy', 3, NOW()),
(9, 106, 'fiction', 2, NOW()),
(10, 107, 'books', 12, NOW());
