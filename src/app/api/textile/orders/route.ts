import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    // Mock data for pending orders
    const pendingSauda = [
      {
        id: 'ORD001',
        date: '2024-01-20',
        quality: 'Cotton - Premium',
        buyer: 'Buyer Corp A',
        mfg: 'Mfg Co X',
        pending: 500,
        unit: 'kg'
      }
    ];

    // Mock data for completed orders
    const completedSauda = [
      {
        id: 'ORD002',
        date: '2024-01-10',
        quality: 'Polyester - Standard',
        buyer: 'Buyer Corp B',
        mfg: 'Mfg Co X',
        pending: 1000,
        unit: 'kg'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        pendingSauda,
        completedSauda
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate order data
    if (!data.quality || !data.buyer || !data.mfg || !data.pending) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In a real app, save to database
    const newOrder = {
      id: 'ORD' + Date.now().toString().slice(-6),
      ...data,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date()
    };

    return NextResponse.json({
      success: true,
      data: newOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
