import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for invoices
    const invoices = [
      {
        id: '1',
        invoice: 'INV001',
        date: '2024-01-15',
        buyer: 'Buyer Corp A',
        mfg: 'Mfg Co X',
        amount: 50000,
        due: '2024-02-15',
        status: 'UNPAID',
        ageing: 5
      },
      {
        id: '2',
        invoice: 'INV002',
        date: '2024-01-10',
        buyer: 'Buyer Corp B',
        mfg: 'Mfg Co X',
        amount: 75000,
        due: '2024-02-10',
        status: 'UNPAID',
        ageing: 10
      }
    ];

    return NextResponse.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate invoice data
    if (!data.invoice || !data.buyer || !data.amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real app, save to database
    const newInvoice = {
      id: Date.now().toString(),
      ...data,
      status: 'UNPAID',
      ageing: 0,
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: newInvoice
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
