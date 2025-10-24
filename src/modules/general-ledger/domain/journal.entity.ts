import { Decimal } from 'decimal.js';
import { JournalEntryDTO } from '../types';

/**
 * Journal Entity
 * 
 * Business logic untuk Journal
 */
export class JournalEntity {
  private entries: JournalEntryDTO[];

  constructor(entries: JournalEntryDTO[]) {
    this.entries = entries;
  }

  /**
   * Validate that journal is balanced (debit = credit)
   */
  public isBalanced(): boolean {
    const totalDebit = this.getTotalDebit();
    const totalCredit = this.getTotalCredit();
    
    // Use Decimal for precise comparison
    return totalDebit.equals(totalCredit);
  }

  /**
   * Get total debit amount
   */
  public getTotalDebit(): Decimal {
    return this.entries.reduce((sum, entry) => {
      return sum.plus(new Decimal(entry.debit));
    }, new Decimal(0));
  }

  /**
   * Get total credit amount
   */
  public getTotalCredit(): Decimal {
    return this.entries.reduce((sum, entry) => {
      return sum.plus(new Decimal(entry.credit));
    }, new Decimal(0));
  }

  /**
   * Get difference between debit and credit (should be 0 if balanced)
   */
  public getDifference(): Decimal {
    return this.getTotalDebit().minus(this.getTotalCredit());
  }

  /**
   * Validate journal entries
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check minimum entries
    if (this.entries.length < 2) {
      errors.push('Journal must have at least 2 entries');
    }

    // Check each entry has either debit or credit (not both non-zero)
    this.entries.forEach((entry, index) => {
      const debit = new Decimal(entry.debit);
      const credit = new Decimal(entry.credit);

      if (debit.isZero() && credit.isZero()) {
        errors.push(`Entry ${index + 1}: Must have either debit or credit amount`);
      }

      if (!debit.isZero() && !credit.isZero()) {
        errors.push(`Entry ${index + 1}: Cannot have both debit and credit amounts`);
      }

      if (debit.isNegative() || credit.isNegative()) {
        errors.push(`Entry ${index + 1}: Amounts cannot be negative`);
      }
    });

    // Check balance
    if (!this.isBalanced()) {
      errors.push(
        `Journal is not balanced. Difference: ${this.getDifference().toString()}`
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get entries
   */
  public getEntries(): JournalEntryDTO[] {
    return this.entries;
  }

  /**
   * Create reversing entries
   */
  public createReversingEntries(): JournalEntryDTO[] {
    return this.entries.map(entry => ({
      ...entry,
      debit: entry.credit, // Swap debit and credit
      credit: entry.debit,
      description: `Reversing: ${entry.description || ''}`.trim(),
    }));
  }
}

