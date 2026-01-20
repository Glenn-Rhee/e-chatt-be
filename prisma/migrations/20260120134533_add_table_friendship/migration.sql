-- CreateTable
CREATE TABLE `FriendShip` (
    `id` VARCHAR(191) NOT NULL,
    `userIdA` VARCHAR(191) NOT NULL,
    `userIdB` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FriendShip_userIdA_userIdB_key`(`userIdA`, `userIdB`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FriendShip` ADD CONSTRAINT `FriendShip_userIdA_fkey` FOREIGN KEY (`userIdA`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FriendShip` ADD CONSTRAINT `FriendShip_userIdB_fkey` FOREIGN KEY (`userIdB`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
