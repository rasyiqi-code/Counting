import { prisma } from '@/shared/database/prisma';
import { UpdateCompanyInput } from '../types';

/**
 * Company Service
 * 
 * Mengelola informasi perusahaan
 */
export class CompanyService {
  /**
   * Get company info
   */
  async getCompany(companyId: string) {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    return company;
  }

  /**
   * Update company info
   */
  async updateCompany(companyId: string, input: UpdateCompanyInput) {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: input,
    });

    return company;
  }
}

export const companyService = new CompanyService();

