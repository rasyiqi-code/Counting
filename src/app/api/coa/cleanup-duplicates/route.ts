import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/shared/database/prisma';

export async function GET(request: NextRequest) {
  try {
    // Ambil semua akun COA
    const accounts = await prisma.chartOfAccount.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // Deteksi duplikat berdasarkan kode dan nama
    const duplicates = new Map<string, any[]>();
    const duplicateGroups: any[] = [];

    accounts.forEach(account => {
      const key = `${account.code.toLowerCase()}-${account.name.toLowerCase()}`;
      if (!duplicates.has(key)) {
        duplicates.set(key, []);
      }
      duplicates.get(key)!.push(account);
    });

    // Filter hanya yang benar-benar duplikat (lebih dari 1)
    duplicates.forEach((group, key) => {
      if (group.length > 1) {
        duplicateGroups.push({
          key,
          accounts: group,
          count: group.length
        });
      }
    });

    return NextResponse.json({
      success: true,
      duplicates: duplicateGroups,
      totalDuplicates: duplicateGroups.reduce((sum, group) => sum + group.count, 0),
      totalGroups: duplicateGroups.length
    });

  } catch (error: any) {
    console.error('Error detecting duplicates:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { keepIds } = await request.json();

    if (!keepIds || !Array.isArray(keepIds)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid keepIds data' 
      }, { status: 400 });
    }

    // Hapus semua akun kecuali yang dipilih untuk disimpan
    const result = await prisma.chartOfAccount.deleteMany({
      where: {
        id: {
          notIn: keepIds
        }
      }
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Berhasil menghapus ${result.count} akun duplikat`
    });

  } catch (error: any) {
    console.error('Error deleting duplicates:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
