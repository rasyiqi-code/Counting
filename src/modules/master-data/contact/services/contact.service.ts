import { prisma } from '@/shared/database/prisma';
import { CreateContactInput, UpdateContactInput, GetContactsInput } from '../types';

/**
 * Contact Service
 * Mengelola Customers, Vendors, dan Employees
 */
export class ContactService {
  /**
   * Generate contact code
   * Format: CUS-0001, VEN-0001, EMP-0001
   */
  private async generateCode(companyId: string, type: string): Promise<string> {
    const prefix = type === 'CUSTOMER' ? 'CUS' : type === 'VENDOR' ? 'VEN' : 'EMP';
    
    const lastContact = await prisma.contact.findFirst({
      where: {
        companyId,
        type,
      },
      orderBy: {
        code: 'desc',
      },
    });

    let sequence = 1;
    if (lastContact && lastContact.code.startsWith(prefix)) {
      const lastSequence = parseInt(lastContact.code.split('-')[1]);
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}-${sequence.toString().padStart(4, '0')}`;
  }

  /**
   * Create new contact
   */
  async createContact(companyId: string, input: CreateContactInput) {
    // Generate code
    const code = await this.generateCode(companyId, input.type);

    // Validate email uniqueness if provided
    if (input.email) {
      const existing = await prisma.contact.findFirst({
        where: {
          companyId,
          email: input.email,
          isActive: true,
        },
      });

      if (existing) {
        throw new Error(`Email ${input.email} already exists`);
      }
    }

    const contact = await prisma.contact.create({
      data: {
        companyId,
        code,
        ...input,
      },
    });

    return contact;
  }

  /**
   * Update contact
   */
  async updateContact(companyId: string, input: UpdateContactInput) {
    const { id, ...data } = input;

    // Check if contact exists
    const contact = await prisma.contact.findFirst({
      where: {
        id,
        companyId,
      },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Validate email uniqueness if updating email
    if (data.email && data.email !== contact.email) {
      const existing = await prisma.contact.findFirst({
        where: {
          companyId,
          email: data.email,
          isActive: true,
          id: { not: id },
        },
      });

      if (existing) {
        throw new Error(`Email ${data.email} already exists`);
      }
    }

    const updated = await prisma.contact.update({
      where: { id },
      data,
    });

    return updated;
  }

  /**
   * Delete contact (soft delete)
   */
  async deleteContact(companyId: string, contactId: string) {
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        companyId,
      },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    // Check if contact has transactions
    const hasInvoices = await prisma.invoice.findFirst({
      where: {
        contactId,
      },
      take: 1,
    });

    if (hasInvoices) {
      throw new Error('Cannot delete contact with existing transactions');
    }

    // Soft delete
    await prisma.contact.update({
      where: { id: contactId },
      data: { isActive: false },
    });

    return { success: true };
  }

  /**
   * Get contact by ID
   */
  async getContactById(companyId: string, contactId: string) {
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        companyId,
      },
    });

    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  }

  /**
   * Get contacts with pagination and filters
   */
  async getContacts(companyId: string, input: GetContactsInput) {
    const { type, search, page = 1, limit = 20 } = input;

    const where: any = {
      companyId,
      isActive: true,
    };

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        orderBy: {
          code: 'asc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.contact.count({ where }),
    ]);

    return {
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Search contacts (for dropdowns)
   */
  async searchContacts(companyId: string, query: string, type?: string) {
    const where: any = {
      companyId,
      isActive: true,
      OR: [
        { code: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (type) {
      where.type = type;
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      take: 20,
    });

    return contacts;
  }

  /**
   * Get customer AR aging (Accounts Receivable)
   */
  async getCustomerARaging(companyId: string, customerId: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        contactId: customerId,
        type: 'SALES',
        status: {
          in: ['SENT', 'PARTIAL_PAID', 'OVERDUE'],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const today = new Date();
    const aging = {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      over90: 0,
      total: 0,
    };

    for (const invoice of invoices) {
      const balance = parseFloat(invoice.total.toString()) - parseFloat(invoice.paidAmount.toString());
      const daysPastDue = Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPastDue <= 0) {
        aging.current += balance;
      } else if (daysPastDue <= 30) {
        aging.days1_30 += balance;
      } else if (daysPastDue <= 60) {
        aging.days31_60 += balance;
      } else if (daysPastDue <= 90) {
        aging.days61_90 += balance;
      } else {
        aging.over90 += balance;
      }

      aging.total += balance;
    }

    return aging;
  }

  /**
   * Get vendor AP aging (Accounts Payable)
   */
  async getVendorAPaging(companyId: string, vendorId: string) {
    const invoices = await prisma.invoice.findMany({
      where: {
        companyId,
        contactId: vendorId,
        type: 'PURCHASE',
        status: {
          in: ['SENT', 'PARTIAL_PAID', 'OVERDUE'],
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    const today = new Date();
    const aging = {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      over90: 0,
      total: 0,
    };

    for (const invoice of invoices) {
      const balance = parseFloat(invoice.total.toString()) - parseFloat(invoice.paidAmount.toString());
      const daysPastDue = Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysPastDue <= 0) {
        aging.current += balance;
      } else if (daysPastDue <= 30) {
        aging.days1_30 += balance;
      } else if (daysPastDue <= 60) {
        aging.days31_60 += balance;
      } else if (daysPastDue <= 90) {
        aging.days61_90 += balance;
      } else {
        aging.over90 += balance;
      }

      aging.total += balance;
    }

    return aging;
  }
}

export const contactService = new ContactService();

