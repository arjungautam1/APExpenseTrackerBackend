import cron from 'node-cron';
import { processLoanPayments } from '../scripts/processLoanPayments';

export class CronService {
  private static instance: CronService;
  private isRunning = false;

  private constructor() {}

  static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  start() {
    if (this.isRunning) {
      console.log('Cron service is already running');
      return;
    }

    console.log('Starting cron service...');

    // Run loan payment processing every day at 1:00 AM
    cron.schedule('0 1 * * *', async () => {
      console.log('Running daily loan payment processing...');
      try {
        await processLoanPayments();
      } catch (error) {
        console.error('Error in daily loan payment processing:', error);
      }
    }, {
      timezone: "UTC"
    });

    // Also run it every hour during development for testing
    if (process.env.NODE_ENV === 'development') {
      cron.schedule('0 * * * *', async () => {
        console.log('Running hourly loan payment processing (development mode)...');
        try {
          await processLoanPayments();
        } catch (error) {
          console.error('Error in hourly loan payment processing:', error);
        }
      }, {
        timezone: "UTC"
      });
    }

    this.isRunning = true;
    console.log('Cron service started successfully');
  }

  stop() {
    if (!this.isRunning) {
      console.log('Cron service is not running');
      return;
    }

    cron.getTasks().forEach(task => task.stop());
    this.isRunning = false;
    console.log('Cron service stopped');
  }

  isServiceRunning(): boolean {
    return this.isRunning;
  }
}

export const cronService = CronService.getInstance();
