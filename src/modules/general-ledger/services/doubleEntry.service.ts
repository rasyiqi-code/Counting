import { prisma } from '@/shared/database/prisma';
import { JournalEntity } from '../domain/journal.entity';
import { CreateJournalInput, PostJournalInput, ReverseJournalInput } from '../types';
import { Decimal } from 'decimal.js';
import { format } from 'date-fns';

/**
 * Double Entry Service
 * 
 * Core service untuk double entry accounting system
 * Semua transaksi harus melalui service ini untuk ensure balanced journals
 */
export class DoubleEntryService {
  /**
   * Create journal entry dengan validasi double entry
   */
  async createJournal(
    companyId: string,
    input: CreateJournalInput,
    options?: {
      sourceType?: string;
      sourceId?: string;
      createdById?: string;
    }
  ) {
    // Validate using domain entity
    const journalEntity = new JournalEntity(input.entries);
    const validation = journalEntity.validate();

    if (!validation.valid) {
      throw new Error(`Journal validation failed: ${validation.errors.join(', ')}`);
    }

    // Generate journal number
    const journalNo = await this.generateJournalNo(companyId, new Date(input.date));

    // Create journal with entries
    const journal = await prisma.journal.create({
      data: {
        companyId,
        journalNo,
        date: new Date(input.date),
        description: input.description,
        referenceNo: input.referenceNo,
        sourceType: options?.sourceType,
        sourceId: options?.sourceId,
        status: 'DRAFT',
        totalDebit: journalEntity.getTotalDebit().toString(),
        totalCredit: journalEntity.getTotalCredit().toString(),
        createdById: options?.createdById,
        entries: {
          create: input.entries.map(entry => ({
            accountId: entry.accountId,
            debit: new Decimal(entry.debit).toString(),
            credit: new Decimal(entry.credit).toString(),
            description: entry.description,
            departmentId: entry.departmentId,
          })),
        },
      },
      include: {
        entries: {
          include: {
            account: {
              select: {
                code: true,
                name: true,
                accountType: true,
              },
            },
          },
        },
      },
    });

    return journal;
  }

  /**
   * Post journal (make it final dan update account balances)
   */
  async postJournal(input: PostJournalInput, userId?: string) {
    const journal = await prisma.journal.findUnique({
      where: { id: input.journalId },
      include: {
        entries: true,
      },
    });

    if (!journal) {
      throw new Error('Journal not found');
    }

    if (journal.status === 'POSTED') {
      throw new Error('Journal already posted');
    }

    if (journal.status === 'VOID') {
      throw new Error('Cannot post void journal');
    }

    // Update journal status
    await prisma.journal.update({
      where: { id: input.journalId },
      data: {
        status: 'POSTED',
        postedAt: new Date(),
        updatedById: userId,
      },
    });

    // Update account balances
    for (const entry of journal.entries) {
      await this.updateAccountBalance(
        entry.accountId,
        new Decimal(entry.debit),
        new Decimal(entry.credit)
      );
    }

    return journal;
  }

  /**
   * Reverse journal (create reversing entry)
   */
  async reverseJournal(
    companyId: string,
    input: ReverseJournalInput,
    userId?: string
  ) {
    const originalJournal = await prisma.journal.findUnique({
      where: { id: input.journalId },
      include: {
        entries: {
          include: {
            account: true,
          },
        },
      },
    });

    if (!originalJournal) {
      throw new Error('Journal not found');
    }

    if (originalJournal.status !== 'POSTED') {
      throw new Error('Can only reverse posted journals');
    }

    // Create reversing entries (swap debit and credit)
    const reversingEntries = originalJournal.entries.map((entry: any) => ({
      accountId: entry.accountId,
      debit: entry.credit, // Swap
      credit: entry.debit, // Swap
      description: entry.description || undefined,
      departmentId: entry.departmentId || undefined,
    }));

    // Create reversing journal
    const reversingJournal = await this.createJournal(
      companyId,
      {
        date: new Date(input.date),
        description: input.description || `Reversing: ${originalJournal.description}` || '',
        referenceNo: originalJournal.journalNo,
        entries: reversingEntries,
      },
      {
        sourceType: 'REVERSING',
        sourceId: originalJournal.id,
        createdById: userId,
      }
    );

    // Auto-post reversing journal
    await this.postJournal({ journalId: reversingJournal.id }, userId);

    return reversingJournal;
  }

  /**
   * Void journal (mark as void, cannot be undone)
   */
  async voidJournal(journalId: string, userId?: string) {
    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
    });

    if (!journal) {
      throw new Error('Journal not found');
    }

    if (journal.status === 'POSTED') {
      throw new Error('Cannot void posted journal. Use reverse instead.');
    }

    await prisma.journal.update({
      where: { id: journalId },
      data: {
        status: 'VOID',
        updatedById: userId,
      },
    });

    return journal;
  }

  /**
   * Generate journal number
   * Format: JRN-YYYYMMDD-XXXX
   */
  private async generateJournalNo(companyId: string, date: Date): Promise<string> {
    const dateStr = format(date, 'yyyyMMdd');
    const prefix = `JRN-${dateStr}`;

    // Get last journal number for this date
    const lastJournal = await prisma.journal.findFirst({
      where: {
        companyId,
        journalNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        journalNo: 'desc',
      },
    });

    let sequence = 1;
    if (lastJournal) {
      const lastSequence = parseInt(lastJournal.journalNo.split('-')[2]);
      sequence = lastSequence + 1;
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Update account balance
   * Asset, Expense, COGS: debit increases, credit decreases
   * Liability, Equity, Revenue: credit increases, debit decreases
   */
  private async updateAccountBalance(
    accountId: string,
    debit: Decimal,
    credit: Decimal
  ) {
    const account = await prisma.chartOfAccount.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    const currentBalance = new Decimal(account.balance);
    let newBalance: Decimal;

    // Determine how to update balance based on account type
    const normalDebitAccounts = ['ASSET', 'EXPENSE', 'COGS'];
    const normalCreditAccounts = ['LIABILITY', 'EQUITY', 'REVENUE'];

    if (normalDebitAccounts.includes(account.accountType)) {
      // Debit increases, credit decreases
      newBalance = currentBalance.plus(debit).minus(credit);
    } else if (normalCreditAccounts.includes(account.accountType)) {
      // Credit increases, debit decreases
      newBalance = currentBalance.minus(debit).plus(credit);
    } else {
      throw new Error(`Unknown account type: ${account.accountType}`);
    }

    await prisma.chartOfAccount.update({
      where: { id: accountId },
      data: {
        balance: newBalance.toString(),
      },
    });
  }
}

export const doubleEntryService = new DoubleEntryService();

