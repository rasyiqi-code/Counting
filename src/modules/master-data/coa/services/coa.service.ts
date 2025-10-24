import { prisma } from '@/shared/database/prisma';
import {
  CreateAccountInput,
  UpdateAccountInput,
  SetOpeningBalanceInput,
  AccountNode,
} from '../types';
import { Decimal } from 'decimal.js';

/**
 * Chart of Accounts Service
 */
export class CoaService {
  /**
   * Create new account
   */
  async createAccount(companyId: string, input: CreateAccountInput) {
    // Check if code already exists
    const existing = await prisma.chartOfAccount.findFirst({
      where: {
        companyId,
        code: input.code,
      },
    });

    if (existing) {
      throw new Error(`Account code ${input.code} already exists`);
    }

    // Validate parent if provided
    if (input.parentId) {
      const parent = await prisma.chartOfAccount.findFirst({
        where: {
          id: input.parentId,
          companyId,
        },
      });

      if (!parent) {
        throw new Error('Parent account not found');
      }
    }

    const account = await prisma.chartOfAccount.create({
      data: {
        companyId,
        ...input,
      },
    });

    return account;
  }

  /**
   * Update account
   */
  async updateAccount(companyId: string, input: UpdateAccountInput) {
    const { id, ...data } = input;

    // Check if account exists
    const account = await prisma.chartOfAccount.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Check if it's a system account
    if (account.isSystem) {
      throw new Error('Cannot update system account');
    }

    // Check code uniqueness if updating code
    if (data.code && data.code !== account.code) {
      const existing = await prisma.chartOfAccount.findFirst({
        where: {
          companyId,
          code: data.code,
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error(`Account code ${data.code} already exists`);
      }
    }

    const updated = await prisma.chartOfAccount.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete account (soft delete by marking inactive)
   */
  async deleteAccount(companyId: string, accountId: string) {
    const account = await prisma.chartOfAccount.findFirst({
      where: {
        id: accountId,
        companyId,
      },
      include: {
        children: true,
        journalEntries: {
          take: 1,
        },
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    if (account.isSystem) {
      throw new Error('Cannot delete system account');
    }

    if (account.children.length > 0) {
      throw new Error('Cannot delete account with child accounts');
    }

    if (account.journalEntries.length > 0) {
      throw new Error('Cannot delete account with transactions');
    }

    // Soft delete by marking inactive
    await prisma.chartOfAccount.update({
      where: { id: accountId },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Calculate real-time account balances from journal entries
   */
  async calculateAccountBalances(companyId: string, accountIds: string[]): Promise<Map<string, Decimal>> {
    const balances = new Map<string, Decimal>();

    // Initialize all accounts with zero balance
    for (const accountId of accountIds) {
      balances.set(accountId, new Decimal(0));
    }

    // Get all journal entries for these accounts
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        accountId: {
          in: accountIds,
        },
        journal: {
          companyId,
          status: 'POSTED', // Only include posted journals
        },
      },
      select: {
        accountId: true,
        debit: true,
        credit: true,
      },
    });

    // Calculate balances
    for (const entry of journalEntries) {
      const currentBalance = balances.get(entry.accountId) || new Decimal(0);
      const newBalance = currentBalance.plus(entry.debit).minus(entry.credit);
      balances.set(entry.accountId, newBalance);
    }

    return balances;
  }

  /**
   * Get account tree (hierarchical structure)
   */
  async getAccountTree(companyId: string, showInactive: boolean = false): Promise<AccountNode[]> {
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        companyId,
        isActive: showInactive ? undefined : true,
      },
      orderBy: {
        code: 'asc',
      },
    });

    // Calculate real-time balances for all accounts
    const accountBalances = await this.calculateAccountBalances(companyId, accounts.map(a => a.id));

    // Build tree structure
    const accountMap = new Map<string, AccountNode>();
    const rootAccounts: AccountNode[] = [];

    // First pass: create nodes with real-time balances
    for (const account of accounts) {
      const realTimeBalance = accountBalances.get(account.id) || new Decimal(0);
      accountMap.set(account.id, {
        id: account.id,
        code: account.code,
        name: account.name,
        accountType: account.accountType,
        category: account.category,
        balance: realTimeBalance.toString(),
        isActive: account.isActive,
        children: [],
      });
    }

    // Second pass: build hierarchy
    for (const account of accounts) {
      const node = accountMap.get(account.id)!;
      
      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          rootAccounts.push(node);
        }
      } else {
        rootAccounts.push(node);
      }
    }

    return rootAccounts;
  }

  /**
   * Set opening balance
   */
  async setOpeningBalance(companyId: string, input: SetOpeningBalanceInput) {
    const account = await prisma.chartOfAccount.findFirst({
      where: {
        id: input.accountId,
        companyId,
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Update balance
    await prisma.chartOfAccount.update({
      where: { id: input.accountId },
      data: {
        balance: new Decimal(input.balance).toString(),
      },
    });

    return { success: true };
  }

  /**
   * Get account by ID
   */
  async getAccountById(companyId: string, accountId: string) {
    const account = await prisma.chartOfAccount.findFirst({
      where: {
        id: accountId,
        companyId,
      },
      include: {
        parent: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!account) {
      throw new Error('Account not found');
    }

    // Calculate real-time balance
    const realTimeBalance = await this.calculateAccountBalances(companyId, [accountId]);
    const balance = realTimeBalance.get(accountId) || new Decimal(0);

    return {
      ...account,
      balance,
    };
  }

  /**
   * Search accounts
   */
  async searchAccounts(companyId: string, query: string) {
    const accounts = await prisma.chartOfAccount.findMany({
      where: {
        companyId,
        isActive: true,
        OR: [
          { code: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: {
        code: 'asc',
      },
      take: 20,
    });

    return accounts;
  }
}

export const coaService = new CoaService();

