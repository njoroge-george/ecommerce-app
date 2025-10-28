-- Create ratings table
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` INT UNSIGNED AUTO_INCREMENT,
  `userId` INT NOT NULL,
  `productId` INT UNSIGNED NOT NULL,
  `rating` INT NOT NULL,
  `review` TEXT,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  UNIQUE KEY `unique_user_product` (`userId`, `productId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
