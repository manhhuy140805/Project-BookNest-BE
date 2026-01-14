-- Insert dữ liệu mẫu cho bảng User
INSERT INTO "User" (id, email, "hashPassword", "fullName", "avatarUrl", "bio", "dateOfBirth", role, "isActive", "isVerified", "createdAt") VALUES
(1, 'huy@gmail.com.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'User One', 'https://example.com/avatar1.png', 'Bio of User One', '1990-01-01', 'USER', true, false, NOW()),
(2, 'admin@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'User Two', 'https://example.com/avatar2.png', 'Bio of User Two', '1992-02-02', 'ADMIN', true, true, NOW()),
(3, 'moderator@gmail.com', '$2a$10$dqczDcwu6mbnKSCzBsE8TuCxNb38hboHovM8RNhrlecqoZpOfw7F.', 'User Three', NULL, NULL, NULL, 'MODERATOR', true, false, NOW());

-- Insert dữ liệu mẫu cho bảng Category
INSERT INTO "Category" (id, name) VALUES
(1, 'Fiction'),
(2, 'Non-Fiction'),
(3, 'Science'),
(4, 'History');

-- Insert dữ liệu mẫu cho bảng Book
INSERT INTO "Book" (id, title, author, "categoryId", "createdAt") VALUES
(1, 'The Great Gatsby', 'F. Scott Fitzgerald', 1, NOW()),
(2, 'Sapiens: A Brief History of Humankind', 'Yuval Noah Harari', 2, NOW()),
(3, 'A Brief History of Time', 'Stephen Hawking', 3, NOW()),
(4, 'The Diary of a Young Girl', 'Anne Frank', 4, NOW());

-- Insert dữ liệu mẫu cho bảng Rating
INSERT INTO "Rating" (id, score, "userId", "bookId", "createdAt") VALUES
(1, 5, 1, 1, NOW()),
(2, 4, 1, 2, NOW()),
(3, 5, 2, 3, NOW()),
(4, 3, 3, 4, NOW());