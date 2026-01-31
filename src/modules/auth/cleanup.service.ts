import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tự động xóa tài khoản chưa xác thực sau 3 ngày
   * Chạy mỗi ngày lúc 2:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteUnverifiedUsers() {
    try {
      this.logger.log('🔍 Bắt đầu kiểm tra tài khoản chưa xác thực...');

      // Tính thời gian 3 ngày trước
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Tìm và xóa users chưa xác thực sau 3 ngày
      const result = await this.prisma.user.deleteMany({
        where: {
          isVerified: false,
          createdAt: {
            lt: threeDaysAgo, // Tài khoản tạo trước 3 ngày
          },
        },
      });

      if (result.count > 0) {
        this.logger.warn(
          `🗑️  Đã xóa ${result.count} tài khoản chưa xác thực sau 3 ngày`,
        );
      } else {
        this.logger.log('✅ Không có tài khoản nào cần xóa');
      }

      return {
        deletedCount: result.count,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('❌ Lỗi khi xóa tài khoản chưa xác thực:', error);
      throw error;
    }
  }

  /**
   * Gửi email nhắc nhở trước khi xóa (1 ngày trước khi hết hạn)
   * Chạy mỗi ngày lúc 10:00 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async sendReminderEmails() {
    try {
      this.logger.log('📧 Kiểm tra tài khoản cần gửi email nhắc nhở...');

      // Tính thời gian 2 ngày trước (còn 1 ngày nữa sẽ bị xóa)
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Tìm users chưa xác thực và sắp bị xóa
      const usersToRemind = await this.prisma.user.findMany({
        where: {
          isVerified: false,
          createdAt: {
            gte: threeDaysAgo, // Sau 3 ngày trước
            lt: twoDaysAgo, // Trước 2 ngày trước
          },
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          createdAt: true,
        },
      });

      if (usersToRemind.length > 0) {
        this.logger.log(
          `📬 Tìm thấy ${usersToRemind.length} tài khoản cần nhắc nhở`,
        );
        // TODO: Gửi email nhắc nhở (implement sau nếu cần)
        // await this.mailService.sendReminderEmail(...)
      } else {
        this.logger.log('✅ Không có tài khoản nào cần nhắc nhở');
      }

      return {
        reminderCount: usersToRemind.length,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('❌ Lỗi khi gửi email nhắc nhở:', error);
      throw error;
    }
  }

  /**
   * Xóa thủ công tài khoản chưa xác thực (dùng cho testing hoặc admin)
   */
  async manualCleanup() {
    this.logger.log('🔧 Thực hiện cleanup thủ công...');
    return this.deleteUnverifiedUsers();
  }
}
